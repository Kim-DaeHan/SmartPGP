pragma solidity >=0.4.0;

// TODO: 암호화/복호화

contract PGP {
    
    address public owner;

    mapping (uint => User) public users;
    mapping (uint => PuKeyRing) public keyring;

    uint nUser = 0;
    uint nKeyRing = 0;

    // 사용자
    struct User {
        string name;
        string email;
        string publicKey;        
        string hash;
    }

    // 공개키 키링
    struct PuKeyRing {
        uint timestamp;
        //string keyId; 매핑 아이디로 사용
        string publicKey;
        uint ownerTrust;
        string hash;    //userId
        string sign;
        uint signTrust;
    }

    constructor() public {
        owner = msg.sender;
    }

    function userAppend(string memory name, string memory email, string memory publicKey, string memory hash) public returns (uint userId) {
        userId = nUser++;
        users[userId] = User(name, email, publicKey, hash);
    }

    function keyRingAppend(uint timestamp, string memory publicKey, uint ownerTrust, string memory hash, string memory sign, uint signTrust) public returns (uint keyId) {
        keyId = nKeyRing++;
        keyring[keyId] = PuKeyRing(timestamp, publicKey, ownerTrust, hash, sign, signTrust);
    }
}