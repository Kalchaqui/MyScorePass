// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IdentityRegistrySimple.sol";

/**
 * @title CreditScoring
 * @dev Sistema de scoring de crédito basado en verificación de identidad y documentos
 */
contract CreditScoring {
    
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    IdentityRegistrySimple public identityRegistry;
    
    // Estructura de score de crédito
    struct CreditScore {
        uint256 score; // Score de 0 a 1000
        uint256 maxLoanAmount; // Monto máximo que puede pedir prestado (en wei)
        uint256 lastUpdated;
        bool exists;
    }
    
    // Mapeo de usuarios a sus scores
    mapping(address => CreditScore) public creditScores;
    
    // Parámetros de scoring
    uint256 public constant MIN_SCORE = 0;
    uint256 public constant MAX_SCORE = 1000;
    
    // NIVEL 1 PREVENCIÓN: Montos base conservadores para minimizar riesgo
    // Usuarios nuevos empiezan con límites MUY BAJOS
    uint256 public baseAmountLevel1 = 100 * 10**6;  // $100 USDC - Usuarios nuevos
    uint256 public baseAmountLevel2 = 300 * 10**6;  // $300 USDC - Con más docs
    uint256 public baseAmountLevel3 = 500 * 10**6;  // $500 USDC - Verificación completa
    
    // Solo usuarios con score alto (>700) pueden acceder a más
    uint256 public highScoreBonus = 1000 * 10**6;   // Bonus $1,000 para scores >700
    
    // Eventos
    event ScoreCalculated(address indexed user, uint256 score, uint256 maxLoanAmount, uint256 timestamp);
    event ScoreUpdated(address indexed user, uint256 oldScore, uint256 newScore);
    event BaseAmountsUpdated(uint256 level1, uint256 level2, uint256 level3);
    
    constructor(address _identityRegistry) {
        owner = msg.sender;
        require(_identityRegistry != address(0), "Invalid registry address");
        identityRegistry = IdentityRegistrySimple(_identityRegistry);
    }
    
    /**
     * @dev Calcular score inicial del usuario
     * Score basado en:
     * - Nivel de verificación (40%)
     * - Cantidad de documentos (30%)
     * - Antigüedad de la cuenta (30%)
     */
    function calculateInitialScore(address _user) external returns (uint256) {
        require(!creditScores[_user].exists, "Score already exists");
        
        // Verificar que el usuario tenga identidad
        (
            bytes32 uniqueId,
            bool isVerified,
            uint256 verificationLevel,
            uint256 createdAt,
            uint256 documentCount
        ) = identityRegistry.getIdentity(_user);
        
        require(uniqueId != bytes32(0), "User has no identity");
        require(isVerified, "User not verified");
        
        uint256 score = _calculateScore(_user, verificationLevel, documentCount, createdAt);
        uint256 maxLoan = _calculateMaxLoanAmount(verificationLevel, score);
        
        creditScores[_user] = CreditScore({
            score: score,
            maxLoanAmount: maxLoan,
            lastUpdated: block.timestamp,
            exists: true
        });
        
        emit ScoreCalculated(_user, score, maxLoan, block.timestamp);
        
        return score;
    }
    
    /**
     * @dev Actualizar score existente
     */
    function updateScore(address _user) external returns (uint256) {
        require(creditScores[_user].exists, "Score does not exist");
        
        (
            ,
            bool isVerified,
            uint256 verificationLevel,
            uint256 createdAt,
            uint256 documentCount
        ) = identityRegistry.getIdentity(_user);
        
        require(isVerified, "User not verified");
        
        uint256 oldScore = creditScores[_user].score;
        uint256 newScore = _calculateScore(_user, verificationLevel, documentCount, createdAt);
        uint256 maxLoan = _calculateMaxLoanAmount(verificationLevel, newScore);
        
        creditScores[_user].score = newScore;
        creditScores[_user].maxLoanAmount = maxLoan;
        creditScores[_user].lastUpdated = block.timestamp;
        
        emit ScoreUpdated(_user, oldScore, newScore);
        
        return newScore;
    }
    
    /**
     * @dev Cálculo interno del score
     */
    function _calculateScore(
        address _user,
        uint256 _verificationLevel,
        uint256 _documentCount,
        uint256 _createdAt
    ) internal view returns (uint256) {
        uint256 score = 0;
        
        // 1. Score por nivel de verificación (40% del total = 400 puntos)
        if (_verificationLevel == 1) {
            score += 200; // Básico
        } else if (_verificationLevel == 2) {
            score += 300; // Medio
        } else if (_verificationLevel == 3) {
            score += 400; // Completo
        }
        
        // 2. Score por documentos (30% del total = 300 puntos)
        // Máximo 5 documentos considerados
        uint256 docScore = (_documentCount > 5) ? 5 : _documentCount;
        score += docScore * 60; // 60 puntos por documento
        
        // 3. Score por antigüedad (30% del total = 300 puntos)
        // Máximo 90 días considerados
        uint256 daysOld = (block.timestamp - _createdAt) / 1 days;
        if (daysOld > 90) daysOld = 90;
        score += (daysOld * 300) / 90;
        
        // Asegurar que el score esté en el rango válido
        if (score > MAX_SCORE) score = MAX_SCORE;
        
        return score;
    }
    
    /**
     * @dev Calcular monto máximo de préstamo basado en nivel y score
     * NIVEL 1 PREVENCIÓN: Límites conservadores para nuevos usuarios
     */
    function _calculateMaxLoanAmount(uint256 _verificationLevel, uint256 _score) internal view returns (uint256) {
        uint256 baseAmount;
        
        if (_verificationLevel == 1) {
            baseAmount = baseAmountLevel1;  // $100
        } else if (_verificationLevel == 2) {
            baseAmount = baseAmountLevel2;  // $300
        } else if (_verificationLevel == 3) {
            baseAmount = baseAmountLevel3;  // $500
        } else {
            return 0;
        }
        
        // NIVEL 1: Ajuste moderado por score (solo +30% máximo para nuevos)
        uint256 multiplier = 100 + (_score * 30) / MAX_SCORE; // 100% - 130%
        uint256 finalAmount = (baseAmount * multiplier) / 100;
        
        // BONUS: Score alto (>700) desbloquea límite mayor
        if (_score >= 700) {
            finalAmount += (highScoreBonus * (_score - 700)) / 300;
        }
        
        return finalAmount;
    }
    
    /**
     * @dev Obtener score del usuario
     */
    function getScore(address _user) external view returns (uint256 score, uint256 maxLoanAmount, uint256 lastUpdated) {
        require(creditScores[_user].exists, "Score does not exist");
        CreditScore memory cs = creditScores[_user];
        return (cs.score, cs.maxLoanAmount, cs.lastUpdated);
    }
    
    /**
     * @dev Verificar si el usuario puede pedir un préstamo de cierto monto
     */
    function canBorrow(address _user, uint256 _amount) external view returns (bool) {
        if (!creditScores[_user].exists) return false;
        return _amount <= creditScores[_user].maxLoanAmount;
    }
    
    /**
     * @dev Actualizar montos base (solo owner)
     */
    function updateBaseAmounts(uint256 _level1, uint256 _level2, uint256 _level3) external onlyOwner {
        baseAmountLevel1 = _level1;
        baseAmountLevel2 = _level2;
        baseAmountLevel3 = _level3;
        
        emit BaseAmountsUpdated(_level1, _level2, _level3);
    }
    
    // NIVEL 2: Lista negra de usuarios con defaults
    mapping(address => bool) public blacklisted;
    mapping(address => uint256) public defaultCount;
    
    event UserBlacklisted(address indexed user, uint256 defaultCount, uint256 timestamp);
    event DefaultRecorded(address indexed user, uint256 oldScore, uint256 newScore);
    
    /**
     * @dev NIVEL 2: Penalizar score por préstamo impago
     * Destruye reputación y registra públicamente
     */
    function penalizeScore(address _user, uint256 _penaltyPoints) external onlyOwner {
        require(creditScores[_user].exists, "Score does not exist");
        
        uint256 oldScore = creditScores[_user].score;
        uint256 newScore = oldScore > _penaltyPoints ? oldScore - _penaltyPoints : 0;
        
        // Actualizar score
        creditScores[_user].score = newScore;
        creditScores[_user].maxLoanAmount = newScore > 0 ? 
            (creditScores[_user].maxLoanAmount * newScore / oldScore) : 0;
        creditScores[_user].lastUpdated = block.timestamp;
        
        // NIVEL 2: Registrar default públicamente
        defaultCount[_user]++;
        
        // Si tiene 2+ defaults, BLACKLIST permanente
        if (defaultCount[_user] >= 2) {
            blacklisted[_user] = true;
            emit UserBlacklisted(_user, defaultCount[_user], block.timestamp);
        }
        
        emit DefaultRecorded(_user, oldScore, newScore);
        emit ScoreUpdated(_user, oldScore, newScore);
    }
    
    /**
     * @dev Verificar si un usuario está en lista negra
     */
    function isBlacklisted(address _user) external view returns (bool) {
        return blacklisted[_user];
    }
    
    /**
     * @dev Obtener cantidad de defaults de un usuario
     */
    function getDefaultCount(address _user) external view returns (uint256) {
        return defaultCount[_user];
    }
    
    /**
     * @dev Mejorar score por buen comportamiento (llamado por LoanManager)
     */
    function rewardScore(address _user, uint256 _rewardPoints) external onlyOwner {
        require(creditScores[_user].exists, "Score does not exist");
        
        uint256 oldScore = creditScores[_user].score;
        uint256 newScore = oldScore + _rewardPoints;
        if (newScore > MAX_SCORE) newScore = MAX_SCORE;
        
        creditScores[_user].score = newScore;
        
        // Recalcular max loan amount
        uint256 verificationLevel = identityRegistry.getVerificationLevel(_user);
        creditScores[_user].maxLoanAmount = _calculateMaxLoanAmount(verificationLevel, newScore);
        creditScores[_user].lastUpdated = block.timestamp;
        
        emit ScoreUpdated(_user, oldScore, newScore);
    }
}


