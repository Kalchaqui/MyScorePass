const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DeFiCred", (m) => {
  // 1. Deploy MockUSDC
  const mockUSDC = m.contract("MockUSDC");

  // 2. Deploy IdentityRegistry
  const identityRegistry = m.contract("IdentityRegistry");

  // 3. Deploy CreditScoring con IdentityRegistry
  const creditScoring = m.contract("CreditScoring", [identityRegistry]);

  // 4. Deploy LendingPool con USDC
  const lendingPool = m.contract("LendingPool", [mockUSDC]);

  // 5. Deploy InsurancePool con USDC
  const insurancePool = m.contract("InsurancePool", [mockUSDC]);

  // 6. Deploy LoanManager con todas las dependencias
  const loanManager = m.contract("LoanManager", [
    creditScoring,
    lendingPool,
    insurancePool,
    mockUSDC
  ]);

  return { mockUSDC, identityRegistry, creditScoring, lendingPool, insurancePool, loanManager };
});
