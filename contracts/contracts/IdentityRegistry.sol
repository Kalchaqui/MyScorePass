// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IdentityRegistry
 * @dev Gestión de identidades y Proof of Humanity para DeFiCred
 * Cada usuario tiene un ID único y puede cargar documentos para verificación
 */
contract IdentityRegistry {
    
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    // Estructura de identidad de usuario
    struct Identity {
        address walletAddress;
        bytes32 uniqueId; // ID único tipo Proof of Humanity
        bool isVerified;
        uint256 verificationLevel; // 0: no verificado, 1: básico, 2: medio, 3: completo
        uint256 createdAt;
        string[] documentHashes; // IPFS hashes de documentos
        bool exists;
    }
    
    // Mapeo de direcciones a identidades
    mapping(address => Identity) public identities;
    
    // Mapeo de uniqueId a dirección (evitar duplicados)
    mapping(bytes32 => address) public uniqueIdToAddress;
    
    // Array de direcciones registradas
    address[] public registeredAddresses;
    
    // Eventos
    event IdentityCreated(address indexed user, bytes32 uniqueId, uint256 timestamp);
    event IdentityVerified(address indexed user, uint256 verificationLevel, uint256 timestamp);
    event DocumentAdded(address indexed user, string documentHash, uint256 timestamp);
    event VerificationLevelUpdated(address indexed user, uint256 oldLevel, uint256 newLevel);
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Crear una nueva identidad
     * @param _documentHash Hash IPFS del primer documento (ej: DNI)
     */
    function createIdentity(string memory _documentHash) external {
        require(!identities[msg.sender].exists, "Identity already exists");
        require(bytes(_documentHash).length > 0, "Document hash required");
        
        // Generar ID único basado en address + timestamp + blockhash
        bytes32 uniqueId = keccak256(abi.encodePacked(msg.sender, block.timestamp, blockhash(block.number - 1)));
        
        require(uniqueIdToAddress[uniqueId] == address(0), "ID collision, try again");
        
        // Crear array de documentos
        string[] memory docs = new string[](1);
        docs[0] = _documentHash;
        
        // Crear identidad
        identities[msg.sender] = Identity({
            walletAddress: msg.sender,
            uniqueId: uniqueId,
            isVerified: false,
            verificationLevel: 0,
            createdAt: block.timestamp,
            documentHashes: docs,
            exists: true
        });
        
        uniqueIdToAddress[uniqueId] = msg.sender;
        registeredAddresses.push(msg.sender);
        
        emit IdentityCreated(msg.sender, uniqueId, block.timestamp);
        emit DocumentAdded(msg.sender, _documentHash, block.timestamp);
    }
    
    /**
     * @dev Agregar documento adicional a la identidad
     * @param _documentHash Hash IPFS del documento (ej: recibo de sueldo)
     */
    function addDocument(string memory _documentHash) external {
        require(identities[msg.sender].exists, "Identity does not exist");
        require(bytes(_documentHash).length > 0, "Document hash required");
        
        identities[msg.sender].documentHashes.push(_documentHash);
        
        emit DocumentAdded(msg.sender, _documentHash, block.timestamp);
    }
    
    /**
     * @dev Verificar identidad (solo owner/oráculo)
     * @param _user Dirección del usuario
     * @param _level Nivel de verificación (1-3)
     */
    function verifyIdentity(address _user, uint256 _level) external onlyOwner {
        require(identities[_user].exists, "Identity does not exist");
        require(_level >= 1 && _level <= 3, "Invalid verification level");
        
        uint256 oldLevel = identities[_user].verificationLevel;
        identities[_user].verificationLevel = _level;
        
        if (!identities[_user].isVerified) {
            identities[_user].isVerified = true;
            emit IdentityVerified(_user, _level, block.timestamp);
        }
        
        emit VerificationLevelUpdated(_user, oldLevel, _level);
    }
    
    /**
     * @dev Obtener información de identidad
     * @param _user Dirección del usuario
     */
    function getIdentity(address _user) external view returns (
        bytes32 uniqueId,
        bool isVerified,
        uint256 verificationLevel,
        uint256 createdAt,
        uint256 documentCount
    ) {
        require(identities[_user].exists, "Identity does not exist");
        Identity memory id = identities[_user];
        return (
            id.uniqueId,
            id.isVerified,
            id.verificationLevel,
            id.createdAt,
            id.documentHashes.length
        );
    }
    
    /**
     * @dev Obtener hash de documento específico
     * @param _user Dirección del usuario
     * @param _index Índice del documento
     */
    function getDocument(address _user, uint256 _index) external view returns (string memory) {
        require(identities[_user].exists, "Identity does not exist");
        require(_index < identities[_user].documentHashes.length, "Invalid document index");
        return identities[_user].documentHashes[_index];
    }
    
    /**
     * @dev Verificar si un usuario existe y está verificado
     * @param _user Dirección del usuario
     */
    function isUserVerified(address _user) external view returns (bool) {
        return identities[_user].exists && identities[_user].isVerified;
    }
    
    /**
     * @dev Obtener nivel de verificación del usuario
     * @param _user Dirección del usuario
     */
    function getVerificationLevel(address _user) external view returns (uint256) {
        if (!identities[_user].exists) return 0;
        return identities[_user].verificationLevel;
    }
    
    /**
     * @dev Obtener total de usuarios registrados
     */
    function getTotalUsers() external view returns (uint256) {
        return registeredAddresses.length;
    }
    
    /**
     * @dev Obtener unique ID del usuario
     * @param _user Dirección del usuario
     */
    function getUniqueId(address _user) external view returns (bytes32) {
        require(identities[_user].exists, "Identity does not exist");
        return identities[_user].uniqueId;
    }
}


