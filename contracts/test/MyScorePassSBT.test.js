const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("MyScorePassSBT", function () {
    // Fixture to deploy contract before each test
    async function deploySBTFixture() {
        const [owner, user1, user2, user3] = await ethers.getSigners();

        const MyScorePassSBT = await ethers.getContractFactory("MyScorePassSBT");
        const sbt = await MyScorePassSBT.deploy();
        await sbt.waitForDeployment();

        return { sbt, owner, user1, user2, user3 };
    }

    const MOCK_SCORE_HASH = ethers.keccak256(ethers.toUtf8Bytes("score_data_123"));
    const SCORE = 750;
    const LEVEL = 2;

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { sbt, owner } = await loadFixture(deploySBTFixture);
            expect(await sbt.owner()).to.equal(owner.address);
        });

        it("Should set correct name and symbol", async function () {
            const { sbt } = await loadFixture(deploySBTFixture);
            expect(await sbt.name()).to.equal("MyScorePass SBT");
            expect(await sbt.symbol()).to.equal("MSP");
        });

        it("Should start with zero total supply", async function () {
            const { sbt } = await loadFixture(deploySBTFixture);
            expect(await sbt.totalSupply()).to.equal(0);
        });
    });

    describe("Minting SBT", function () {
        it("Should allow owner to mint SBT", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await expect(sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL))
                .to.emit(sbt, "SBTMinted")
                .withArgs(user1.address, 1, MOCK_SCORE_HASH, SCORE, LEVEL);

            expect(await sbt.balanceOf(user1.address)).to.equal(1);
            expect(await sbt.ownerOf(1)).to.equal(user1.address);
            expect(await sbt.totalSupply()).to.equal(1);
        });

        it("Should increment token ID for each mint", async function () {
            const { sbt, owner, user1, user2 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);
            await sbt.connect(owner).mintSBT(user2.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            expect(await sbt.ownerOf(1)).to.equal(user1.address);
            expect(await sbt.ownerOf(2)).to.equal(user2.address);
            expect(await sbt.totalSupply()).to.equal(2);
        });

        it("Should mark user as having active SBT", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            expect(await sbt.hasActiveSBT(user1.address)).to.be.false;

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            expect(await sbt.hasActiveSBT(user1.address)).to.be.true;
        });

        it("Should store correct metadata", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            const tx = await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);
            const receipt = await tx.wait();
            const block = await ethers.provider.getBlock(receipt.blockNumber);

            const metadata = await sbt.getSBTMetadata(1);
            expect(metadata.scoreHash).to.equal(MOCK_SCORE_HASH);
            expect(metadata.score).to.equal(SCORE);
            expect(metadata.verificationLevel).to.equal(LEVEL);
            expect(metadata.issuedAt).to.equal(block.timestamp);
            expect(metadata.expiresAt).to.equal(BigInt(block.timestamp) + 30n * 24n * 60n * 60n); // 30 days
            expect(metadata.issuer).to.equal(owner.address);
        });

        it("Should revert if non-owner tries to mint", async function () {
            const { sbt, user1, user2 } = await loadFixture(deploySBTFixture);

            await expect(
                sbt.connect(user1).mintSBT(user2.address, MOCK_SCORE_HASH, SCORE, LEVEL)
            ).to.be.revertedWithCustomError(sbt, "OwnableUnauthorizedAccount");
        });

        it("Should revert if minting to zero address", async function () {
            const { sbt, owner } = await loadFixture(deploySBTFixture);

            await expect(
                sbt.connect(owner).mintSBT(ethers.ZeroAddress, MOCK_SCORE_HASH, SCORE, LEVEL)
            ).to.be.revertedWith("Cannot mint to zero address");
        });

        it("Should revert if score exceeds 1000", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await expect(
                sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, 1001, LEVEL)
            ).to.be.revertedWith("Score must be <= 1000");
        });

        it("Should revert if verification level exceeds 3", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await expect(
                sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, 4)
            ).to.be.revertedWith("Verification level must be <= 3");
        });

        it("Should allow score of exactly 1000", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await expect(
                sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, 1000, LEVEL)
            ).to.not.be.reverted;
        });

        it("Should allow verification level of exactly 3", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await expect(
                sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, 3)
            ).to.not.be.reverted;
        });
    });

    describe("SBT Revocation and Re-minting", function () {
        it("Should revoke old SBT when minting new one to same user", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            const NEW_SCORE = 850;
            await expect(sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, NEW_SCORE, LEVEL))
                .to.emit(sbt, "SBTRevoked")
                .withArgs(user1.address, 1)
                .and.to.emit(sbt, "SBTMinted")
                .withArgs(user1.address, 2, MOCK_SCORE_HASH, NEW_SCORE, LEVEL);
        });

        it("Should maintain balance of 1 after re-minting", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);
            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, 850, LEVEL);

            expect(await sbt.balanceOf(user1.address)).to.equal(1);
        });

        it("Should update to new token ID after re-minting", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);
            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, 850, LEVEL);

            expect(await sbt.userToTokenId(user1.address)).to.equal(2);
            expect(await sbt.ownerOf(2)).to.equal(user1.address);
        });

        it("Should make old token non-existent after re-minting", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);
            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, 850, LEVEL);

            await expect(sbt.ownerOf(1)).to.be.revertedWithCustomError(sbt, "ERC721NonexistentToken");
        });

        it("Should update total supply correctly after re-minting", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);
            expect(await sbt.totalSupply()).to.equal(1);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, 850, LEVEL);
            expect(await sbt.totalSupply()).to.equal(2);
        });
    });

    describe("Soulbound Properties (Non-Transferability)", function () {
        beforeEach(async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);
            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);
            return { sbt, owner, user1 };
        });

        it("Should revert on transferFrom", async function () {
            const { sbt, user1, user2 } = await loadFixture(deploySBTFixture);
            await sbt.connect(await ethers.getSigner(await sbt.owner())).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            await expect(
                sbt.connect(user1).transferFrom(user1.address, user2.address, 1)
            ).to.be.revertedWith("SBT: Token is soulbound and cannot be transferred");
        });

        it("Should revert on safeTransferFrom", async function () {
            const { sbt, user1, user2 } = await loadFixture(deploySBTFixture);
            await sbt.connect(await ethers.getSigner(await sbt.owner())).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            await expect(
                sbt.connect(user1)["safeTransferFrom(address,address,uint256)"](user1.address, user2.address, 1)
            ).to.be.revertedWith("SBT: Token is soulbound and cannot be transferred");
        });

        it("Should allow approve but still block transfer", async function () {
            const { sbt, user1, user2 } = await loadFixture(deploySBTFixture);
            await sbt.connect(await ethers.getSigner(await sbt.owner())).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            // Approve should work
            await expect(
                sbt.connect(user1).approve(user2.address, 1)
            ).to.not.be.reverted;

            // But transfer should still fail
            await expect(
                sbt.connect(user2).transferFrom(user1.address, user2.address, 1)
            ).to.be.revertedWith("SBT: Token is soulbound and cannot be transferred");
        });

        it("Should allow setApprovalForAll but still block transfer", async function () {
            const { sbt, user1, user2 } = await loadFixture(deploySBTFixture);
            await sbt.connect(await ethers.getSigner(await sbt.owner())).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            // setApprovalForAll should work
            await expect(
                sbt.connect(user1).setApprovalForAll(user2.address, true)
            ).to.not.be.reverted;

            // But transfer should still fail
            await expect(
                sbt.connect(user2).transferFrom(user1.address, user2.address, 1)
            ).to.be.revertedWith("SBT: Token is soulbound and cannot be transferred");
        });
    });

    describe("Metadata Queries", function () {
        it("Should return correct SBT metadata", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            const metadata = await sbt.getSBTMetadata(1);
            expect(metadata.scoreHash).to.equal(MOCK_SCORE_HASH);
            expect(metadata.score).to.equal(SCORE);
            expect(metadata.verificationLevel).to.equal(LEVEL);
            expect(metadata.issuer).to.equal(owner.address);
        });

        it("Should return correct user SBT data", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            const userSBT = await sbt.getUserSBT(user1.address);
            expect(userSBT.tokenId).to.equal(1);
            expect(userSBT.scoreHash).to.equal(MOCK_SCORE_HASH);
            expect(userSBT.score).to.equal(SCORE);
            expect(userSBT.verificationLevel).to.equal(LEVEL);
        });

        it("Should revert when getting metadata of non-existent token", async function () {
            const { sbt } = await loadFixture(deploySBTFixture);

            await expect(
                sbt.getSBTMetadata(999)
            ).to.be.revertedWith("Token does not exist");
        });

        it("Should revert when getting SBT of user without active SBT", async function () {
            const { sbt, user1 } = await loadFixture(deploySBTFixture);

            await expect(
                sbt.getUserSBT(user1.address)
            ).to.be.revertedWith("User does not have active SBT");
        });
    });

    describe("SBT Verification", function () {
        it("Should verify SBT with sufficient level", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, 2);

            expect(await sbt.verifySBT(user1.address, 1)).to.be.true;
            expect(await sbt.verifySBT(user1.address, 2)).to.be.true;
        });

        it("Should fail verification with insufficient level", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, 1);

            expect(await sbt.verifySBT(user1.address, 2)).to.be.false;
            expect(await sbt.verifySBT(user1.address, 3)).to.be.false;
        });

        it("Should fail verification for user without SBT", async function () {
            const { sbt, user1 } = await loadFixture(deploySBTFixture);

            expect(await sbt.verifySBT(user1.address, 1)).to.be.false;
        });

        it("Should verify with level 0 requirement", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, 0);

            expect(await sbt.verifySBT(user1.address, 0)).to.be.true;
        });
    });

    describe("Edge Cases", function () {
        it("Should handle multiple users with different scores", async function () {
            const { sbt, owner, user1, user2, user3 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, 300, 1);
            await sbt.connect(owner).mintSBT(user2.address, MOCK_SCORE_HASH, 750, 2);
            await sbt.connect(owner).mintSBT(user3.address, MOCK_SCORE_HASH, 1000, 3);

            const sbt1 = await sbt.getUserSBT(user1.address);
            const sbt2 = await sbt.getUserSBT(user2.address);
            const sbt3 = await sbt.getUserSBT(user3.address);

            expect(sbt1.score).to.equal(300);
            expect(sbt2.score).to.equal(750);
            expect(sbt3.score).to.equal(1000);
        });

        it("Should handle minimum score (0)", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await expect(
                sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, 0, 0)
            ).to.not.be.reverted;

            const metadata = await sbt.getSBTMetadata(1);
            expect(metadata.score).to.equal(0);
        });

        it("Should handle maximum score (1000)", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, 1000, 3);

            const metadata = await sbt.getSBTMetadata(1);
            expect(metadata.score).to.equal(1000);
        });

        it("Should handle different score hashes", async function () {
            const { sbt, owner, user1, user2 } = await loadFixture(deploySBTFixture);

            const hash1 = ethers.keccak256(ethers.toUtf8Bytes("data1"));
            const hash2 = ethers.keccak256(ethers.toUtf8Bytes("data2"));

            await sbt.connect(owner).mintSBT(user1.address, hash1, SCORE, LEVEL);
            await sbt.connect(owner).mintSBT(user2.address, hash2, SCORE, LEVEL);

            const metadata1 = await sbt.getSBTMetadata(1);
            const metadata2 = await sbt.getSBTMetadata(2);

            expect(metadata1.scoreHash).to.equal(hash1);
            expect(metadata2.scoreHash).to.equal(hash2);
        });

        it("Should maintain correct state after multiple re-mints", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, 300, 1);
            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, 500, 2);
            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, 800, 3);

            expect(await sbt.balanceOf(user1.address)).to.equal(1);
            expect(await sbt.totalSupply()).to.equal(3);
            expect(await sbt.userToTokenId(user1.address)).to.equal(3);

            const userSBT = await sbt.getUserSBT(user1.address);
            expect(userSBT.score).to.equal(800);
            expect(userSBT.verificationLevel).to.equal(3);
        });
    });

    describe("Integration Tests", function () {
        it("Should support complete user journey", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            // 1. Mint initial SBT
            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, 300, 1);
            expect(await sbt.hasActiveSBT(user1.address)).to.be.true;

            // 2. Verify with level 1
            expect(await sbt.verifySBT(user1.address, 1)).to.be.true;

            // 3. Update score (re-mint)
            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, 750, 2);

            // 4. Verify with new level
            expect(await sbt.verifySBT(user1.address, 2)).to.be.true;

            // 5. Check final state
            const userSBT = await sbt.getUserSBT(user1.address);
            expect(userSBT.score).to.equal(750);
            expect(userSBT.verificationLevel).to.equal(2);
        });
    });

    describe("Gas Optimization Tests", function () {
        it("Should be gas efficient for minting", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            const tx = await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);
            const receipt = await tx.wait();

            // Gas should be reasonable (adjust threshold as needed)
            expect(receipt.gasUsed).to.be.lt(300000);
        });

        it("Should be gas efficient for re-minting", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            const tx = await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, 850, LEVEL);
            const receipt = await tx.wait();

            expect(receipt.gasUsed).to.be.lt(350000);
        });
    });

    describe("SBT Expiration and Renewal", function () {
        it("Should set expiration to 30 days from issuance", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            const tx = await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);
            const receipt = await tx.wait();
            const block = await ethers.provider.getBlock(receipt.blockNumber);

            const metadata = await sbt.getSBTMetadata(1);
            const expectedExpiration = BigInt(block.timestamp) + 30n * 24n * 60n * 60n; // 30 days
            expect(metadata.expiresAt).to.equal(expectedExpiration);
        });

        it("Should report SBT as valid when not expired", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            expect(await sbt.isValid(1)).to.be.true;
            expect(await sbt.isExpired(1)).to.be.false;
        });

        it("Should report SBT as expired after 30 days", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            // Fast forward 31 days
            await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine");

            expect(await sbt.isValid(1)).to.be.false;
            expect(await sbt.isExpired(1)).to.be.true;
        });

        it("Should allow owner to renew SBT by tokenId", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            // Fast forward 25 days (before expiration)
            await ethers.provider.send("evm_increaseTime", [25 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine");

            await expect(sbt.connect(owner).renewSBT(1))
                .to.emit(sbt, "SBTRenewed");

            // Should be valid for another 30 days from now
            expect(await sbt.isValid(1)).to.be.true;
        });

        it("Should allow owner to renew SBT by user address", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            await expect(sbt.connect(owner).renewUserSBT(user1.address))
                .to.emit(sbt, "SBTRenewed")
                .withArgs(user1.address, 1, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1 + 30 * 24 * 60 * 60));
        });

        it("Should extend expiration by 30 days on renewal", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            const metadataBefore = await sbt.getSBTMetadata(1);

            // Fast forward 20 days
            await ethers.provider.send("evm_increaseTime", [20 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine");

            const tx = await sbt.connect(owner).renewSBT(1);
            const receipt = await tx.wait();
            const block = await ethers.provider.getBlock(receipt.blockNumber);

            const metadataAfter = await sbt.getSBTMetadata(1);
            const expectedNewExpiration = BigInt(block.timestamp) + 30n * 24n * 60n * 60n;

            expect(metadataAfter.expiresAt).to.equal(expectedNewExpiration);
            expect(metadataAfter.expiresAt).to.be.gt(metadataBefore.expiresAt);
        });

        it("Should revert if non-owner tries to renew", async function () {
            const { sbt, owner, user1, user2 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            await expect(
                sbt.connect(user2).renewSBT(1)
            ).to.be.revertedWithCustomError(sbt, "OwnableUnauthorizedAccount");

            await expect(
                sbt.connect(user2).renewUserSBT(user1.address)
            ).to.be.revertedWithCustomError(sbt, "OwnableUnauthorizedAccount");
        });

        it("Should revert when renewing non-existent token", async function () {
            const { sbt, owner } = await loadFixture(deploySBTFixture);

            await expect(
                sbt.connect(owner).renewSBT(999)
            ).to.be.revertedWith("Token does not exist");
        });

        it("Should revert when renewing for user without SBT", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await expect(
                sbt.connect(owner).renewUserSBT(user1.address)
            ).to.be.revertedWith("User does not have active SBT");
        });

        it("Should allow renewal even if SBT is expired", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            // Fast forward 35 days (past expiration)
            await ethers.provider.send("evm_increaseTime", [35 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine");

            expect(await sbt.isExpired(1)).to.be.true;

            // Should still be able to renew
            await expect(sbt.connect(owner).renewSBT(1)).to.not.be.reverted;

            // Should be valid again
            expect(await sbt.isValid(1)).to.be.true;
        });

        it("Should handle multiple renewals correctly", async function () {
            const { sbt, owner, user1 } = await loadFixture(deploySBTFixture);

            await sbt.connect(owner).mintSBT(user1.address, MOCK_SCORE_HASH, SCORE, LEVEL);

            // First renewal
            await ethers.provider.send("evm_increaseTime", [15 * 24 * 60 * 60]);
            await sbt.connect(owner).renewSBT(1);

            // Second renewal
            await ethers.provider.send("evm_increaseTime", [15 * 24 * 60 * 60]);
            await sbt.connect(owner).renewSBT(1);

            // Should still be valid
            expect(await sbt.isValid(1)).to.be.true;
        });
    });
});
