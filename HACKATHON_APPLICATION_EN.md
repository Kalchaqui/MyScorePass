# Hackathon Application - MyScorePass

## Team Information

### Team Name
**MyScorePass**

### One-sentence description
MyScorePass is a Web3 credit scoring platform that enables users to obtain verifiable financial reputation through x402 payments, receiving a portable Soulbound Token (SBT) that they can use to access uncollateralized loans on any DeFi platform.

---

### Team Members

**Diego Raúl Barrionuevo**
- **Email**: [your-email@example.com]
- **Telegram**: @[your-telegram]
- **Role**: Full-Stack Developer & Smart Contract Developer
- **Responsibilities**: 
  - System architecture
  - Smart Contract development (SBT)
  - x402 integration
  - Frontend and Backend
- **Relevant Experience**:
  - Development of DeFiCred (lending platform on Polkadot)
  - Experience in Solidity, Hardhat, Next.js
  - Wallet integration (Wagmi, RainbowKit)
  - Credit scoring systems

---

### Why is your team uniquely positioned to build this project?

We have experience in banking Fintech and Web3 development through participation in other hackathons such as Hack2Build: Privacy Edition where we received an honorable mention with the saluData project.

This experience allows us to:
1. **Understand the real problem**: We know the limitations of current scoring and lending systems
2. **Technical experience**: Mastery of Solidity, smart contracts, wallet integration, and DeFi architecture
3. **User-focused approach**: We have iterated on UX/UI to make complex systems accessible
4. **Adaptability**: We first studied a complex lending dApp but simplified it to only credit scoring, demonstrating the ability to pivot according to market needs

Additionally, we deeply understand the x402 protocol and how to integrate it to create a sustainable business model based on pay-per-use, which is perfect for credit scoring services.

---

## Problem Identification

### What problem are you addressing?

The main problem is that there is no decentralized and reliable scoring system that allows evaluating each individual, which is why blockchain exchange or lending platforms cannot lend assets such as stablecoins for this reason, in addition to the lack of access to credit for unbanked individuals or those with limited credit history in the DeFi ecosystem. Currently:

1. **No Web3 credit history**: DeFi platforms have no way to evaluate a user's reliability without collateral
2. **Repetitive and costly KYC**: Each platform requires its own verification process
3. **Lack of portable reputation**: There is no scoring system that can be used across multiple platforms
4. **High barrier to entry**: Uncollateralized loans are almost impossible without a verifiable reputation system

### Who experiences this problem?

**Primary Users (B2C):**
- **Unbanked individuals** in developing countries who want to access DeFi services
- **New Web3 users** without traditional credit history
- **Developers and freelancers** who need capital for projects but don't have assets as collateral
- **Small entrepreneurs** seeking quick loans without bureaucracy

**Needs:**
- Access to credit without collateral
- Simple and fast process
- Portable reputation across platforms
- Privacy (not revealing all their data to each platform)

**Secondary Users (B2B):**
- **DeFi lending platforms** that need to assess risk without collateral
- **Lending protocols** that want to expand their user base

### How is the problem currently solved (if at all)?

**Traditional Solutions:**
1. **Collateralized loans**: Require locked assets (over-collateralized), limiting access
2. **Manual KYC per platform**: Each platform does its own process, costly and repetitive
3. **Centralized scoring**: Systems like Credit Karma don't work in Web3 and require traditional banking data

**Current Web3 Solutions:**
1. **Identity protocols** (like ENS, Proof of Humanity): Verify identity but not credit reputation
2. **Isolated scoring systems**: Each platform calculates its own score, not portable
3. **Limited uncollateralized loans**: Only for users with extensive history on the same platform

**Limitations:**
- No unified Web3 credit reputation system
- Scores are not portable across platforms
- Lack of incentives to build reputation from scratch
- Costly and slow processes

### What is your proposed solution?

**MyScorePass** solves these problems through:

1. **Portable Web3 Credit Scoring**:
   - User pays with USDC or another token (via x402) to obtain their score
   - Receives a **Soulbound Token (SBT)** that certifies their reputation
   - The SBT is **portable** - can be used on any DeFi platform

2. **Pay-per-Use Model (x402)**:
   - No subscriptions or accounts
   - One-time payment to obtain/update score
   - Fully programmatic process (ideal for AI agents as well)

3. **Reputational Identity Verification**:
   - Identity verification + score calculation in a single process
   - Private data off-chain, only verifiable hash on-chain
   - Privacy preserved

4. **Open Ecosystem**:
   - Any DeFi platform can read the user's SBT
   - They assess risk without needing their own KYC process
   - Shared reputation system benefits the entire ecosystem

**Advantages over current solutions:**
- ✅ **Portability**: One score, multiple platforms
- ✅ **Accessibility**: Anyone can obtain a score by paying 2 USDC
- ✅ **Privacy**: Only hash on-chain, complete data off-chain
- ✅ **Speed**: Automated process, results in minutes
- ✅ **Sustainable**: Clear business model (pay-per-use)
- ✅ **No collateral**: Enables uncollateralized loans based on reputation

---

## Proposed Solution

