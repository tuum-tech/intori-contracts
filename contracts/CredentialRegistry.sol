// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "hardhat/console.sol";

contract CredentialRegistry {
    struct CredentialMetadata {
        address issuer;
        string recipientDid;
        uint256 timestamp;
        bytes32 credentialHash;
        string credentialType;
    }

    mapping(bytes32 => CredentialMetadata) public credentials;
    mapping(address => uint256) public issuedCount;
    mapping(address => bytes32[]) public credentialsByIssuer;
    mapping(string => uint256) public receivedCount;
    mapping(string => bytes32[]) public credentialsByRecipient;
    mapping(string => bytes32[]) public credentialsByType;

    event CredentialRegistered(
        bytes32 indexed credentialId,
        address indexed issuer,
        string indexed recipientDid,
        uint256 timestamp,
        bytes32 credentialHash,
        string credentialType
    );
    event CredentialVerified(
        bytes32 indexed credentialId,
        address indexed verifier
    );

    function registerCredential(
        bytes32 credentialId,
        string calldata recipientDid,
        bytes32 credentialHash,
        string calldata credentialType
    ) external {
        require(
            credentials[credentialId].issuer == address(0),
            "Credential already registered"
        );

        credentials[credentialId] = CredentialMetadata({
            issuer: msg.sender,
            recipientDid: recipientDid,
            timestamp: block.timestamp,
            credentialHash: credentialHash,
            credentialType: credentialType
        });

        issuedCount[msg.sender]++;
        receivedCount[recipientDid]++;
        credentialsByIssuer[msg.sender].push(credentialId);
        credentialsByRecipient[recipientDid].push(credentialId);
        credentialsByType[credentialType].push(credentialId);

        emit CredentialRegistered(
            credentialId,
            msg.sender,
            recipientDid,
            block.timestamp,
            credentialHash,
            credentialType
        );
    }

    function getCredentialsByIssuer(
        address issuer
    ) external view returns (bytes32[] memory) {
        return credentialsByIssuer[issuer];
    }

    function getCredentialsByRecipient(
        string calldata recipientDid
    ) external view returns (bytes32[] memory) {
        return credentialsByRecipient[recipientDid];
    }

    function getCredentialsByType(
        string calldata credentialType
    ) external view returns (bytes32[] memory) {
        return credentialsByType[credentialType];
    }

    function verifyCredential(
        bytes32 credentialId,
        bytes calldata signature
    ) external {
        CredentialMetadata storage credential = credentials[credentialId];
        require(
            bytes(credential.recipientDid).length != 0,
            "Credential does not exist"
        );

        // Verify the DID using the appropriate method
        address recipientAddress = verifyDid(
            credential.recipientDid,
            credentialId,
            signature
        );

        require(recipientAddress != address(0), "Invalid signature");

        emit CredentialVerified(credentialId, msg.sender);
    }

    function verifyDid(
        string memory did,
        bytes32 credentialId,
        bytes memory signature
    ) internal pure returns (address) {
        if (startsWith(did, "did:ethr:") || startsWith(did, "did:pkh:")) {
            return verifyEvmDid(did, credentialId, signature);
        }
        // Add other DID verification methods here
        // else if (startsWith(did, "did:other:")) {
        //     return verifyOtherDid(did, credentialId, signature);
        // }
        return address(0);
    }

    function verifyEvmDid(
        string memory did,
        bytes32 credentialId,
        bytes memory signature
    ) internal pure returns (address) {
        address recipientAddress = extractAddressFromDid(did);
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encodePacked(credentialId, recipientAddress))
            )
        );
        address recoveredAddress = recoverSigner(messageHash, signature);
        return
            (recoveredAddress == recipientAddress)
                ? recipientAddress
                : address(0);
    }

    function extractAddressFromDid(
        string memory did
    ) internal pure returns (address) {
        bytes memory didBytes = bytes(did);
        require(didBytes.length > 42, "Invalid DID format");

        bytes memory addressBytes = new bytes(42);
        for (uint256 i = didBytes.length - 42; i < didBytes.length; i++) {
            addressBytes[i - (didBytes.length - 42)] = didBytes[i];
        }

        return parseAddress(string(addressBytes));
    }

    function parseAddress(string memory str) internal pure returns (address) {
        bytes memory b = bytes(str);
        uint160 result = 0;
        uint160 digit;
        for (uint i = 2; i < 42; i++) {
            digit = uint160(uint8(b[i]));

            if (digit >= 48 && digit <= 57) {
                result += (digit - 48);
            } else if (digit >= 65 && digit <= 70) {
                result += (digit - 55);
            } else if (digit >= 97 && digit <= 102) {
                result += (digit - 87);
            }

            if (i < 41) {
                result *= 16;
            }
        }
        return address(result);
    }

    function recoverSigner(
        bytes32 _messageHash,
        bytes memory _signature
    ) internal pure returns (address) {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(_signature);
        return ecrecover(_messageHash, v, r, s);
    }

    function splitSignature(
        bytes memory sig
    ) internal pure returns (uint8, bytes32, bytes32) {
        require(sig.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function startsWith(
        string memory str,
        string memory prefix
    ) internal pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory prefixBytes = bytes(prefix);
        if (strBytes.length < prefixBytes.length) {
            return false;
        }
        for (uint256 i = 0; i < prefixBytes.length; i++) {
            if (strBytes[i] != prefixBytes[i]) {
                return false;
            }
        }
        return true;
    }
}
