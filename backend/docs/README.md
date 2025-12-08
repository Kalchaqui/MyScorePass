# Backend Documentation

Documentation for MyScorePass backend API.

## 📚 Available Guides

- **[SETUP.md](./SETUP.md)** - Complete setup and configuration guide
  - All environment variables explained
  - x402 payment configuration
  - Blockchain integration setup
  - Troubleshooting guide

## 📝 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run server**
   ```bash
   npm run dev
   ```

See [SETUP.md](./SETUP.md) for detailed instructions.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── api/              # API layer
│   │   ├── controllers/  # Request handlers
│   │   ├── middlewares/  # Auth, x402, error handling
│   │   └── routes/       # Route definitions
│   ├── core/             # Business logic
│   │   ├── services/     # Business services
│   │   └── repositories/ # Data access
│   ├── shared/           # Shared utilities
│   │   ├── config/       # Configuration
│   │   ├── contracts/    # Contract ABIs
│   │   ├── errors/       # Error classes
│   │   ├── logger/       # Logging
│   │   └── constants/    # Constants
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
└── docs/                 # Documentation
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register exchange
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get profile

### Subscriptions (x402)
- `POST /api/subscriptions/purchase` - Purchase credits
- `GET /api/subscriptions/balance` - Get balance
- `GET /api/subscriptions/usage` - Get usage history

### Mock Users
- `GET /api/mockUsers` - Query users
- `GET /api/mockUsers/:id` - Get user details
- `GET /api/mockUsers/stats` - Get statistics

### SBT (Blockchain)
- `POST /api/sbt/mint` - Mint SBT
- `GET /api/sbt/:address` - Get user's SBT
- `GET /api/sbt/:address/verify` - Verify SBT
- `GET /api/sbt/stats/total-supply` - Get total supply

## 🔧 Key Features

### x402 Payment Integration
- HTTP 402 payment required responses
- Thirdweb facilitator integration
- Simulated mode for development

### Blockchain Integration
- Ethers.js for contract interactions
- SBT minting service
- Identity registry integration

### Credit System
- Prepaid subscription model
- Automatic credit consumption
- Usage tracking

## 🛠️ Development Commands

```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start

# Generate mock users
node src/scripts/seedMockUsers.js
```

## 📦 Dependencies

- `express` - Web framework
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `ethers` - Blockchain interactions
- `cors` - CORS middleware
- `dotenv` - Environment variables

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Environment variable protection

## 📞 Support

For detailed setup instructions, see [SETUP.md](./SETUP.md).