### Architecture Design Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  - User dashboard                                            │
│  - x402 SDK integration                                      │
│  - SBT visualization                                         │
│  - Wallet connection (Wagmi + RainbowKit)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)               │
│  - REST API with x402 middleware                             │
│  - Identity verification                                     │
│  - Score calculation (off-chain)                             │
│  - Smart Contract integration                                │
│  - Data storage (hash on-chain, data off-chain)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              SMART CONTRACTS (Solidity)                      │
│  - MyScorePassSBT.sol (ERC-5192 Soulbound Token)               │
│  - IdentityRegistry.sol (Identity verification)              │
│  - ScoreRegistry.sol (Verifiable score registry)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    AVALANCHE C-CHAIN                          │
│  - Network: Fuji Testnet (development) / Mainnet (production)│
│  - Token: USDC for x402 payments                             │
│  - x402 facilitator for payment verification                 │
└─────────────────────────────────────────────────────────────┘
```

**Main Components:**

1. **Frontend (Next.js 14)**
   - UI/UX for users
   - x402 SDK integration for payments
   - SBT and score visualization
   - Wallet connection

2. **Backend (Express + x402)**
   - x402 middleware for protected routes
   - Endpoints:
     - `POST /api/score/calculate` Example (2 USDC) - Calculate score + mint SBT
     - `GET /api/score/query` Example (0.50 USDC) - Query existing score
     - `GET /api/score/verify` Example (0.10 USDC) - Verify SBT (for other dApps)
   - Scoring logic (off-chain algorithm)
   - Smart contract integration

3. **Smart Contracts (Solidity)**
   - **MyScorePassSBT**: ERC-5192 contract (Soulbound Token)
     - Mint SBT with metadata: scoreHash, verificationLevel, timestamp
     - Non-transferable (soulbound)
   - **IdentityRegistry**: Verified identity management
   - **ScoreRegistry**: Verifiable score registry (hash on-chain)

4. **x402 Integration**
   - Facilitator for payment verification
   - SDK in frontend for automatic payment handling
   - Middleware in backend for route protection

### User Journey

**Step 1: Connect Wallet**
- User visits myscorepass.com
- Connects wallet (MetaMask, WalletConnect)
- Sees initial dashboard

**Step 2: Verify Identity (Optional but recommended)**
- User uploads ID (front and back)
- System verifies identity (can be automatic or with admin)
- Identity registered on blockchain (IdentityRegistry)

**Step 3: Obtain Score (x402 Payment)**
- User clicks: "Calculate Score - 2 USDC"
- Frontend calls: `POST /api/score/calculate`
- Backend responds: HTTP 402 (Payment Required)
- x402 SDK shows payment modal
- User approves 2 USDC payment in MetaMask
- SDK retries request with `X-PAYMENT` header
- Backend verifies payment → Calculates score → Mints SBT
- User receives:
  - Credit score (e.g., 750/1000)
  - SBT Token ID (#123)
  - Verifiable score hash

**Step 4: Use SBT on Other Platforms**
- User goes to DeFi lending platform (e.g., LendApp)
- Requests uncollateralized loan
- LendApp reads user's SBT from blockchain
- Evaluates: verificationLevel >= 2 → Approve loan
- User receives loan based on their reputation

**Step 5: Update Score (Optional)**
- After using loans and paying on time
- User can update score by paying 2 USDC again
- New SBT with improved score

### MoSCoW Framework

#### MUST HAVE (MVP for Hackathon)

1. **x402 Payment System**
   - Complete x402 integration
   - Middleware in backend
   - SDK in frontend
   - Payment verification

2. **SBT Smart Contract**
   - ERC-5192 contract (Soulbound Token)
   - Mint SBT with metadata (scoreHash, verificationLevel)
   - Non-transferable

3. **Score Calculation**
   - Basic scoring algorithm
   - Factors: identity verification, documents, account age
   - Verifiable hash generation

4. **Basic Identity Verification**
   - ID upload
   - Manual or automatic verification
   - IdentityRegistry registration

5. **Functional Frontend**
   - User dashboard
   - x402 payment flow
   - Score and SBT visualization
   - Wallet connection

6. **Backend API**
   - Endpoint to calculate score (with x402)
   - Endpoint to query score
   - Smart contract integration

#### SHOULD HAVE (Important improvements)

1. **Advanced Scoring System**
   - More sophisticated algorithm
   - Multiple evaluation factors
   - Machine Learning (optional)

2. **Automatic Identity Verification**
   - OCR for ID reading
   - Automatic validation
   - Reduced approval time

3. **Enhanced Dashboard**
   - Score history
   - Evolution charts
   - List of platforms accepting ScorePass

4. **API for Other dApps**
   - `/api/score/verify` endpoint for verification
   - Developer documentation
   - Integration SDK

5. **Rewards System**
   - Score improvement for good behavior
   - Penalties for defaults
   - Dynamic updates

#### COULD HAVE (Nice to have)

1. **Multi-chain Reputation**
   - SBT verifiable across multiple blockchains
   - Reputation bridge

2. **Referral System**
   - Incentives for referring users
   - Score improvement through social network

3. **Oracle Integration**
   - External data for scoring
   - Income verification
   - Traditional credit history (if available)

4. **DAO Governance**
   - Community decides scoring criteria
   - Proposals and voting

5. **Analytics and Reports**
   - Analytics dashboard for platforms
   - Usage metrics
   - Market insights

#### WON'T HAVE (Out of scope)

1. **Complete Lending System**
   - MyScorePass only provides scoring, not loans
   - Other platforms handle loans

2. **Token Exchange**
   - Not an exchange
   - Only scoring and reputation

3. **Staking or Yield Farming**
   - No governance tokens
   - Simple pay-per-use model

4. **Transferable NFTs**
   - Only SBT (non-transferable)
   - Focus on reputation, not speculation

