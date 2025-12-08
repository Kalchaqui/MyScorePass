# Backend Setup Guide

Complete guide to set up and run the MyScorePass backend API server.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Configuration](#environment-configuration)
4. [Running the Server](#running-the-server)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

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

---

## Installation

### Step 1: Navigate to Backend Directory

```bash
cd /path/to/MyScorePass/backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `express` - Web framework
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `ethers` - Blockchain interactions
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables

---

## Environment Configuration

### Step 1: Create Environment File

```bash
cp .env.example .env
```

### Step 2: Configure Environment Variables

Open `.env` and configure the following:

---

#### **Server Configuration**

```env
PORT=3001
NODE_ENV=development
```

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (`development` or `production`)

---

#### **Security**

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

- `JWT_SECRET`: Secret key for JWT token signing
  - **IMPORTANT**: Change this in production!
  - Use a strong random string (32+ characters)
  - Generate with: `openssl rand -base64 32`

- `JWT_EXPIRES_IN`: Token expiration time
  - Examples: `7d` (7 days), `24h` (24 hours), `30m` (30 minutes)

---

#### **x402 Payment Configuration**

```env
X402_MODE=simulated
THIRDWEB_SECRET_KEY=
THIRDWEB_SERVER_WALLET_ADDRESS=
MERCHANT_WALLET_ADDRESS=0x5d7282E3fe75956E2E1a1625a17c26e9766662FA
```

- `X402_MODE`: Payment verification mode
  - `simulated`: Mock payments (for development/testing)
  - `production`: Real Thirdweb facilitator verification

- `THIRDWEB_SECRET_KEY`: Your Thirdweb secret key
  - Get from: https://thirdweb.com/dashboard
  - Only needed if `X402_MODE=production`

- `THIRDWEB_SERVER_WALLET_ADDRESS`: Server wallet for x402
  - Only needed if `X402_MODE=production`

- `MERCHANT_WALLET_ADDRESS`: Wallet to receive payments
  - Can be any valid Ethereum address

---

#### **Blockchain Configuration**

```env
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
CHAIN_ID=43113
BLOCKCHAIN_PRIVATE_KEY=
```

- `AVALANCHE_RPC_URL`: RPC endpoint for Avalanche Fuji
  - Default public RPC works fine
  - Or use Alchemy/Infura for better reliability

- `CHAIN_ID`: Network chain ID
  - `43113` for Fuji Testnet
  - `43114` for Avalanche Mainnet

- `BLOCKCHAIN_PRIVATE_KEY`: Private key for minting SBTs
  - **Optional**: Only needed for write operations (minting)
  - Format: `0x...` (66 characters)
  - Use a development wallet only

---

#### **Smart Contract Addresses**

```env
SBT_CONTRACT_ADDRESS=
IDENTITY_REGISTRY_ADDRESS=
CREDIT_SCORING_ADDRESS=
```

These are set **after** deploying contracts (see `contracts/docs/SETUP.md`).

Example:
```env
SBT_CONTRACT_ADDRESS=0x789GHI...
IDENTITY_REGISTRY_ADDRESS=0xABC123...
CREDIT_SCORING_ADDRESS=0xDEF456...
```

---

#### **File Paths**

```env
UPLOADS_DIR=./uploads
DATA_DIR=./data
```

- `UPLOADS_DIR`: Directory for file uploads
- `DATA_DIR`: Directory for JSON data files

**Note**: These directories are created automatically on first run.

---

### Complete .env Example

```env
# Server
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=my-super-secret-jwt-key-for-production-use-strong-random-string
JWT_EXPIRES_IN=7d

# x402 Configuration
X402_MODE=simulated
THIRDWEB_SECRET_KEY=
THIRDWEB_SERVER_WALLET_ADDRESS=
MERCHANT_WALLET_ADDRESS=0x5d7282E3fe75956E2E1a1625a17c26e9766662FA

# Blockchain
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
CHAIN_ID=43113
BLOCKCHAIN_PRIVATE_KEY=0xYourPrivateKeyHere

# Smart Contracts (set after deployment)
SBT_CONTRACT_ADDRESS=0x789GHI...
IDENTITY_REGISTRY_ADDRESS=0xABC123...
CREDIT_SCORING_ADDRESS=0xDEF456...

# Paths
UPLOADS_DIR=./uploads
DATA_DIR=./data
```

---

## Running the Server

### Development Mode (Recommended)

```bash
npm run dev
```

Uses `nodemon` for auto-restart on file changes.

**Expected Output:**
```
[nodemon] starting `node src/server.js`
✅ Server running on port 3001
✅ Environment: development
```

### Production Mode

```bash
npm start
```

Runs server without auto-restart.

---

## Testing the API

### Health Check

```bash
curl http://localhost:3001/
```

Expected: `Cannot GET /` (normal, no root route defined)

### Register Exchange

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Exchange",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected:
```json
{
  "success": true,
  "data": {
    "exchange": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Protected Endpoint

```bash
# Save token from login response
TOKEN="your_jwt_token_here"

curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register exchange
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get profile (protected)

### Subscriptions
- `POST /api/subscriptions/purchase` - Purchase credits (x402, protected)
- `GET /api/subscriptions/balance` - Get balance (protected)
- `GET /api/subscriptions/usage` - Get usage history (protected)

### Mock Users
- `GET /api/mockUsers` - Query users (protected, consumes credit)
- `GET /api/mockUsers/:id` - Get user details (protected, consumes credit)
- `GET /api/mockUsers/stats` - Get statistics (protected)

### SBT (Blockchain)
- `POST /api/sbt/mint` - Mint SBT (protected)
- `GET /api/sbt/:address` - Get user's SBT (public)
- `GET /api/sbt/:address/verify` - Verify SBT (public)
- `GET /api/sbt/stats/total-supply` - Get total supply (public)

---

## Troubleshooting

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3001`

**Solution**:
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use different port in .env
PORT=3002
```

### JWT Secret Warning

**Warning**: `Using default JWT secret`

**Solution**:
- Set `JWT_SECRET` in `.env` to a strong random string
- Generate with: `openssl rand -base64 32`

### Cannot Connect to Blockchain

**Error**: `Failed to initialize blockchain service`

**Solution**:
- Check `AVALANCHE_RPC_URL` is correct
- Verify internet connection
- Try public RPC: `https://api.avax-test.network/ext/bc/C/rpc`

### Missing Contract Addresses

**Warning**: `SBT contract address not configured`

**Solution**:
- Deploy contracts first (see `contracts/docs/SETUP.md`)
- Copy addresses to `backend/.env`
- Restart backend

### Data Directory Missing

**Error**: `ENOENT: no such file or directory, open './data/users.json'`

**Solution**:
```bash
mkdir -p data
```

The backend will create the file automatically.

---

## Development Tips

### Auto-Restart on Changes

Use `npm run dev` (nodemon) instead of `npm start` during development.

### View Logs

All logs are output to console. For production, consider using a logging service.

### Database

Currently uses JSON files in `data/` directory. For production:
- Migrate to PostgreSQL, MongoDB, or similar
- Update repositories in `src/core/repositories/`

### Mock Users

Generate mock users:
```bash
node src/scripts/seedMockUsers.js
```

This creates 100 mock users in `data/mockUsers.json`.

---

## Next Steps

1. ✅ Configure `.env` with all required variables
2. ✅ Start server: `npm run dev`
3. ✅ Test authentication endpoints
4. ✅ Deploy smart contracts (see `contracts/docs/SETUP.md`)
5. ✅ Configure contract addresses in `.env`
6. ✅ Restart backend
7. ✅ Test SBT endpoints
8. ✅ Start frontend (see `frontend/README.md`)

---

## Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS (not HTTP)
- [ ] Set up proper CORS configuration
- [ ] Use environment-specific `.env` files
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Use real database (not JSON files)
- [ ] Secure private keys in vault/secrets manager

---

## Support & Resources

- **Express.js Docs**: https://expressjs.com/
- **JWT**: https://jwt.io/
- **Ethers.js**: https://docs.ethers.org/
- **Thirdweb**: https://portal.thirdweb.com/
