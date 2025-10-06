const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeFiCred - Sistema Completo", function () {
  let mockUSDC;
  let identityRegistry;
  let creditScoring;
  let lendingPool;
  let loanManager;
  
  let owner;
  let borrower;
  let lender;
  
  const INITIAL_MINT = ethers.parseUnits("10000", 6); // 10,000 USDC
  const DEPOSIT_AMOUNT = ethers.parseUnits("5000", 6); // 5,000 USDC
  
  beforeEach(async function () {
    [owner, borrower, lender] = await ethers.getSigners();
    
    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    
    // Deploy IdentityRegistry
    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    identityRegistry = await IdentityRegistry.deploy();
    await identityRegistry.waitForDeployment();
    
    // Deploy CreditScoring
    const CreditScoring = await ethers.getContractFactory("CreditScoring");
    creditScoring = await CreditScoring.deploy(await identityRegistry.getAddress());
    await creditScoring.waitForDeployment();
    
    // Deploy LendingPool
    const LendingPool = await ethers.getContractFactory("LendingPool");
    lendingPool = await LendingPool.deploy(await mockUSDC.getAddress());
    await lendingPool.waitForDeployment();
    
    // Deploy LoanManager
    const LoanManager = await ethers.getContractFactory("LoanManager");
    loanManager = await LoanManager.deploy(
      await creditScoring.getAddress(),
      await lendingPool.getAddress(),
      await mockUSDC.getAddress()
    );
    await loanManager.waitForDeployment();
    
    // Configurar permisos
    await lendingPool.setLoanManager(await loanManager.getAddress());
    
    // Mint tokens para lender
    await mockUSDC.mint(lender.address, INITIAL_MINT);
  });
  
  describe("1. IdentityRegistry", function () {
    it("Debe crear una identidad con documento", async function () {
      const documentHash = "QmTest123..."; // IPFS hash simulado
      
      await identityRegistry.connect(borrower).createIdentity(documentHash);
      
      const identity = await identityRegistry.getIdentity(borrower.address);
      expect(identity.isVerified).to.equal(false);
      expect(identity.verificationLevel).to.equal(0);
      expect(identity.documentCount).to.equal(1);
    });
    
    it("Debe permitir agregar más documentos", async function () {
      await identityRegistry.connect(borrower).createIdentity("QmDoc1");
      await identityRegistry.connect(borrower).addDocument("QmDoc2");
      await identityRegistry.connect(borrower).addDocument("QmDoc3");
      
      const identity = await identityRegistry.getIdentity(borrower.address);
      expect(identity.documentCount).to.equal(3);
    });
    
    it("Owner debe poder verificar identidad", async function () {
      await identityRegistry.connect(borrower).createIdentity("QmDoc1");
      
      await identityRegistry.verifyIdentity(borrower.address, 2); // Nivel 2
      
      const identity = await identityRegistry.getIdentity(borrower.address);
      expect(identity.isVerified).to.equal(true);
      expect(identity.verificationLevel).to.equal(2);
    });
  });
  
  describe("2. CreditScoring", function () {
    beforeEach(async function () {
      // Crear y verificar identidad
      await identityRegistry.connect(borrower).createIdentity("QmDoc1");
      await identityRegistry.verifyIdentity(borrower.address, 2);
    });
    
    it("Debe calcular score inicial correctamente", async function () {
      await creditScoring.calculateInitialScore(borrower.address);
      
      const score = await creditScoring.getScore(borrower.address);
      expect(score.score).to.be.gt(0);
      expect(score.maxLoanAmount).to.be.gt(0);
    });
    
    it("Score debe aumentar con más documentos", async function () {
      await creditScoring.calculateInitialScore(borrower.address);
      const initialScore = await creditScoring.getScore(borrower.address);
      
      // Agregar más documentos
      await identityRegistry.connect(borrower).addDocument("QmDoc2");
      await identityRegistry.connect(borrower).addDocument("QmDoc3");
      
      // Actualizar score
      await creditScoring.updateScore(borrower.address);
      const newScore = await creditScoring.getScore(borrower.address);
      
      expect(newScore.score).to.be.gt(initialScore.score);
    });
  });
  
  describe("3. LendingPool", function () {
    it("Lender debe poder depositar fondos", async function () {
      await mockUSDC.connect(lender).approve(await lendingPool.getAddress(), DEPOSIT_AMOUNT);
      await lendingPool.connect(lender).deposit(DEPOSIT_AMOUNT);
      
      const depositInfo = await lendingPool.getDepositInfo(lender.address);
      expect(depositInfo.amount).to.equal(DEPOSIT_AMOUNT);
    });
    
    it("Debe calcular intereses correctamente", async function () {
      await mockUSDC.connect(lender).approve(await lendingPool.getAddress(), DEPOSIT_AMOUNT);
      await lendingPool.connect(lender).deposit(DEPOSIT_AMOUNT);
      
      // Avanzar tiempo (simular 30 días)
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      const interest = await lendingPool.calculateInterest(lender.address);
      expect(interest).to.be.gt(0);
    });
  });
  
  describe("4. LoanManager - Flujo Completo", function () {
    beforeEach(async function () {
      // Setup completo
      // 1. Crear identidad del borrower
      await identityRegistry.connect(borrower).createIdentity("QmDoc1");
      await identityRegistry.connect(borrower).addDocument("QmDoc2");
      await identityRegistry.verifyIdentity(borrower.address, 2);
      
      // 2. Calcular score
      await creditScoring.calculateInitialScore(borrower.address);
      
      // 3. Lender deposita fondos
      await mockUSDC.connect(lender).approve(await lendingPool.getAddress(), DEPOSIT_AMOUNT);
      await lendingPool.connect(lender).deposit(DEPOSIT_AMOUNT);
    });
    
    it("Borrower debe poder solicitar préstamo", async function () {
      const loanAmount = ethers.parseUnits("200", 6); // 200 USDC
      const duration = 30; // 30 días
      
      const loanId = await loanManager.connect(borrower).requestLoan.staticCall(loanAmount, duration);
      await loanManager.connect(borrower).requestLoan(loanAmount, duration);
      
      const loanInfo = await loanManager.getLoanInfo(loanId);
      expect(loanInfo.borrower).to.equal(borrower.address);
      expect(loanInfo.principal).to.equal(loanAmount);
    });
    
    it("Borrower debe poder repagar préstamo", async function () {
      const loanAmount = ethers.parseUnits("200", 6);
      const duration = 30;
      
      // Solicitar préstamo
      const loanId = await loanManager.connect(borrower).requestLoan.staticCall(loanAmount, duration);
      await loanManager.connect(borrower).requestLoan(loanAmount, duration);
      
      // Calcular repago total
      const totalRepayment = await loanManager.calculateTotalRepayment(loanId);
      
      // Dar tokens al borrower para repagar
      await mockUSDC.mint(borrower.address, totalRepayment);
      
      // Aprobar y repagar
      await mockUSDC.connect(borrower).approve(await loanManager.getAddress(), totalRepayment);
      await loanManager.connect(borrower).repayLoan(loanId);
      
      const loanInfo = await loanManager.getLoanInfo(loanId);
      expect(loanInfo.status).to.equal(2); // Repaid
    });
    
    it("No debe permitir préstamo mayor al límite", async function () {
      const score = await creditScoring.getScore(borrower.address);
      const excessiveAmount = score.maxLoanAmount + ethers.parseUnits("1", 6);
      const duration = 30;
      
      await expect(
        loanManager.connect(borrower).requestLoan(excessiveAmount, duration)
      ).to.be.revertedWith("Amount exceeds credit limit");
    });
  });
});


