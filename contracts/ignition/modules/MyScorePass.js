const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MyScorePass", (m) => {
  // 1. Deploy IdentityRegistry
  const identityRegistry = m.contract("IdentityRegistry");

  // 2. Deploy CreditScoringMini
  const creditScoring = m.contract("CreditScoringMini");

  // 3. Deploy MyScorePassSBT
  const scorePassSBT = m.contract("MyScorePassSBT");

  return { identityRegistry, creditScoring, scorePassSBT };
});

