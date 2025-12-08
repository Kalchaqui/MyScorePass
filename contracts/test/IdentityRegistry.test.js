const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("IdentityRegistry", function () {
    // Fixture to deploy contract before each test
    async function deployIdentityRegistryFixture() {
        const [owner, user1, user2, user3] = await ethers.getSigners();

        const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
        const identityRegistry = await IdentityRegistry.deploy();
        await identityRegistry.waitForDeployment();

        return { identityRegistry, owner, user1, user2, user3 };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { identityRegistry, owner } = await loadFixture(deployIdentityRegistryFixture);
            expect(await identityRegistry.owner()).to.equal(owner.address);
        });

        it("Should start with zero registered users", async function () {
            const { identityRegistry } = await loadFixture(deployIdentityRegistryFixture);
            expect(await identityRegistry.getTotalUsers()).to.equal(0);
        });
    });

    describe("Identity Creation", function () {
        it("Should allow user to create identity", async function () {
            const { identityRegistry, user1 } = await loadFixture(deployIdentityRegistryFixture);
            const documentHash = "QmTestHash123";

            await expect(identityRegistry.connect(user1).createIdentity(documentHash))
                .to.emit(identityRegistry, "IdentityCreated")
                .and.to.emit(identityRegistry, "DocumentAdded");

            const identity = await identityRegistry.getIdentity(user1.address);
            expect(identity.isVerified).to.be.false;
            expect(identity.verificationLevel).to.equal(0);
            expect(identity.documentCount).to.equal(1);
        });

        it("Should generate unique ID for each identity", async function () {
            const { identityRegistry, user1, user2 } = await loadFixture(deployIdentityRegistryFixture);

            await identityRegistry.connect(user1).createIdentity("QmHash1");
            await identityRegistry.connect(user2).createIdentity("QmHash2");

            const id1 = await identityRegistry.getUniqueId(user1.address);
            const id2 = await identityRegistry.getUniqueId(user2.address);

            expect(id1).to.not.equal(id2);
        });

        it("Should increment total users count", async function () {
            const { identityRegistry, user1, user2 } = await loadFixture(deployIdentityRegistryFixture);

            await identityRegistry.connect(user1).createIdentity("QmHash1");
            expect(await identityRegistry.getTotalUsers()).to.equal(1);

            await identityRegistry.connect(user2).createIdentity("QmHash2");
            expect(await identityRegistry.getTotalUsers()).to.equal(2);
        });

        it("Should revert if identity already exists", async function () {
            const { identityRegistry, user1 } = await loadFixture(deployIdentityRegistryFixture);

            await identityRegistry.connect(user1).createIdentity("QmHash1");

            await expect(
                identityRegistry.connect(user1).createIdentity("QmHash2")
            ).to.be.revertedWith("Identity already exists");
        });

        it("Should revert if document hash is empty", async function () {
            const { identityRegistry, user1 } = await loadFixture(deployIdentityRegistryFixture);

            await expect(
                identityRegistry.connect(user1).createIdentity("")
            ).to.be.revertedWith("Document hash required");
        });
    });

    describe("Document Management", function () {
        it("Should allow adding additional documents", async function () {
            const { identityRegistry, user1 } = await loadFixture(deployIdentityRegistryFixture);

            await identityRegistry.connect(user1).createIdentity("QmHash1");

            await expect(identityRegistry.connect(user1).addDocument("QmHash2"))
                .to.emit(identityRegistry, "DocumentAdded")
                .withArgs(user1.address, "QmHash2", await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));

            const identity = await identityRegistry.getIdentity(user1.address);
            expect(identity.documentCount).to.equal(2);
        });

        it("Should retrieve specific document by index", async function () {
            const { identityRegistry, user1 } = await loadFixture(deployIdentityRegistryFixture);

            await identityRegistry.connect(user1).createIdentity("QmHash1");
            await identityRegistry.connect(user1).addDocument("QmHash2");

            expect(await identityRegistry.getDocument(user1.address, 0)).to.equal("QmHash1");
            expect(await identityRegistry.getDocument(user1.address, 1)).to.equal("QmHash2");
        });

        it("Should revert when adding document without identity", async function () {
            const { identityRegistry, user1 } = await loadFixture(deployIdentityRegistryFixture);

            await expect(
                identityRegistry.connect(user1).addDocument("QmHash1")
            ).to.be.revertedWith("Identity does not exist");
        });

        it("Should revert when adding empty document hash", async function () {
            const { identityRegistry, user1 } = await loadFixture(deployIdentityRegistryFixture);

            await identityRegistry.connect(user1).createIdentity("QmHash1");

            await expect(
                identityRegistry.connect(user1).addDocument("")
            ).to.be.revertedWith("Document hash required");
        });

        it("Should revert when retrieving invalid document index", async function () {
            const { identityRegistry, user1 } = await loadFixture(deployIdentityRegistryFixture);

            await identityRegistry.connect(user1).createIdentity("QmHash1");

            await expect(
                identityRegistry.getDocument(user1.address, 5)
            ).to.be.revertedWith("Invalid document index");
        });
    });

    describe("Identity Verification", function () {
        it("Should allow owner to verify identity", async function () {
            const { identityRegistry, owner, user1 } = await loadFixture(deployIdentityRegistryFixture);

            await identityRegistry.connect(user1).createIdentity("QmHash1");

            await expect(identityRegistry.connect(owner).verifyIdentity(user1.address, 2))
                .to.emit(identityRegistry, "IdentityVerified")
                .withArgs(user1.address, 2, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1))
                .and.to.emit(identityRegistry, "VerificationLevelUpdated")
                .withArgs(user1.address, 0, 2);

            const identity = await identityRegistry.getIdentity(user1.address);
            expect(identity.isVerified).to.be.true;
            expect(identity.verificationLevel).to.equal(2);
        });

        it("Should allow updating verification level", async function () {
            const { identityRegistry, owner, user1 } = await loadFixture(deployIdentityRegistryFixture);

            await identityRegistry.connect(user1).createIdentity("QmHash1");
            await identityRegistry.connect(owner).verifyIdentity(user1.address, 1);

            await expect(identityRegistry.connect(owner).verifyIdentity(user1.address, 3))
                .to.emit(identityRegistry, "VerificationLevelUpdated")
                .withArgs(user1.address, 1, 3);

            const identity = await identityRegistry.getIdentity(user1.address);
            expect(identity.verificationLevel).to.equal(3);
        });

        it("Should revert if non-owner tries to verify", async function () {
            const { identityRegistry, user1, user2 } = await loadFixture(deployIdentityRegistryFixture);

            await identityRegistry.connect(user1).createIdentity("QmHash1");

            await expect(
                identityRegistry.connect(user2).verifyIdentity(user1.address, 2)
            ).to.be.revertedWith("Only owner");
        });

        it("Should revert if verifying non-existent identity", async function () {
            const { identityRegistry, owner, user1 } = await loadFixture(deployIdentityRegistryFixture);

            await expect(
                identityRegistry.connect(owner).verifyIdentity(user1.address, 2)
            ).to.be.revertedWith("Identity does not exist");
        });

        it("Should revert if verification level is invalid (< 1)", async function () {
            const { identityRegistry, owner, user1 } = await loadFixture(deployIdentityRegistryFixture);

            await identityRegistry.connect(user1).createIdentity("QmHash1");

            await expect(
                identityRegistry.connect(owner).verifyIdentity(user1.address, 0)
            ).to.be.revertedWith("Invalid verification level");
        });

        it("Should revert if verification level is invalid (> 3)", async function () {
            const { identityRegistry, owner, user1 } = await loadFixture(deployIdentityRegistryFixture);

            await identityRegistry.connect(user1).createIdentity("QmHash1");

            await expect(
                identityRegistry.connect(owner).verifyIdentity(user1.address, 4)
            ).to.be.revertedWith("Invalid verification level");
        });
    });

    describe("Identity Queries", function () {
        it("Should check if user is verified", async function () {
            const { identityRegistry, owner, user1 } = await loadFixture(deployIdentityRegistryFixture);

            await identityRegistry.connect(user1).createIdentity("QmHash1");
            expect(await identityRegistry.isUserVerified(user1.address)).to.be.false;

            await identityRegistry.connect(owner).verifyIdentity(user1.address, 1);
            expect(await identityRegistry.isUserVerified(user1.address)).to.be.true;
        });

        it("Should return verification level", async function () {
            const { identityRegistry, owner, user1 } = await loadFixture(deployIdentityRegistryFixture);

            expect(await identityRegistry.getVerificationLevel(user1.address)).to.equal(0);

            await identityRegistry.connect(user1).createIdentity("QmHash1");
            await identityRegistry.connect(owner).verifyIdentity(user1.address, 2);

            expect(await identityRegistry.getVerificationLevel(user1.address)).to.equal(2);
        });

        it("Should return unique ID", async function () {
            const { identityRegistry, user1 } = await loadFixture(deployIdentityRegistryFixture);

            await identityRegistry.connect(user1).createIdentity("QmHash1");
            const uniqueId = await identityRegistry.getUniqueId(user1.address);

            expect(uniqueId).to.not.equal(ethers.ZeroHash);
        });

        it("Should revert when getting identity that doesn't exist", async function () {
            const { identityRegistry, user1 } = await loadFixture(deployIdentityRegistryFixture);

            await expect(
                identityRegistry.getIdentity(user1.address)
            ).to.be.revertedWith("Identity does not exist");
        });

        it("Should revert when getting unique ID that doesn't exist", async function () {
            const { identityRegistry, user1 } = await loadFixture(deployIdentityRegistryFixture);

            await expect(
                identityRegistry.getUniqueId(user1.address)
            ).to.be.revertedWith("Identity does not exist");
        });
    });

    describe("Edge Cases", function () {
        it("Should handle multiple users with different verification levels", async function () {
            const { identityRegistry, owner, user1, user2, user3 } = await loadFixture(deployIdentityRegistryFixture);

            await identityRegistry.connect(user1).createIdentity("QmHash1");
            await identityRegistry.connect(user2).createIdentity("QmHash2");
            await identityRegistry.connect(user3).createIdentity("QmHash3");

            await identityRegistry.connect(owner).verifyIdentity(user1.address, 1);
            await identityRegistry.connect(owner).verifyIdentity(user2.address, 2);
            await identityRegistry.connect(owner).verifyIdentity(user3.address, 3);

            expect(await identityRegistry.getVerificationLevel(user1.address)).to.equal(1);
            expect(await identityRegistry.getVerificationLevel(user2.address)).to.equal(2);
            expect(await identityRegistry.getVerificationLevel(user3.address)).to.equal(3);
        });

        it("Should handle user with many documents", async function () {
            const { identityRegistry, user1 } = await loadFixture(deployIdentityRegistryFixture);

            await identityRegistry.connect(user1).createIdentity("QmHash0");

            for (let i = 1; i <= 10; i++) {
                await identityRegistry.connect(user1).addDocument(`QmHash${i}`);
            }

            const identity = await identityRegistry.getIdentity(user1.address);
            expect(identity.documentCount).to.equal(11);

            expect(await identityRegistry.getDocument(user1.address, 0)).to.equal("QmHash0");
            expect(await identityRegistry.getDocument(user1.address, 10)).to.equal("QmHash10");
        });
    });
});
