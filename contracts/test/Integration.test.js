const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("MyScorePass - Integration Tests", function () {
    // Fixture to deploy all contracts
    async function deployAllContractsFixture() {
        const [owner, user1, user2, user3] = await ethers.getSigners();

        // Deploy IdentityRegistry
        const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
        const identityRegistry = await IdentityRegistry.deploy();
        await identityRegistry.waitForDeployment();

        // Deploy CreditScoringMini
        const CreditScoringMini = await ethers.getContractFactory("CreditScoringMini");
        const creditScoring = await CreditScoringMini.deploy();
        await creditScoring.waitForDeployment();

        // Deploy MyScorePassSBT
        const MyScorePassSBT = await ethers.getContractFactory("MyScorePassSBT");
        const sbt = await MyScorePassSBT.deploy();
        await sbt.waitForDeployment();

        return { identityRegistry, creditScoring, sbt, owner, user1, user2, user3 };
    }

    describe("Complete User Journey", function () {
        it("Should complete full onboarding and scoring flow", async function () {
            const { identityRegistry, creditScoring, sbt, owner, user1 } =
                await loadFixture(deployAllContractsFixture);

            // Step 1: User creates identity
            await identityRegistry.connect(user1).createIdentity("QmUserDocument123");

            let identity = await identityRegistry.getIdentity(user1.address);
            expect(identity.isVerified).to.be.false;
            expect(identity.verificationLevel).to.equal(0);

            // Step 2: Admin verifies identity
            await identityRegistry.connect(owner).verifyIdentity(user1.address, 2);

            identity = await identityRegistry.getIdentity(user1.address);
            expect(identity.isVerified).to.be.true;
            expect(identity.verificationLevel).to.equal(2);

            // Step 3: Calculate initial credit score
            await creditScoring.connect(user1).calculateInitialScore(user1.address);

            let score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(300);
            expect(score.maxLoanAmount).to.equal(300 * 10 ** 6);

            // Step 4: Mint SBT with score
            const scoreHash = ethers.keccak256(
                ethers.AbiCoder.defaultAbiCoder().encode(
                    ["uint256", "uint256"],
                    [score.score, score.lastUpdated]
                )
            );

            await sbt.connect(owner).mintSBT(
                user1.address,
                scoreHash,
                Number(score.score),
                identity.verificationLevel
            );

            expect(await sbt.hasActiveSBT(user1.address)).to.be.true;

            // Step 5: Verify SBT
            const userSBT = await sbt.getUserSBT(user1.address);
            expect(userSBT.score).to.equal(300);
            expect(userSBT.verificationLevel).to.equal(2);
            expect(await sbt.verifySBT(user1.address, 2)).to.be.true;
        });

        it("Should handle score improvement and SBT update", async function () {
            const { identityRegistry, creditScoring, sbt, owner, user1 } =
                await loadFixture(deployAllContractsFixture);

            // Initial setup
            await identityRegistry.connect(user1).createIdentity("QmDoc1");
            await identityRegistry.connect(owner).verifyIdentity(user1.address, 1);
            await creditScoring.connect(user1).calculateInitialScore(user1.address);

            // Mint initial SBT
            await sbt.connect(owner).mintSBT(user1.address, ethers.ZeroHash, 300, 1);

            // Improve score
            await creditScoring.connect(owner).rewardScore(user1.address, 200);

            let score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(500);

            // Update verification level
            await identityRegistry.connect(owner).verifyIdentity(user1.address, 3);

            // Update SBT
            await sbt.connect(owner).mintSBT(user1.address, ethers.ZeroHash, 500, 3);

            const userSBT = await sbt.getUserSBT(user1.address);
            expect(userSBT.score).to.equal(500);
            expect(userSBT.verificationLevel).to.equal(3);
            expect(await sbt.verifySBT(user1.address, 3)).to.be.true;
        });

        it("Should handle score degradation and blacklist", async function () {
            const { identityRegistry, creditScoring, sbt, owner, user1 } =
                await loadFixture(deployAllContractsFixture);

            // Initial setup
            await identityRegistry.connect(user1).createIdentity("QmDoc1");
            await identityRegistry.connect(owner).verifyIdentity(user1.address, 2);
            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            await sbt.connect(owner).mintSBT(user1.address, ethers.ZeroHash, 300, 2);

            // Penalize score to zero
            await creditScoring.connect(owner).penalizeScore(user1.address, 300);

            let score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(0);
            expect(await creditScoring.isBlacklisted(user1.address)).to.be.true;

            // Update SBT to reflect new score
            await sbt.connect(owner).mintSBT(user1.address, ethers.ZeroHash, 0, 2);

            const userSBT = await sbt.getUserSBT(user1.address);
            expect(userSBT.score).to.equal(0);
        });
    });

    describe("Multi-User Scenarios", function () {
        it("Should handle multiple users with different verification levels", async function () {
            const { identityRegistry, creditScoring, sbt, owner, user1, user2, user3 } =
                await loadFixture(deployAllContractsFixture);

            // User 1: Basic verification (level 1)
            await identityRegistry.connect(user1).createIdentity("QmDoc1");
            await identityRegistry.connect(owner).verifyIdentity(user1.address, 1);
            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            await sbt.connect(owner).mintSBT(user1.address, ethers.ZeroHash, 300, 1);

            // User 2: Medium verification (level 2)
            await identityRegistry.connect(user2).createIdentity("QmDoc2");
            await identityRegistry.connect(owner).verifyIdentity(user2.address, 2);
            await creditScoring.connect(user2).calculateInitialScore(user2.address);
            await creditScoring.connect(owner).rewardScore(user2.address, 200);
            await sbt.connect(owner).mintSBT(user2.address, ethers.ZeroHash, 500, 2);

            // User 3: Full verification (level 3)
            await identityRegistry.connect(user3).createIdentity("QmDoc3");
            await identityRegistry.connect(owner).verifyIdentity(user3.address, 3);
            await creditScoring.connect(user3).calculateInitialScore(user3.address);
            await creditScoring.connect(owner).rewardScore(user3.address, 700);
            await sbt.connect(owner).mintSBT(user3.address, ethers.ZeroHash, 1000, 3);

            // Verify all users
            expect(await sbt.verifySBT(user1.address, 1)).to.be.true;
            expect(await sbt.verifySBT(user2.address, 2)).to.be.true;
            expect(await sbt.verifySBT(user3.address, 3)).to.be.true;

            // Check scores
            const score1 = await creditScoring.getScore(user1.address);
            const score2 = await creditScoring.getScore(user2.address);
            const score3 = await creditScoring.getScore(user3.address);

            expect(score1.score).to.equal(300);
            expect(score2.score).to.equal(500);
            expect(score3.score).to.equal(1000);
        });

        it("Should maintain independent state for each user", async function () {
            const { identityRegistry, creditScoring, sbt, owner, user1, user2 } =
                await loadFixture(deployAllContractsFixture);

            // Setup both users
            await identityRegistry.connect(user1).createIdentity("QmDoc1");
            await identityRegistry.connect(user2).createIdentity("QmDoc2");

            await identityRegistry.connect(owner).verifyIdentity(user1.address, 1);
            await identityRegistry.connect(owner).verifyIdentity(user2.address, 2);

            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            await creditScoring.connect(user2).calculateInitialScore(user2.address);

            // Modify user1's score
            await creditScoring.connect(owner).rewardScore(user1.address, 100);

            // Verify user2's score is unchanged
            const score1 = await creditScoring.getScore(user1.address);
            const score2 = await creditScoring.getScore(user2.address);

            expect(score1.score).to.equal(400);
            expect(score2.score).to.equal(300);

            // Verify identities are independent
            const identity1 = await identityRegistry.getIdentity(user1.address);
            const identity2 = await identityRegistry.getIdentity(user2.address);

            expect(identity1.verificationLevel).to.equal(1);
            expect(identity2.verificationLevel).to.equal(2);
        });
    });

    describe("Access Control Integration", function () {
        it("Should enforce owner-only functions across contracts", async function () {
            const { identityRegistry, creditScoring, sbt, user1, user2 } =
                await loadFixture(deployAllContractsFixture);

            // Setup user1
            await identityRegistry.connect(user1).createIdentity("QmDoc1");
            await creditScoring.connect(user1).calculateInitialScore(user1.address);

            // User2 should not be able to verify identity
            await expect(
                identityRegistry.connect(user2).verifyIdentity(user1.address, 1)
            ).to.be.revertedWith("Only owner");

            // User2 should not be able to reward score
            await expect(
                creditScoring.connect(user2).rewardScore(user1.address, 100)
            ).to.be.revertedWithCustomError(creditScoring, "OwnableUnauthorizedAccount");

            // User2 should not be able to mint SBT
            await expect(
                sbt.connect(user2).mintSBT(user1.address, ethers.ZeroHash, 300, 1)
            ).to.be.revertedWithCustomError(sbt, "OwnableUnauthorizedAccount");
        });
    });

    describe("Document and Score Hash Verification", function () {
        it("Should create verifiable score hash", async function () {
            const { creditScoring, sbt, owner, user1 } =
                await loadFixture(deployAllContractsFixture);

            // Calculate score
            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            const score = await creditScoring.getScore(user1.address);

            // Create hash of score data
            const scoreHash = ethers.keccak256(
                ethers.AbiCoder.defaultAbiCoder().encode(
                    ["uint256", "uint256", "uint256"],
                    [score.score, score.maxLoanAmount, score.lastUpdated]
                )
            );

            // Mint SBT with hash
            await sbt.connect(owner).mintSBT(user1.address, scoreHash, Number(score.score), 1);

            // Verify hash is stored correctly
            const metadata = await sbt.getSBTMetadata(1);
            expect(metadata.scoreHash).to.equal(scoreHash);

            // Verify we can recreate the hash
            const recreatedHash = ethers.keccak256(
                ethers.AbiCoder.defaultAbiCoder().encode(
                    ["uint256", "uint256", "uint256"],
                    [score.score, score.maxLoanAmount, score.lastUpdated]
                )
            );

            expect(metadata.scoreHash).to.equal(recreatedHash);
        });

        it("Should handle document additions and verification", async function () {
            const { identityRegistry, owner, user1 } =
                await loadFixture(deployAllContractsFixture);

            // Create identity with initial document
            await identityRegistry.connect(user1).createIdentity("QmInitialDoc");

            // Add multiple documents
            await identityRegistry.connect(user1).addDocument("QmPayStub1");
            await identityRegistry.connect(user1).addDocument("QmPayStub2");
            await identityRegistry.connect(user1).addDocument("QmBankStatement");

            const identity = await identityRegistry.getIdentity(user1.address);
            expect(identity.documentCount).to.equal(4);

            // Verify all documents
            expect(await identityRegistry.getDocument(user1.address, 0)).to.equal("QmInitialDoc");
            expect(await identityRegistry.getDocument(user1.address, 1)).to.equal("QmPayStub1");
            expect(await identityRegistry.getDocument(user1.address, 2)).to.equal("QmPayStub2");
            expect(await identityRegistry.getDocument(user1.address, 3)).to.equal("QmBankStatement");

            // Verify identity with high level
            await identityRegistry.connect(owner).verifyIdentity(user1.address, 3);
            expect(await identityRegistry.getVerificationLevel(user1.address)).to.equal(3);
        });
    });

    describe("Edge Cases and Error Handling", function () {
        it("Should handle user without identity trying to get score", async function () {
            const { creditScoring, user1 } = await loadFixture(deployAllContractsFixture);

            // User can calculate score without identity (contracts are independent)
            await creditScoring.connect(user1).calculateInitialScore(user1.address);

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(300);
        });

        it("Should handle SBT minting without identity verification", async function () {
            const { sbt, owner, user1 } = await loadFixture(deployAllContractsFixture);

            // Can mint SBT even without identity (contracts are independent)
            await sbt.connect(owner).mintSBT(user1.address, ethers.ZeroHash, 300, 1);

            expect(await sbt.hasActiveSBT(user1.address)).to.be.true;
        });

        it("Should handle complete workflow with maximum values", async function () {
            const { identityRegistry, creditScoring, sbt, owner, user1 } =
                await loadFixture(deployAllContractsFixture);

            // Maximum verification level
            await identityRegistry.connect(user1).createIdentity("QmDoc");
            await identityRegistry.connect(owner).verifyIdentity(user1.address, 3);

            // Maximum score
            await creditScoring.connect(user1).calculateInitialScore(user1.address);
            await creditScoring.connect(owner).rewardScore(user1.address, 700);

            const score = await creditScoring.getScore(user1.address);
            expect(score.score).to.equal(1000);

            // Mint SBT with maximum values
            await sbt.connect(owner).mintSBT(user1.address, ethers.ZeroHash, 1000, 3);

            const userSBT = await sbt.getUserSBT(user1.address);
            expect(userSBT.score).to.equal(1000);
            expect(userSBT.verificationLevel).to.equal(3);
        });
    });

    describe("Gas Efficiency", function () {
        it("Should be gas efficient for complete user onboarding", async function () {
            const { identityRegistry, creditScoring, sbt, owner, user1 } =
                await loadFixture(deployAllContractsFixture);

            const tx1 = await identityRegistry.connect(user1).createIdentity("QmDoc");
            const receipt1 = await tx1.wait();

            const tx2 = await identityRegistry.connect(owner).verifyIdentity(user1.address, 2);
            const receipt2 = await tx2.wait();

            const tx3 = await creditScoring.connect(user1).calculateInitialScore(user1.address);
            const receipt3 = await tx3.wait();

            const tx4 = await sbt.connect(owner).mintSBT(user1.address, ethers.ZeroHash, 300, 2);
            const receipt4 = await tx4.wait();

            const totalGas = receipt1.gasUsed + receipt2.gasUsed + receipt3.gasUsed + receipt4.gasUsed;

            // Total gas should be reasonable (adjust threshold as needed)
            expect(totalGas).to.be.lt(700000);
        });
    });

    describe("Contract Addresses and Deployment", function () {
        it("Should have different addresses for each contract", async function () {
            const { identityRegistry, creditScoring, sbt } =
                await loadFixture(deployAllContractsFixture);

            const addr1 = await identityRegistry.getAddress();
            const addr2 = await creditScoring.getAddress();
            const addr3 = await sbt.getAddress();

            expect(addr1).to.not.equal(addr2);
            expect(addr2).to.not.equal(addr3);
            expect(addr1).to.not.equal(addr3);
        });

        it("Should have same owner for all contracts", async function () {
            const { identityRegistry, creditScoring, sbt, owner } =
                await loadFixture(deployAllContractsFixture);

            expect(await identityRegistry.owner()).to.equal(owner.address);
            expect(await creditScoring.owner()).to.equal(owner.address);
            expect(await sbt.owner()).to.equal(owner.address);
        });
    });
});
