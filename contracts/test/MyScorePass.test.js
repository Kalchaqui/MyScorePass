const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyScorePass - Sistema de Scoring", function () {
  let identityRegistry;
  let creditScoring;
  
  let owner;
  let user;
  
  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    
    // Deploy IdentityRegistry
    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    identityRegistry = await IdentityRegistry.deploy();
    await identityRegistry.waitForDeployment();
    
    // Deploy CreditScoringMini
    const CreditScoringMini = await ethers.getContractFactory("CreditScoringMini");
    creditScoring = await CreditScoringMini.deploy();
    await creditScoring.waitForDeployment();
  });
  
  describe("IdentityRegistry", function () {
    it("Debería permitir crear una identidad", async function () {
      await identityRegistry.connect(user).createIdentity("QmTestHash");
      
      const identity = await identityRegistry.getIdentity(user.address);
      expect(identity.isVerified).to.be.false;
      expect(identity.verificationLevel).to.equal(0);
    });
    
    it("Debería permitir verificar identidad", async function () {
      await identityRegistry.connect(user).createIdentity("QmTestHash");
      await identityRegistry.connect(owner).verifyIdentity(user.address, 2);
      
      const identity = await identityRegistry.getIdentity(user.address);
      expect(identity.isVerified).to.be.true;
      expect(identity.verificationLevel).to.equal(2);
    });
  });
  
  describe("CreditScoringMini", function () {
    it("Debería calcular score inicial", async function () {
      const tx = await creditScoring.connect(user).calculateInitialScore(user.address);
      await tx.wait();
      
      const scoreData = await creditScoring.getScore(user.address);
      expect(scoreData[0]).to.equal(300); // Score inicial
      expect(scoreData[1]).to.equal(300 * 10**6); // Max loan
    });
    
    it("Debería permitir recompensar score", async function () {
      await creditScoring.connect(user).calculateInitialScore(user.address);
      await creditScoring.connect(owner).rewardScore(user.address, 50);
      
      const scoreData = await creditScoring.getScore(user.address);
      expect(scoreData[0]).to.equal(350);
    });
  });
});

