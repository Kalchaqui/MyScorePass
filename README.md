# DeFiCred - DeFi Lending Platform on Polkadot

DeFiCred is a decentralized lending platform built on Polkadot's Paseo testnet, offering collateral-free loans with a comprehensive credit scoring system and multi-level protection mechanisms.

## 🌐 Network
**Paseo Testnet (Polkadot)**

## 📋 Smart Contracts

### Contract Addresses
- **IdentityRegistry**: `0x18d71DaCd2e657A8babf6C94E0f922C5746E0733`
- **CreditScoring**: `0x345F7F2556EC6480aAa8fCf8deb6CCa202Ed2A14`
- **LendingPool**: `0x0561eC805C7fbf2392b3353BD5f0920665Ee2b66`
- **LoanManager**: `0x84A5e36B1619c2333d687615aC40d2C141B00A55`
- **MockUSDC**: `0x482aAC0Eda23639A4fCd2662E8C67B557e21ef37`

### Contract ABIs
All contract ABIs are available in `frontend/config/abis.ts`

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Paseo testnet configured in MetaMask

### Installation
```bash
# Clone the repository
git clone https://github.com/Kalchaqui/DeFiCred-.git
cd DeFiCred

# Install dependencies
cd frontend && npm install
cd ../backend && npm install
cd ../contracts && npm install
```

### Running the Application
```bash
# Start backend
cd backend && npm start

# Start frontend (in another terminal)
cd frontend && npm run dev
```

### Testing Smart Contracts
1. Visit `http://localhost:3000/test`
2. Connect your MetaMask wallet
3. Select a contract to test
4. Use "Read" and "Write" functions to interact with contracts

## 🏗️ Architecture

### Frontend
- **Next.js 14** with App Router
- **Wagmi + RainbowKit** for wallet connection
- **Tailwind CSS** for styling
- **React Hot Toast** for notifications

### Backend
- **Node.js + Express** server
- **Multer** for file uploads
- **CORS** enabled for cross-origin requests

### Smart Contracts
- **Solidity 0.8.0**
- **Hardhat** for development
- **Polkadot Remix IDE** for deployment

## 🔧 Key Features

### Identity Management
- DNI upload and verification
- Admin approval system
- Unique identity per wallet

### Credit Scoring
- Initial score calculation
- Score-based loan limits
- Performance tracking

### Lending System
- Collateral-free loans
- Flexible payment plans (1, 3, 6, 12 months)
- Interest rates: 5%, 8%, 12%, 18% APY

### Protection System
- **Level 1**: Prevention (low limits, progressive scoring)
- **Level 2**: Penalization (score reduction, blockchain recording)
- **Level 3**: Insurance fund (2% of loan amount)

## 📱 User Flow

1. **Identity Verification**: Upload DNI → Admin approval
2. **Credit Scoring**: Calculate initial score
3. **Loan Request**: Select amount and payment plan
4. **Loan Management**: Track payments and history

## 🧪 Testing

The application includes a comprehensive test page at `/test` that allows direct interaction with all smart contracts:

- **Read Functions**: View contract state and user data
- **Write Functions**: Execute contract functions
- **Transaction Tracking**: Monitor transaction hashes and events
- **Error Handling**: Clear error messages and validation

## 🔒 Security

- All contracts deployed on testnet only
- No real assets involved
- Admin functions protected
- Input validation and error handling

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

This project was developed for the Polkadot Hackathon. For questions or contributions, please open an issue on GitHub.

---

**Built with ❤️ for the Polkadot ecosystem**