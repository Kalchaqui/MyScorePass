# Contracts Documentation

Documentation for MyScorePass smart contracts.

## 📚 Available Guides

- **[SETUP.md](./SETUP.md)** - Complete setup, deployment, and configuration guide
  - Environment variables explained in detail
  - Step-by-step deployment to Fuji
  - Troubleshooting common issues

## 📝 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.template .env
   # Edit .env with your PRIVATE_KEY
   ```

3. **Get testnet AVAX**
   - https://faucets.chain.link/fuji

4. **Deploy**
   ```bash
   npx hardhat run scripts/deploy.js --network avalancheFuji
   ```

See [SETUP.md](./SETUP.md) for detailed instructions.

## 📄 Smart Contracts

### MyScorePassSBT.sol
Soulbound Token (ERC-5192) for credit score certification.
- Non-transferable (soulbound)
- Stores score, verification level, and metadata
- One SBT per user (auto-revokes old one on re-mint)

### IdentityRegistry.sol
Identity and Proof of Humanity management.
- Unique ID per user
- Document upload (IPFS hashes)
- Verification levels (0-3)

### CreditScoringMini.sol
On-chain credit scoring logic.
- Initial score calculation
- Score rewards/penalties
- Blacklist management

## 🔗 Network Information

**Avalanche Fuji Testnet**
- Chain ID: 43113
- RPC: https://api.avax-test.network/ext/bc/C/rpc
- Explorer: https://testnet.snowtrace.io/
- Faucet: https://faucets.chain.link/fuji

## 🛠️ Development Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Fuji
npx hardhat run scripts/deploy.js --network avalancheFuji

# Start local node
npx hardhat node

# Hardhat console
npx hardhat console --network avalancheFuji
```

## 📦 Dependencies

- `hardhat` - Development environment
- `@openzeppelin/contracts` - Secure contract library
- `ethers` - Ethereum library
- `@nomicfoundation/hardhat-toolbox` - Hardhat plugins

## 🔐 Security

- Use development wallets only for testnet
- Never commit `.env` file
- Audit contracts before mainnet deployment
- Use multi-sig for production ownership

## 📞 Support

For detailed setup instructions, see [SETUP.md](./SETUP.md).
