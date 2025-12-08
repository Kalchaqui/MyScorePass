# Smart Contracts Setup Guide

Complete guide to set up, compile, test, and deploy MyScorePass smart contracts to Avalanche Fuji Testnet.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Configuration](#environment-configuration)
4. [Compilation](#compilation)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: Version 18.x or higher
  ```bash
  node -v  # Should show v18.x.x or higher
  ```

- **npm**: Version 8.x or higher
  ```bash
  npm -v   # Should show 8.x.x or higher
  ```

### Required Accounts & Tools

1. **Wallet with Private Key**
   - MetaMask, Core Wallet, or any EVM-compatible wallet
   - **IMPORTANT**: Use a development wallet, NOT your main wallet
   - Export your private key (see instructions below)

2. **AVAX on Fuji Testnet**
   - Get free testnet AVAX from faucets (see below)
   - Minimum ~2 AVAX recommended for deployment

3. **Optional: Block Explorer API Key**
   - For contract verification on SnowTrace
   - Get from: https://snowtrace.io/

---

## Installation

### Step 1: Navigate to Contracts Directory

```bash
cd /path/to/MyScorePass/contracts
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- `hardhat` - Ethereum development environment
- `@nomicfoundation/hardhat-toolbox` - Hardhat plugins bundle
- `@openzeppelin/contracts` - Secure smart contract library
- `ethers` - Ethereum library
- `dotenv` - Environment variable management

### Step 3: Verify Installation

```bash
npx hardhat --version
```

Expected output: `2.19.0` or similar

---

## Environment Configuration

### Step 1: Create Environment File

```bash
cp .env.template .env
```

### Step 2: Configure Environment Variables

Open `.env` and configure the following:

#### **PRIVATE_KEY** (REQUIRED for deployment)

Your wallet's private key for signing transactions.

**How to get your Private Key:**

##### From MetaMask:
1. Open MetaMask extension
2. Click the 3 dots menu → Account Details
3. Click "Show Private Key"
4. Enter your MetaMask password
5. Copy the private key (64 characters)

##### From Core Wallet:
1. Open Core extension
2. Menu → Settings → Security & Privacy
3. Click "Show Recovery Phrase / Private Key"
4. Enter your password
5. Select your account and copy the private key

**Format in .env:**
```env
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

⚠️ **SECURITY WARNING**: 
- NEVER commit `.env` to git (it's in `.gitignore`)
- NEVER share your private key
- Use a development wallet only

---

#### **AVALANCHE_FUJI_RPC_URL** (Optional)

RPC endpoint for Avalanche Fuji Testnet.

**Default (Public RPC):**
```env
AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
```

**Alternative (Alchemy, Infura, etc.):**
```env
AVALANCHE_FUJI_RPC_URL=https://avalanche-fuji.infura.io/v3/YOUR_PROJECT_ID
```

---

#### **MOONSCAN_API_KEY** (Optional)

For contract verification on Moonbeam explorers (legacy networks).

```env
MOONSCAN_API_KEY=your_moonscan_api_key_here
```

Get from: https://moonscan.io/myapikey

---

#### **PASEO_RPC_URL** (Optional)

For Paseo testnet deployment (legacy).

```env
PASEO_RPC_URL=https://testnet-passet-hub-eth-rpc.polkadot.io
```

---

### Complete .env Example

```env
# Required for deployment
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# RPC URLs (use defaults or custom)
AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PASEO_RPC_URL=https://testnet-passet-hub-eth-rpc.polkadot.io

# Optional: For contract verification
MOONSCAN_API_KEY=
```

---

## Get Testnet AVAX

You need AVAX on Fuji Testnet to deploy contracts (for gas fees).

### Option 1: Chainlink Faucet (Recommended)
1. Go to: https://faucets.chain.link/fuji
2. Connect your wallet
3. Request 1 AVAX
4. Wait ~30 seconds

### Option 2: Core Faucet
1. Go to: https://core.app/tools/testnet-faucet/
2. Select "C-Chain" and "Fuji Testnet"
3. Enter your wallet address
4. Request tokens

### Option 3: Alchemy Faucet
1. Go to: https://www.alchemy.com/faucets/avalanche-fuji
2. Create free Alchemy account
3. Enter your address
4. Receive AVAX

### Verify Balance

```bash
# Check your wallet balance on Fuji
# Use SnowTrace: https://testnet.snowtrace.io/
# Enter your wallet address
```

---

## Compilation

### Compile All Contracts

```bash
npx hardhat compile
```

**Expected Output:**
```
Compiled 3 Solidity files successfully
```

**Generated Files:**
- `artifacts/` - Compiled contract artifacts (ABI, bytecode)
- `cache/` - Hardhat cache (speeds up compilation)

### What Gets Compiled

1. **MyScorePassSBT.sol** - Soulbound Token for credit scores
2. **IdentityRegistry.sol** - Identity and Proof of Humanity
3. **CreditScoringMini.sol** - On-chain credit scoring logic

### Troubleshooting Compilation

**Error: "Couldn't download compiler"**
- Network restriction or firewall blocking compiler download
- Try using a VPN or different network
- Check: https://hardhat.org/hardhat-runner/docs/reference/solidity-support

**Error: "Solidity version mismatch"**
- All contracts use `^0.8.20`
- Check `hardhat.config.js` has correct version

---

## Testing

### Run All Tests

```bash
npx hardhat test
```

**Expected Output:**
```
  MyScorePass - Scoring System
    IdentityRegistry
      ✔ Should allow creating an identity
      ✔ Should allow verifying identity
    CreditScoringMini
      ✔ Should calculate initial score
      ✔ Should allow rewarding score

  MyScorePassSBT
    Minting
      ✔ Should allow owner to mint SBT
      ✔ Should not allow others to mint
    SBT Properties
      ✔ Should store metadata correctly
      ✔ Should retrieve user's SBT
      ✔ Should verify if user meets minimum level
    Non-Transferability (Soulbound)
      ✔ Should not allow transferring token
      ✔ Should not allow safeTransferFrom
      ✔ Should not allow approve
    Revocation / Re-minting
      ✔ Should burn previous SBT when minting new one

  13 passing (2s)
```

### Run Specific Test File

```bash
npx hardhat test test/MyScorePassSBT.test.js
```

### Test with Gas Report

```bash
REPORT_GAS=true npx hardhat test
```

---

## Deployment

### Step 1: Verify Prerequisites

Before deploying, ensure:
- ✅ `.env` is configured with `PRIVATE_KEY`
- ✅ Wallet has AVAX on Fuji (check balance)
- ✅ Contracts compile successfully
- ✅ Tests pass

### Step 2: Deploy to Fuji Testnet

```bash
npx hardhat run scripts/deploy.js --network avalancheFuji
```

**Expected Output:**
```
🚀 Deploying MyScorePass contracts to avalancheFuji
============================================================
📍 Deploying with account: 0xYourAddress...
💰 Balance: 2.5

1️⃣  Deploying IdentityRegistry...
✅ IdentityRegistry deployed at: 0xABC123...

2️⃣  Deploying CreditScoringMini...
✅ CreditScoringMini deployed at: 0xDEF456...

3️⃣  Deploying MyScorePassSBT...
✅ MyScorePassSBT deployed at: 0x789GHI...

============================================================
🎉 Deployment completed successfully!
============================================================

📋 CONTRACT ADDRESSES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IdentityRegistry:   0xABC123...
CreditScoringMini:  0xDEF456...
MyScorePassSBT:     0x789GHI...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Next steps:
1. Save these addresses in backend/.env and frontend/.env.local
2. Configure MERCHANT_WALLET_ADDRESS (can be the same as deployer)
3. Restart backend to load the addresses
4. Test x402 endpoints in /test

✅ Deployment information saved in deployment-info.json
```

### Step 3: Save Contract Addresses

The deployment script automatically saves addresses to `deployment-info.json`:

```json
{
  "network": "avalancheFuji",
  "timestamp": "2025-12-07T14:00:00.000Z",
  "deployer": "0xYourAddress...",
  "contracts": {
    "identityRegistry": "0xABC123...",
    "creditScoring": "0xDEF456...",
    "scorePassSBT": "0x789GHI..."
  }
}
```

### Step 4: Configure Backend

Update `backend/.env`:

```env
SBT_CONTRACT_ADDRESS=0x789GHI...
IDENTITY_REGISTRY_ADDRESS=0xABC123...
CREDIT_SCORING_ADDRESS=0xDEF456...
BLOCKCHAIN_PRIVATE_KEY=0xYourPrivateKey...
```

### Step 5: Configure Frontend (Optional)

Update `frontend/.env.local`:

```env
NEXT_PUBLIC_SBT_CONTRACT_ADDRESS=0x789GHI...
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0xABC123...
```

---

## Verification

### Verify Deployment on Block Explorer

1. Go to Fuji SnowTrace: https://testnet.snowtrace.io/
2. Search for each contract address
3. Verify transactions show "Contract Creation"

### Interact with Contracts

#### Using Hardhat Console

```bash
npx hardhat console --network avalancheFuji
```

```javascript
// Get contract instance
const SBT = await ethers.getContractFactory("MyScorePassSBT");
const sbt = await SBT.attach("0x789GHI...");

// Check owner
const owner = await sbt.owner();
console.log("Owner:", owner);

// Check total supply
const supply = await sbt.totalSupply();
console.log("Total Supply:", supply.toString());
```

#### Using Backend API

Once backend is configured:

```bash
# Check if user has SBT
curl http://localhost:3001/api/sbt/0xUserAddress.../has-sbt

# Get total supply
curl http://localhost:3001/api/sbt/stats/total-supply
```

---

## Troubleshooting

### Common Issues

#### 1. "Insufficient funds for gas"

**Problem**: Wallet doesn't have enough AVAX for deployment.

**Solution**:
- Get more AVAX from faucets (see [Get Testnet AVAX](#get-testnet-avax))
- Need ~0.5-1 AVAX for deployment

#### 2. "Invalid private key"

**Problem**: Private key format is incorrect.

**Solution**:
- Ensure private key starts with `0x`
- Should be 66 characters total (0x + 64 hex chars)
- No spaces or extra characters

#### 3. "Network connection failed"

**Problem**: Can't connect to RPC endpoint.

**Solution**:
- Check `AVALANCHE_FUJI_RPC_URL` in `.env`
- Try public RPC: `https://api.avax-test.network/ext/bc/C/rpc`
- Check internet connection

#### 4. "Nonce too high"

**Problem**: Transaction nonce mismatch.

**Solution**:
```bash
# Reset Hardhat network
npx hardhat clean
rm -rf cache artifacts
npx hardhat compile
```

#### 5. "Contract already deployed"

**Problem**: Trying to deploy to same address.

**Solution**:
- This is normal if re-deploying
- Use new wallet or different network
- Or just use existing deployment

---

## Advanced Configuration

### Custom Gas Settings

Edit `hardhat.config.js`:

```javascript
avalancheFuji: {
  url: process.env.AVALANCHE_FUJI_RPC_URL,
  chainId: 43113,
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  gas: 5000000,           // Increase if needed
  gasPrice: 25000000000,  // 25 gwei (adjust based on network)
}
```

### Deploy to Other Networks

#### Moonbase Alpha (Legacy)
```bash
npx hardhat run scripts/deploy.js --network moonbase
```

#### Paseo Testnet (Legacy)
```bash
npx hardhat run scripts/deploy.js --network paseo
```

### Local Hardhat Network (Testing)

```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

---

## Next Steps After Deployment

1. ✅ Save contract addresses to `backend/.env`
2. ✅ Restart backend: `cd ../backend && npm start`
3. ✅ Test SBT minting via API
4. ✅ Integrate with frontend
5. ✅ Test complete user flow

---

## Security Checklist

Before deploying to production (mainnet):

- [ ] Audit smart contracts
- [ ] Use hardware wallet for deployment
- [ ] Test thoroughly on testnet
- [ ] Verify contract source code on explorer
- [ ] Set up multi-sig for contract ownership
- [ ] Monitor contract events
- [ ] Have emergency pause mechanism

---

## Support & Resources

- **Hardhat Docs**: https://hardhat.org/docs
- **Avalanche Docs**: https://docs.avax.network/
- **OpenZeppelin**: https://docs.openzeppelin.com/
- **Fuji Explorer**: https://testnet.snowtrace.io/
- **Fuji Faucet**: https://faucets.chain.link/fuji
