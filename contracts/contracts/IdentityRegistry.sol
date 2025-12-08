// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IdentityRegistry
 * @dev Identity and Proof of Humanity management for MyScorePass
 * @notice Each user has a unique ID and can upload documents for verification
 * @author MyScorePass Team
 */
contract IdentityRegistry {
    // ============================================
    // STATE VARIABLES
    // ============================================

    /// @notice Address of the contract owner
    address public owner;

    /// @dev User identity structure
    struct Identity {
        address walletAddress; // User's wallet address
        bytes32 uniqueId; // Unique ID (Proof of Humanity style)
        bool isVerified; // Whether identity is verified
        uint256 verificationLevel; // 0: not verified, 1: basic, 2: medium, 3: complete
        uint256 createdAt; // Timestamp of identity creation
        string[] documentHashes; // IPFS document hashes
        bool exists; // Whether identity exists
    }

    /// @dev Mapping of addresses to identities
    mapping(address => Identity) public identities;

    /// @dev Mapping of uniqueId to address (prevent duplicates)
    mapping(bytes32 => address) public uniqueIdToAddress;

    /// @dev Array of registered addresses
    address[] public registeredAddresses;

    // ============================================
    // EVENTS
    // ============================================

    /**
     * @dev Emitted when a new identity is created
     * @param user Address of the user
     * @param uniqueId Unique identifier generated
     * @param timestamp Creation timestamp
     */
    event IdentityCreated(
        address indexed user,
        bytes32 uniqueId,
        uint256 timestamp
    );

    /**
     * @dev Emitted when an identity is verified
     * @param user Address of the user
     * @param verificationLevel Level of verification achieved
     * @param timestamp Verification timestamp
     */
    event IdentityVerified(
        address indexed user,
        uint256 verificationLevel,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a document is added to an identity
     * @param user Address of the user
     * @param documentHash IPFS hash of the document
     * @param timestamp Addition timestamp
     */
    event DocumentAdded(
        address indexed user,
        string documentHash,
        uint256 timestamp
    );

    /**
     * @dev Emitted when verification level is updated
     * @param user Address of the user
     * @param oldLevel Previous verification level
     * @param newLevel New verification level
     */
    event VerificationLevelUpdated(
        address indexed user,
        uint256 oldLevel,
        uint256 newLevel
    );

    // ============================================
    // MODIFIERS
    // ============================================

    /**
     * @dev Restricts function access to contract owner only
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // ============================================
    // CONSTRUCTOR
    // ============================================

    /**
     * @dev Initializes the contract setting the deployer as the owner
     */
    constructor() {
        owner = msg.sender;
    }

    // ============================================
    // EXTERNAL FUNCTIONS
    // ============================================

    /**
     * @dev Creates a new identity for the caller
     * @notice User can only create one identity per address
     * @param _documentHash IPFS hash of first document (e.g., ID card)
     */
    function createIdentity(string memory _documentHash) external {
        require(!identities[msg.sender].exists, "Identity already exists");
        require(bytes(_documentHash).length > 0, "Document hash required");

        // Generate unique ID based on address + timestamp + blockhash
        bytes32 uniqueId = keccak256(
            abi.encodePacked(
                msg.sender,
                block.timestamp,
                blockhash(block.number - 1)
            )
        );

        require(
            uniqueIdToAddress[uniqueId] == address(0),
            "ID collision, try again"
        );

        // Create document array
        string[] memory docs = new string[](1);
        docs[0] = _documentHash;

        // Create identity
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
     * @dev Adds an additional document to caller's identity
     * @notice Identity must exist before adding documents
     * @param _documentHash IPFS hash of document (e.g., pay stub, bank statement)
     */
    function addDocument(string memory _documentHash) external {
        require(identities[msg.sender].exists, "Identity does not exist");
        require(bytes(_documentHash).length > 0, "Document hash required");

        identities[msg.sender].documentHashes.push(_documentHash);

        emit DocumentAdded(msg.sender, _documentHash, block.timestamp);
    }

    /**
     * @dev Verifies a user's identity
     * @notice Only callable by owner (oracle/backend)
     * @param _user Address of the user to verify
     * @param _level Verification level (1-3)
     *        1: Basic (ID verified)
     *        2: Medium (ID + address verified)
     *        3: Complete (ID + address + income verified)
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
     * @dev Gets identity information for a user
     * @param _user Address of the user
     * @return uniqueId Unique identifier
     * @return isVerified Whether identity is verified
     * @return verificationLevel Level of verification (0-3)
     * @return createdAt Creation timestamp
     * @return documentCount Number of documents uploaded
     */
    function getIdentity(
        address _user
    )
        external
        view
        returns (
            bytes32 uniqueId,
            bool isVerified,
            uint256 verificationLevel,
            uint256 createdAt,
            uint256 documentCount
        )
    {
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
     * @dev Gets a specific document hash from a user's identity
     * @param _user Address of the user
     * @param _index Index of the document in the array
     * @return string IPFS hash of the document
     */
    function getDocument(
        address _user,
        uint256 _index
    ) external view returns (string memory) {
        require(identities[_user].exists, "Identity does not exist");
        require(
            _index < identities[_user].documentHashes.length,
            "Invalid document index"
        );
        return identities[_user].documentHashes[_index];
    }

    /**
     * @dev Checks if a user exists and is verified
     * @param _user Address of the user
     * @return bool True if user exists and is verified
     */
    function isUserVerified(address _user) external view returns (bool) {
        return identities[_user].exists && identities[_user].isVerified;
    }

    /**
     * @dev Gets the verification level of a user
     * @param _user Address of the user
     * @return uint256 Verification level (0 if user doesn't exist)
     */
    function getVerificationLevel(
        address _user
    ) external view returns (uint256) {
        if (!identities[_user].exists) return 0;
        return identities[_user].verificationLevel;
    }

    /**
     * @dev Gets the total number of registered users
     * @return uint256 Total count of registered users
     */
    function getTotalUsers() external view returns (uint256) {
        return registeredAddresses.length;
    }

    /**
     * @dev Gets a user's unique ID
     * @param _user Address of the user
     * @return bytes32 Unique identifier
     */
    function getUniqueId(address _user) external view returns (bytes32) {
        require(identities[_user].exists, "Identity does not exist");
        return identities[_user].uniqueId;
    }
}
