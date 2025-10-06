// ABIs para contratos Mini/Micro desplegados en Paseo

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

export const lendingPoolABI = [
  {
    "inputs": [{"name": "_amount", "type": "uint256"}],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAvailableLiquidity",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const loanManagerABI = [
  {
    "inputs": [
      {"name": "_amt", "type": "uint256"},
      {"name": "_inst", "type": "uint256"}
    ],
    "name": "requestLoan",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_id", "type": "uint256"}],
    "name": "payInstallment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "", "type": "uint256"}],
    "name": "loans",
    "outputs": [
      {"name": "borrower", "type": "address"},
      {"name": "amount", "type": "uint256"},
      {"name": "installments", "type": "uint256"},
      {"name": "paid", "type": "uint256"},
      {"name": "installmentAmt", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const usdcABI = [
  {
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "amount", "type": "uint256"}],
    "name": "faucet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;


