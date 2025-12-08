/**
 * MyScorePassSBT Contract ABI
 * This will be replaced with the actual ABI after contract compilation
 */

module.exports = [
    // Constructor
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    // Events
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
            { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "indexed": false, "internalType": "bytes32", "name": "scoreHash", "type": "bytes32" },
            { "indexed": false, "internalType": "uint256", "name": "score", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "verificationLevel", "type": "uint256" }
        ],
        "name": "SBTMinted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
            { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "SBTRevoked",
        "type": "event"
    },
    // Functions
    {
        "inputs": [
            { "internalType": "address", "name": "_to", "type": "address" },
            { "internalType": "bytes32", "name": "_scoreHash", "type": "bytes32" },
            { "internalType": "uint256", "name": "_score", "type": "uint256" },
            { "internalType": "uint256", "name": "_verificationLevel", "type": "uint256" }
        ],
        "name": "mintSBT",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_tokenId", "type": "uint256" }],
        "name": "getSBTMetadata",
        "outputs": [
            { "internalType": "bytes32", "name": "scoreHash", "type": "bytes32" },
            { "internalType": "uint256", "name": "score", "type": "uint256" },
            { "internalType": "uint256", "name": "verificationLevel", "type": "uint256" },
            { "internalType": "uint256", "name": "issuedAt", "type": "uint256" },
            { "internalType": "address", "name": "issuer", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
        "name": "getUserSBT",
        "outputs": [
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "internalType": "bytes32", "name": "scoreHash", "type": "bytes32" },
            { "internalType": "uint256", "name": "score", "type": "uint256" },
            { "internalType": "uint256", "name": "verificationLevel", "type": "uint256" },
            { "internalType": "uint256", "name": "issuedAt", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "_user", "type": "address" },
            { "internalType": "uint256", "name": "_minVerificationLevel", "type": "uint256" }
        ],
        "name": "verifySBT",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "hasActiveSBT",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    }
];
