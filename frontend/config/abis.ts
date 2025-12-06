// ABIs para contratos MyScorePass - Avalanche Fuji

export const identityRegistryABI = [
  {
    "inputs": [],
    "name": "createIdentity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_user", "type": "address"}],
    "name": "getIdentity",
    "outputs": [
      {"name": "uniqueId", "type": "bytes32"},
      {"name": "isVerified", "type": "bool"},
      {"name": "verificationLevel", "type": "uint256"},
      {"name": "createdAt", "type": "uint256"},
      {"name": "documentCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const creditScoringABI = [
  {
    "inputs": [{"name": "_user", "type": "address"}],
    "name": "calculateInitialScore",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_user", "type": "address"}],
    "name": "getScore",
    "outputs": [
      {"name": "score", "type": "uint256"},
      {"name": "maxLoanAmount", "type": "uint256"},
      {"name": "lastUpdated", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// TODO: Add MyScorePassSBT ABI when contract is created
export const scorePassSBTABI = [] as const;


