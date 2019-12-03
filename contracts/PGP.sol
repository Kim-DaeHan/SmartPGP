pragma solidity >=0.4.0;

// TODO: 암호화/복호화

contract PGP {
    
    address public owner;

    mapping (uint => User) public users;
    mapping (uint => PuKeyRing) public keyring;
    mapping (uint => Message) public messages;

    uint nUser = 0;
    uint nKeyRing = 0;
    uint nMessage = 0;

    // 사용자
    struct User {
        string name;
        string email;     
        string hash;
    }

    // 공개키 키링
    struct PuKeyRing {
        uint timestamp;
        //string keyId; 매핑 아이디로 사용
        string publicKey;
        uint ownerTrust;
        string hash;    //userId
    }

    // 메시지
    struct Message {
        string content;
        string sign;
        string hash;
    }

    constructor() public {
        owner = msg.sender;
    }

    function userAppend(string memory name, string memory email, string memory hash) public returns (uint userId) {
        userId = nUser++;
        users[userId] = User(name, email, hash);
    }

    function keyRingAppend(uint timestamp, string memory publicKey, uint ownerTrust, string memory hash) public returns (uint keyId) {
        keyId = nKeyRing++;
        keyring[keyId] = PuKeyRing(timestamp, publicKey, ownerTrust, hash);
    }

    function MsgAppend(string memory content, string memory sign, string memory hash) public returns (uint msgId) {
        msgId = nMessage++;
        messages[msgId] = Message(content, sign, hash);
    }
}