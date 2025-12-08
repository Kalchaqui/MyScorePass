/**
 * Contract Service
 * Interacción con los contratos inteligentes de MyScorePass
 */

const { ethers } = require('ethers');

// Direcciones de contratos (deben estar en .env)
const IDENTITY_REGISTRY_ADDRESS = process.env.IDENTITY_REGISTRY_ADDRESS;
const CREDIT_SCORING_ADDRESS = process.env.CREDIT_SCORING_ADDRESS;
const SCOREPASS_SBT_ADDRESS = process.env.SCOREPASS_SBT_ADDRESS;

// RPC URL para Avalanche Fuji
const RPC_URL = process.env.RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';

// Private key del backend (para firmar transacciones)
const BACKEND_PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY;

// ABIs simplificados (en producción, usar ABIs completos)
const IDENTITY_REGISTRY_ABI = [
  'function isUserVerified(address _user) external view returns (bool)',
  'function getVerificationLevel(address _user) external view returns (uint256)',
  'function getIdentity(address _user) external view returns (bytes32 uniqueId, bool isVerified, uint256 verificationLevel, uint256 createdAt, uint256 documentCount)',
];

const CREDIT_SCORING_ABI = [
  'function calculateInitialScore(address _user) external returns (uint256)',
  'function getScore(address _user) external view returns (uint256 score, uint256 maxLoanAmount, uint256 lastUpdated)',
  'function rewardScore(address _user, uint256 _reward) external',
];

const SCOREPASS_SBT_ABI = [
  'function mintSBT(address _to, bytes32 _scoreHash, uint256 _score, uint256 _verificationLevel) external returns (uint256)',
  'function getUserSBT(address _user) external view returns (uint256 tokenId, bytes32 scoreHash, uint256 score, uint256 verificationLevel, uint256 issuedAt)',
  'function hasActiveSBT(address _user) external view returns (bool)',
  'function getSBTMetadata(uint256 _tokenId) external view returns (bytes32 scoreHash, uint256 score, uint256 verificationLevel, uint256 issuedAt, address issuer)',
];

let provider;
let signer;
let identityRegistry;
let creditScoring;
let scorePassSBT;

/**
 * Inicializar provider y contratos
 */
function initializeContracts() {
  if (!RPC_URL) {
    console.warn('⚠️  RPC_URL not configured, contracts will not work');
    return;
  }

  try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    
    if (BACKEND_PRIVATE_KEY) {
      signer = new ethers.Wallet(BACKEND_PRIVATE_KEY, provider);
    } else {
      console.warn('⚠️  BACKEND_PRIVATE_KEY not configured, using read-only provider');
      signer = provider;
    }

    if (IDENTITY_REGISTRY_ADDRESS) {
      identityRegistry = new ethers.Contract(
        IDENTITY_REGISTRY_ADDRESS,
        IDENTITY_REGISTRY_ABI,
        signer
      );
    }

    if (CREDIT_SCORING_ADDRESS) {
      creditScoring = new ethers.Contract(
        CREDIT_SCORING_ADDRESS,
        CREDIT_SCORING_ABI,
        signer
      );
    }

    if (SCOREPASS_SBT_ADDRESS) {
      scorePassSBT = new ethers.Contract(
        SCOREPASS_SBT_ADDRESS,
        SCOREPASS_SBT_ABI,
        signer
      );
    }

    console.log('✅ Contracts initialized');
  } catch (error) {
    console.error('❌ Error initializing contracts:', error);
  }
}

/**
 * Verificar identidad de un usuario
 */
async function verifyIdentity(walletAddress) {
  if (!identityRegistry) {
    console.warn('IdentityRegistry not configured');
    return { verified: false, level: 0 };
  }

  try {
    const isVerified = await identityRegistry.isUserVerified(walletAddress);
    const level = await identityRegistry.getVerificationLevel(walletAddress);
    
    return {
      verified: isVerified,
      level: Number(level),
    };
  } catch (error) {
    console.error('Error verifying identity:', error);
    return { verified: false, level: 0 };
  }
}

