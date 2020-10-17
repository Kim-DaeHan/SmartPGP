pragma solidity >=0.4.0;

// TODO: 암호화/복호화

contract PGP {
    address public owner;

    mapping (string => User) public users;
    mapping (string => PuKeyRing) public keyring;
    mapping (string => Message) public messages;

    uint nKeyRing = 0;

    // 사용자
    struct User {
        string name;
        string email;
        string hash;
    }

    // 공개키 키링
    struct PuKeyRing {
        string time_stamp;
        uint keyId;
        string publicKey;
        uint ownerTrust;
        string hash;    //userId
    }

    // 메시지
    struct Message {
        string _id;
        string content;
        string sign;
        string hash;
    }

    constructor() public {
        owner = msg.sender;
    }

    function userAppend(string memory name, string memory email, string memory hash) public {
        users[hash] = User(name, email, hash);
    }

    function keyRingAppend(string memory time_stamp, string memory publicKey, uint ownerTrust, string memory hash) public {
        nKeyRing++;
        keyring[hash] = PuKeyRing(time_stamp, nKeyRing, publicKey, ownerTrust, hash);
    }

    function MsgAppend(string memory _id, string memory content, string memory sign, string memory hash) public {
        messages[_id] = Message(_id, content, sign, hash);
    }

    function trustAdd(string memory hash, uint increTrust) public {
        PuKeyRing storage updateTrust = keyring[hash];
        updateTrust.ownerTrust += increTrust;
    }

    function trustSub(string memory hash, uint subTrust) public {
        PuKeyRing storage updateTrust = keyring[hash];
        updateTrust.ownerTrust -= subTrust;
    }
}