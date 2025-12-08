const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("CreditScoringMini", function () {
    // Fixture to deploy contract before each test
    async function deployCreditScoringFixture() {
        const [owner, user1, user2, user3] = await ethers.getSigners();

        const CreditScoringMini = await ethers.getContractFactory("CreditScoringMini");
        const creditScoring = await CreditScoringMini.deploy();
        await creditScoring.waitForDeployment();

        return { creditScoring, owner, user1, user2, user3 };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { creditScoring, owner } = await loadFixture(deployCreditScoringFixture);
            expect(await creditScoring.owner()).to.equal(owner.address);
        });

        it("Should start with no scores", async function () {
            const { creditScoring, user1 } = await loadFixture(deployCreditScoringFixture);
            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(0);
            expect(score.maxLoanAmount).to.equal(0);
            expect(score.lastUpdated).to.equal(0);
        });
    });

    describe("Initial Score Calculation", function () {
        it("Should calculate initial score of 300", async function () {
            const { creditScoring, user1 } = await loadFixture(deployCreditScoringFixture);

            await expect(creditScoring.connect(user1).calculateInitialScore(user1.address))
                .to.emit(creditScoring, "ScoreUpdated")
                .withArgs(user1.address, 300, 300 * 10 ** 6, "Initial Calculation");

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(300);
            expect(score.maxLoanAmount).to.equal(300 * 10 ** 6);
        });

        it("Should allow anyone to calculate initial score for any address", async function () {
            const { creditScoring, user1, user2 } = await loadFixture(deployCreditScoringFixture);

            // User2 calculates score for User1
            await creditScoring.connect(user2).calculateInitialScore(user1.address);

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(300);
        });

        it("Should update lastUpdated timestamp", async function () {
            const { creditScoring, user1 } = await loadFixture(deployCreditScoringFixture);

            const tx = await creditScoring.connect(user1).calculateInitialScore(user1.address);
            const receipt = await tx.wait();
            const block = await ethers.provider.getBlock(receipt.blockNumber);

            const score = await creditScoring.getScore(user1.address);
            expect(score.lastUpdated).to.equal(block.timestamp);
        });

        it("Should allow recalculating score (overwrite)", async function () {
            const { creditScoring, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            await creditScoring.connect(user1).calculateInitialScore(user1.address);

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(300);
        });
    });

    describe("Reward Score", function () {
        it("Should allow owner to reward score", async function () {
            const { creditScoring, owner, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);

            await expect(creditScoring.connect(owner).rewardScore(user1.address, 100))
                .to.emit(creditScoring, "ScoreUpdated")
                .withArgs(user1.address, 400, 400 * 10 ** 6, "Reward");

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(400);
            expect(score.maxLoanAmount).to.equal(400 * 10 ** 6);
        });

        it("Should cap score at 1000", async function () {
            const { creditScoring, owner, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            await creditScoring.connect(owner).rewardScore(user1.address, 800);

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(1000); // Capped at 1000
        });

        it("Should update maxLoan based on new score", async function () {
            const { creditScoring, owner, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            await creditScoring.connect(owner).rewardScore(user1.address, 200);

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(500);
            expect(score.maxLoanAmount).to.equal(500 * 10 ** 6);
        });

        it("Should revert if non-owner tries to reward", async function () {
            const { creditScoring, user1, user2 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);

            await expect(
                creditScoring.connect(user2).rewardScore(user1.address, 100)
            ).to.be.revertedWithCustomError(creditScoring, "OwnableUnauthorizedAccount");
        });

        it("Should allow rewarding user with no initial score", async function () {
            const { creditScoring, owner, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(owner).rewardScore(user1.address, 500);

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(500);
        });
    });

    describe("Penalize Score", function () {
        it("Should allow owner to penalize score", async function () {
            const { creditScoring, owner, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);

            await expect(creditScoring.connect(owner).penalizeScore(user1.address, 50))
                .to.emit(creditScoring, "ScoreUpdated")
                .withArgs(user1.address, 250, 300 * 10 ** 6, "Penalty");

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(250);
        });

        it("Should floor score at 0", async function () {
            const { creditScoring, owner, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            await creditScoring.connect(owner).penalizeScore(user1.address, 500);

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(0);
        });

        it("Should blacklist user when score reaches 0", async function () {
            const { creditScoring, owner, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);

            await expect(creditScoring.connect(owner).penalizeScore(user1.address, 300))
                .to.emit(creditScoring, "UserBlacklisted")
                .withArgs(user1.address);

            expect(await creditScoring.isBlacklisted(user1.address)).to.be.true;
        });

        it("Should not blacklist if score is above 0", async function () {
            const { creditScoring, owner, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            await creditScoring.connect(owner).penalizeScore(user1.address, 50);

            expect(await creditScoring.isBlacklisted(user1.address)).to.be.false;
        });

        it("Should revert if non-owner tries to penalize", async function () {
            const { creditScoring, user1, user2 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);

            await expect(
                creditScoring.connect(user2).penalizeScore(user1.address, 50)
            ).to.be.revertedWithCustomError(creditScoring, "OwnableUnauthorizedAccount");
        });

        it("Should keep maxLoan unchanged after penalty", async function () {
            const { creditScoring, owner, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            const scoreBefore = await creditScoring.getScore(user1.address);

            await creditScoring.connect(owner).penalizeScore(user1.address, 50);

            const scoreAfter = await creditScoring.getScore(user1.address);
            expect(scoreAfter.maxLoanAmount).to.equal(scoreBefore.maxLoanAmount);
        });
    });

    describe("Blacklist Management", function () {
        it("Should return false for non-blacklisted users", async function () {
            const { creditScoring, user1 } = await loadFixture(deployCreditScoringFixture);

            expect(await creditScoring.isBlacklisted(user1.address)).to.be.false;
        });

        it("Should return true for blacklisted users", async function () {
            const { creditScoring, owner, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            await creditScoring.connect(owner).penalizeScore(user1.address, 300);

            expect(await creditScoring.isBlacklisted(user1.address)).to.be.true;
        });

        it("Should allow blacklisted user to improve score via reward", async function () {
            const { creditScoring, owner, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            await creditScoring.connect(owner).penalizeScore(user1.address, 300);

            expect(await creditScoring.isBlacklisted(user1.address)).to.be.true;

            // Reward to get out of blacklist
            await creditScoring.connect(owner).rewardScore(user1.address, 400);

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(400);
            // Note: Blacklist status doesn't auto-clear, this is by design
        });
    });

    describe("Score Queries", function () {
        it("Should return correct score data", async function () {
            const { creditScoring, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(300);
            expect(score.maxLoanAmount).to.equal(300 * 10 ** 6);
            expect(score.lastUpdated).to.be.gt(0);
        });

        it("Should return zero values for users without scores", async function () {
            const { creditScoring, user1 } = await loadFixture(deployCreditScoringFixture);

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(0);
            expect(score.maxLoanAmount).to.equal(0);
            expect(score.lastUpdated).to.equal(0);
        });
    });

    describe("Edge Cases", function () {
        it("Should handle multiple users with different scores", async function () {
            const { creditScoring, owner, user1, user2, user3 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            await creditScoring.connect(user2).calculateInitialScore(user2.address);
            await creditScoring.connect(user3).calculateInitialScore(user3.address);

            await creditScoring.connect(owner).rewardScore(user1.address, 100);
            await creditScoring.connect(owner).penalizeScore(user2.address, 50);

            const score1 = await creditScoring.getScore(user1.address);
            const score2 = await creditScoring.getScore(user2.address);
            const score3 = await creditScoring.getScore(user3.address);

            expect(score1.score).to.equal(400);
            expect(score2.score).to.equal(250);
            expect(score3.score).to.equal(300);
        });

        it("Should handle reward then penalty correctly", async function () {
            const { creditScoring, owner, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            await creditScoring.connect(owner).rewardScore(user1.address, 200); // 500
            await creditScoring.connect(owner).penalizeScore(user1.address, 100); // 400

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(400);
        });

        it("Should handle penalty then reward correctly", async function () {
            const { creditScoring, owner, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            await creditScoring.connect(owner).penalizeScore(user1.address, 100); // 200
            await creditScoring.connect(owner).rewardScore(user1.address, 300); // 500

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(500);
        });

        it("Should handle exact penalty to reach 0", async function () {
            const { creditScoring, owner, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            await creditScoring.connect(owner).penalizeScore(user1.address, 300);

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(0);
            expect(await creditScoring.isBlacklisted(user1.address)).to.be.true;
        });

        it("Should handle exact reward to reach 1000", async function () {
            const { creditScoring, owner, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            await creditScoring.connect(owner).rewardScore(user1.address, 700);

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(1000);
            expect(score.maxLoanAmount).to.equal(1000 * 10 ** 6);
        });

        it("Should update timestamp on each operation", async function () {
            const { creditScoring, owner, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            const score1 = await creditScoring.getScore(user1.address);

            // Wait a bit (simulate time passing with a new block)
            await ethers.provider.send("evm_mine");

            await creditScoring.connect(owner).rewardScore(user1.address, 100);
            const score2 = await creditScoring.getScore(user1.address);

            expect(score2.lastUpdated).to.be.gt(score1.lastUpdated);
        });
    });

    describe("Gas Optimization Tests", function () {
        it("Should be gas efficient for score calculation", async function () {
            const { creditScoring, user1 } = await loadFixture(deployCreditScoringFixture);

            const tx = await creditScoring.connect(user1).calculateInitialScore(user1.address);
            const receipt = await tx.wait();

            // Gas should be reasonable (adjust threshold as needed)
            expect(receipt.gasUsed).to.be.lt(100000);
        });

        it("Should be gas efficient for rewards", async function () {
            const { creditScoring, owner, user1 } = await loadFixture(deployCreditScoringFixture);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);

            const tx = await creditScoring.connect(owner).rewardScore(user1.address, 100);
            const receipt = await tx.wait();

            expect(receipt.gasUsed).to.be.lt(100000);
        });
    });
});
