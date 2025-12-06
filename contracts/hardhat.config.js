require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Avalanche Fuji Testnet
    avalancheFuji: {
      url: process.env.AVALANCHE_FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 5000000,
      gasPrice: 25000000000, // 25 gwei
    },
    // Moonbase Alpha Testnet (Moonbeam's testnet) - Legacy
    moonbase: {
      url: "https://rpc.api.moonbase.moonbeam.network",
      chainId: 1287,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 5000000,
      gasPrice: 1000000000
    },
    // Configuración para Paseo testnet (Asset Hub con soporte EVM) - Legacy
    paseo: {
      url: process.env.PASEO_RPC_URL || "https://testnet-passet-hub-eth-rpc.polkadot.io",
      chainId: 420420422,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 5000000,
      gasPrice: 1000000000,
      timeout: 60000
    },
  },
  etherscan: {
    apiKey: {
      moonbaseAlpha: process.env.MOONSCAN_API_KEY || ""
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};