/**
 * Calcular score inicial
 */
async function calculateInitialScore(walletAddress) {
  if (!creditScoring) {
    console.warn('CreditScoring not configured, using default score');
    return { score: 300, maxLoanAmount: 3000000 };
  }

  try {
    // Calcular score inicial (si no existe)
    const tx = await creditScoring.calculateInitialScore(walletAddress);
    await tx.wait();
    
    // Obtener score
    const [score, maxLoanAmount] = await creditScoring.getScore(walletAddress);
    
    return {
      score: Number(score),
      maxLoanAmount: Number(maxLoanAmount),
    };
  } catch (error) {
    console.error('Error calculating score:', error);
    // Fallback a score por defecto
    return { score: 300, maxLoanAmount: 3000000 };
  }
}

/**
 * Obtener score existente
 */
async function getScore(walletAddress) {
  if (!creditScoring) {
    return null;
  }

  try {
    const [score, maxLoanAmount, lastUpdated] = await creditScoring.getScore(walletAddress);
    
    if (Number(score) === 0) {
      return null; // No tiene score aún
    }
    
    return {
      score: Number(score),
      maxLoanAmount: Number(maxLoanAmount),
      lastUpdated: Number(lastUpdated) * 1000, // Convertir a ms
    };
  } catch (error) {
    console.error('Error getting score:', error);
    return null;
  }
}

/**
 * Generar hash del score
 */
function generateScoreHash(walletAddress, score, verificationLevel, timestamp) {
  const data = ethers.solidityPackedKeccak256(
    ['address', 'uint256', 'uint256', 'uint256'],
    [walletAddress, score, verificationLevel, timestamp]
  );
  return data;
}

/**
 * Mint SBT a un usuario
 */
async function mintSBT(walletAddress, score, verificationLevel) {
  if (!scorePassSBT) {
    console.warn('ScorePassSBT not configured, skipping mint');
    return null;
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const scoreHash = generateScoreHash(walletAddress, score, verificationLevel, timestamp);
    
    const tx = await scorePassSBT.mintSBT(
      walletAddress,
      scoreHash,
      score,
      verificationLevel
    );
    
    const receipt = await tx.wait();
    
    // Obtener token ID del evento
    const mintEvent = receipt.logs.find(
      log => log.topics[0] === ethers.id('SBTMinted(address,uint256,bytes32,uint256,uint256)')
    );
    
    if (mintEvent) {
      const tokenId = Number(mintEvent.topics[2]);
      return {
        tokenId,
        scoreHash,
        txHash: receipt.hash,
      };
    }
    
    return {
      tokenId: null,
      scoreHash,
      txHash: receipt.hash,
    };
  } catch (error) {
    console.error('Error minting SBT:', error);
    return null;
  }
}

/**
 * Obtener SBT de un usuario
 */
async function getUserSBT(walletAddress) {
  if (!scorePassSBT) {
    return null;
  }

  try {
    const hasSBT = await scorePassSBT.hasActiveSBT(walletAddress);
    if (!hasSBT) {
      return null;
    }

    const [tokenId, scoreHash, score, verificationLevel, issuedAt] = 
      await scorePassSBT.getUserSBT(walletAddress);
    
    return {
      tokenId: Number(tokenId),
      scoreHash,
      score: Number(score),
      verificationLevel: Number(verificationLevel),
      issuedAt: Number(issuedAt) * 1000, // Convertir a ms
    };
  } catch (error) {
    console.error('Error getting user SBT:', error);
    return null;
  }
}

// Inicializar al cargar el módulo
initializeContracts();

module.exports = {
  verifyIdentity,
  calculateInitialScore,
  getScore,
  mintSBT,
  getUserSBT,
  generateScoreHash,
};

