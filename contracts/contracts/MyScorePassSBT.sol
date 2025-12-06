// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyScorePassSBT
 * @dev Soulbound Token (ERC-5192) para certificar scores crediticios
 * No transferible - representa reputación financiera del usuario
 */
contract MyScorePassSBT is ERC721, Ownable {
    
    // Token ID counter
    uint256 private _tokenIdCounter;
    
    // Estructura de metadata del SBT
    struct SBTMetadata {
        bytes32 scoreHash;        // Hash del score (verificable)
        uint256 score;            // Score crediticio (0-1000)
        uint256 verificationLevel; // Nivel de verificación (0-3)
        uint256 issuedAt;         // Timestamp de emisión
        address issuer;            // Dirección que emitió el SBT
    }
    
    // Mapeo de token ID a metadata
    mapping(uint256 => SBTMetadata) public sbtMetadata;
    
    // Mapeo de address a token ID (un usuario = un SBT activo)
    mapping(address => uint256) public userToTokenId;
    
    // Mapeo de address a si tiene SBT activo
    mapping(address => bool) public hasActiveSBT;
    
    // Eventos
    event SBTMinted(
        address indexed to,
        uint256 indexed tokenId,
        bytes32 scoreHash,
        uint256 score,
        uint256 verificationLevel
    );
    
    event SBTRevoked(address indexed user, uint256 indexed tokenId);
    
    constructor() ERC721("MyScorePass SBT", "MSP") Ownable(msg.sender) {}
    
    /**
     * @dev Mint SBT a un usuario
     * Solo puede ser llamado por el owner (backend)
     */
    function mintSBT(
        address _to,
        bytes32 _scoreHash,
        uint256 _score,
        uint256 _verificationLevel
    ) external onlyOwner returns (uint256) {
        require(_to != address(0), "Cannot mint to zero address");
        require(_score <= 1000, "Score must be <= 1000");
        require(_verificationLevel <= 3, "Verification level must be <= 3");
        
        // Si el usuario ya tiene un SBT, revocar el anterior
        if (hasActiveSBT[_to]) {
            uint256 oldTokenId = userToTokenId[_to];
            _burn(oldTokenId);
            delete sbtMetadata[oldTokenId];
            emit SBTRevoked(_to, oldTokenId);
        }
        
        // Incrementar contador y obtener nuevo token ID
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        // Crear metadata
        sbtMetadata[newTokenId] = SBTMetadata({
            scoreHash: _scoreHash,
            score: _score,
            verificationLevel: _verificationLevel,
            issuedAt: block.timestamp,
            issuer: msg.sender
        });
        
        // Mint el token
        _mint(_to, newTokenId);
        
        // Actualizar mapeos
        userToTokenId[_to] = newTokenId;
        hasActiveSBT[_to] = true;
        
        emit SBTMinted(_to, newTokenId, _scoreHash, _score, _verificationLevel);
        
        return newTokenId;
    }
    
    /**
     * @dev Obtener metadata de un SBT
     */
    function getSBTMetadata(uint256 _tokenId) external view returns (
        bytes32 scoreHash,
        uint256 score,
        uint256 verificationLevel,
        uint256 issuedAt,
        address issuer
    ) {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");
        SBTMetadata memory metadata = sbtMetadata[_tokenId];
        return (
            metadata.scoreHash,
            metadata.score,
            metadata.verificationLevel,
            metadata.issuedAt,
            metadata.issuer
        );
    }
    
    /**
     * @dev Obtener SBT de un usuario
     */
    function getUserSBT(address _user) external view returns (
        uint256 tokenId,
        bytes32 scoreHash,
        uint256 score,
        uint256 verificationLevel,
        uint256 issuedAt
    ) {
        require(hasActiveSBT[_user], "User does not have active SBT");
        tokenId = userToTokenId[_user];
        SBTMetadata memory metadata = sbtMetadata[tokenId];
        return (
            tokenId,
            metadata.scoreHash,
            metadata.score,
            metadata.verificationLevel,
            metadata.issuedAt
        );
    }
    
    /**
     * @dev Verificar si un usuario tiene SBT y cumple requisitos
     */
    function verifySBT(address _user, uint256 _minVerificationLevel) external view returns (bool) {
        if (!hasActiveSBT[_user]) return false;
        uint256 tokenId = userToTokenId[_user];
        return sbtMetadata[tokenId].verificationLevel >= _minVerificationLevel;
    }
    
    /**
     * @dev Override _update para hacer el token no transferible (Soulbound)
     * Solo permite mint y burn, no transferencias
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Permitir mint (from es address(0))
        if (from == address(0)) {
            return super._update(to, tokenId, auth);
        }
        
        // Permitir burn (to es address(0)) solo si es el owner del contrato
        if (to == address(0) && auth == owner()) {
            return super._update(to, tokenId, auth);
        }
        
        // Bloquear todas las transferencias
        revert("SBT: Token is soulbound and cannot be transferred");
    }
    
    /**
     * @dev Bloquear aprobaciones
     */
    function approve(address, uint256) public pure override {
        revert("SBT: Token is soulbound and cannot be approved");
    }
    
    function setApprovalForAll(address, bool) public pure override {
        revert("SBT: Token is soulbound and cannot be approved");
    }
    
    /**
     * @dev Obtener total de SBTs emitidos
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
}

