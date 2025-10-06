// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IdentityRegistrySimple
 * @dev Versión simplificada para Paseo (<49KB)
 */
contract IdentityRegistrySimple {
    
    address public owner;
    
    struct Identity {
        bytes32 uniqueId;
        bool isVerified;
        uint256 verificationLevel;
        uint256 createdAt;
        uint256 documentCount;
    }
    
    mapping(address => Identity) public identities;
    
    event IdentityCreated(address indexed user, bytes32 uniqueId);
    event IdentityVerified(address indexed user, uint256 level);
    
    constructor() {
        owner = msg.sender;
    }
    
    function createIdentity() external {
        require(identities[msg.sender].uniqueId == bytes32(0), "Already exists");
        
        bytes32 uid = keccak256(abi.encodePacked(msg.sender, block.timestamp));
        
        identities[msg.sender] = Identity({
            uniqueId: uid,
            isVerified: false,
            verificationLevel: 0,
            createdAt: block.timestamp,
            documentCount: 1
        });
        
        emit IdentityCreated(msg.sender, uid);
    }
    
    function addDocument() external {
        require(identities[msg.sender].uniqueId != bytes32(0), "No identity");
        identities[msg.sender].documentCount++;
    }
    
    function verifyIdentity(address _user, uint256 _level) external {
        require(msg.sender == owner, "Only owner");
        require(identities[_user].uniqueId != bytes32(0), "No identity");
        
        identities[_user].isVerified = true;
        identities[_user].verificationLevel = _level;
        
        emit IdentityVerified(_user, _level);
    }
    
    function getIdentity(address _user) external view returns (
        bytes32 uniqueId,
        bool isVerified,
        uint256 verificationLevel,
        uint256 createdAt,
        uint256 documentCount
    ) {
        Identity memory id = identities[_user];
        return (id.uniqueId, id.isVerified, id.verificationLevel, id.createdAt, id.documentCount);
    }
    
    function getVerificationLevel(address _user) external view returns (uint256) {
        return identities[_user].verificationLevel;
    }
    
    function isUserVerified(address _user) external view returns (bool) {
        return identities[_user].isVerified;
    }
}
