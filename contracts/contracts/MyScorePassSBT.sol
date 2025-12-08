// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyScorePassSBT
 * @dev Soulbound Token (ERC-5192) for certifying credit scores
 * @notice Non-transferable token representing user's financial reputation
 * @author MyScorePass Team
 */
contract MyScorePassSBT is ERC721, Ownable {
    // ============================================
    // STATE VARIABLES
    // ============================================

    /// @dev Counter for token IDs
    uint256 private _tokenIdCounter;

    /// @notice Validity period for SBTs (30 days)
    uint256 public constant VALIDITY_PERIOD = 30 days;

    /// @dev SBT metadata structure
    struct SBTMetadata {
        bytes32 scoreHash; // Hash of the score (verifiable)
        uint256 score; // Credit score (0-1000)
        uint256 verificationLevel; // Verification level (0-3)
        uint256 issuedAt; // Issuance timestamp
        uint256 expiresAt; // Expiration timestamp
        address issuer; // Address that issued the SBT
    }

    /// @dev Mapping from token ID to metadata
    mapping(uint256 => SBTMetadata) public sbtMetadata;

    /// @dev Mapping from user address to token ID (one user = one active SBT)
    mapping(address => uint256) public userToTokenId;

    /// @dev Mapping from address to whether they have an active SBT
    mapping(address => bool) public hasActiveSBT;

    // ============================================
    // EVENTS
    // ============================================

    /**
     * @dev Emitted when a new SBT is minted
     * @param to Address receiving the SBT
     * @param tokenId ID of the minted token
     * @param scoreHash Hash of the score data
     * @param score Credit score value
     * @param verificationLevel Level of identity verification
     */
    event SBTMinted(
        address indexed to,
        uint256 indexed tokenId,
        bytes32 scoreHash,
        uint256 score,
        uint256 verificationLevel
    );

    /**
     * @dev Emitted when an SBT is revoked
     * @param user Address of the user whose SBT was revoked
     * @param tokenId ID of the revoked token
     */
    event SBTRevoked(address indexed user, uint256 indexed tokenId);

    /**
     * @dev Emitted when an SBT is renewed
     * @param user Address of the user whose SBT was renewed
     * @param tokenId ID of the renewed token
     * @param newExpiresAt New expiration timestamp
     */
    event SBTRenewed(
        address indexed user,
        uint256 indexed tokenId,
        uint256 newExpiresAt
    );

    // ============================================
    // CONSTRUCTOR
    // ============================================

    /**
     * @dev Initializes the contract with name and symbol
     */
    constructor() ERC721("MyScorePass SBT", "MSP") Ownable(msg.sender) {}

    // ============================================
    // EXTERNAL FUNCTIONS
    // ============================================

    /**
     * @dev Mints an SBT to a user
     * @notice Only callable by the owner (backend)
     * @param _to Address to receive the SBT
     * @param _scoreHash Hash of the score data
     * @param _score Credit score (0-1000)
     * @param _verificationLevel Verification level (0-3)
     * @return newTokenId The ID of the newly minted token
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

        // If user already has an SBT, revoke the previous one
        if (hasActiveSBT[_to]) {
            uint256 oldTokenId = userToTokenId[_to];
            _burn(oldTokenId);
            delete sbtMetadata[oldTokenId];
            emit SBTRevoked(_to, oldTokenId);
        }

        // Increment counter and get new token ID
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        // Create metadata
        sbtMetadata[newTokenId] = SBTMetadata({
            scoreHash: _scoreHash,
            score: _score,
            verificationLevel: _verificationLevel,
            issuedAt: block.timestamp,
            expiresAt: block.timestamp + VALIDITY_PERIOD,
            issuer: msg.sender
        });

        // Mint the token
        _mint(_to, newTokenId);

        // Update mappings
        userToTokenId[_to] = newTokenId;
        hasActiveSBT[_to] = true;

        emit SBTMinted(_to, newTokenId, _scoreHash, _score, _verificationLevel);

        return newTokenId;
    }

    /**
     * @dev Gets the metadata of an SBT
     * @param _tokenId ID of the token
     * @return scoreHash Hash of the score
     * @return score Credit score value
     * @return verificationLevel Verification level
     * @return issuedAt Issuance timestamp
     * @return expiresAt Expiration timestamp
     * @return issuer Address that issued the SBT
     */
    function getSBTMetadata(
        uint256 _tokenId
    )
        external
        view
        returns (
            bytes32 scoreHash,
            uint256 score,
            uint256 verificationLevel,
            uint256 issuedAt,
            uint256 expiresAt,
            address issuer
        )
    {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");
        SBTMetadata memory metadata = sbtMetadata[_tokenId];
        return (
            metadata.scoreHash,
            metadata.score,
            metadata.verificationLevel,
            metadata.issuedAt,
            metadata.expiresAt,
            metadata.issuer
        );
    }

    /**
     * @dev Gets the SBT of a user
     * @param _user Address of the user
     * @return tokenId ID of the user's token
     * @return scoreHash Hash of the score
     * @return score Credit score value
     * @return verificationLevel Verification level
     * @return issuedAt Issuance timestamp
     * @return expiresAt Expiration timestamp
     */
    function getUserSBT(
        address _user
    )
        external
        view
        returns (
            uint256 tokenId,
            bytes32 scoreHash,
            uint256 score,
            uint256 verificationLevel,
            uint256 issuedAt,
            uint256 expiresAt
        )
    {
        require(hasActiveSBT[_user], "User does not have active SBT");
        tokenId = userToTokenId[_user];
        SBTMetadata memory metadata = sbtMetadata[tokenId];
        return (
            tokenId,
            metadata.scoreHash,
            metadata.score,
            metadata.verificationLevel,
            metadata.issuedAt,
            metadata.expiresAt
        );
    }

    /**
     * @dev Verifies if a user has an SBT and meets requirements
     * @param _user Address of the user
     * @param _minVerificationLevel Minimum required verification level
     * @return bool True if user has valid SBT with sufficient verification level
     */
    function verifySBT(
        address _user,
        uint256 _minVerificationLevel
    ) external view returns (bool) {
        if (!hasActiveSBT[_user]) return false;
        uint256 tokenId = userToTokenId[_user];
        return sbtMetadata[tokenId].verificationLevel >= _minVerificationLevel;
    }

    /**
     * @dev Checks if an SBT is valid (not expired)
     * @param _tokenId ID of the token
     * @return bool True if the SBT is still valid
     */
    function isValid(uint256 _tokenId) public view returns (bool) {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");
        return block.timestamp <= sbtMetadata[_tokenId].expiresAt;
    }

    /**
     * @dev Checks if an SBT is expired
     * @param _tokenId ID of the token
     * @return bool True if the SBT is expired
     */
    function isExpired(uint256 _tokenId) public view returns (bool) {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");
        return block.timestamp > sbtMetadata[_tokenId].expiresAt;
    }

    /**
     * @dev Renews an existing SBT (extends validity)
     * @notice Only callable by the owner (backend after x402 payment)
     * @param _tokenId ID of the token to renew
     */
    function renewSBT(uint256 _tokenId) external onlyOwner {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");

        address tokenOwner = ownerOf(_tokenId);
        uint256 newExpiresAt = block.timestamp + VALIDITY_PERIOD;

        sbtMetadata[_tokenId].expiresAt = newExpiresAt;

        emit SBTRenewed(tokenOwner, _tokenId, newExpiresAt);
    }

    /**
     * @dev Renews a user's SBT (lookup by address)
     * @notice Only callable by the owner (backend after x402 payment)
     * @param _user Address of the user
     */
    function renewUserSBT(address _user) external onlyOwner {
        require(hasActiveSBT[_user], "User does not have active SBT");
        uint256 tokenId = userToTokenId[_user];

        uint256 newExpiresAt = block.timestamp + VALIDITY_PERIOD;
        sbtMetadata[tokenId].expiresAt = newExpiresAt;

        emit SBTRenewed(_user, tokenId, newExpiresAt);
    }

    /**
     * @dev Gets the total number of SBTs issued
     * @return uint256 Total supply of SBTs
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================

    /**
     * @dev Override _update to make the token non-transferable (Soulbound)
     * @notice Only allows mint and burn, no transfers
     * @param to Destination address
     * @param tokenId ID of the token
     * @param auth Address authorized to perform the update
     * @return address Previous owner of the token
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Allow mint (from is address(0))
        if (from == address(0)) {
            return super._update(to, tokenId, auth);
        }

        // Allow burn (to is address(0)) only if msg.sender is the contract owner
        if (to == address(0) && msg.sender == owner()) {
            return super._update(to, tokenId, auth);
        }

        // Block all transfers
        revert("SBT: Token is soulbound and cannot be transferred");
    }
}
