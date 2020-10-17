class PGPContract {
  constructor(web3Data) {
    this.web3 = web3Data.web3;
    this.account = web3Data.accounts[0] || [];
    this.contract = web3Data.contract;
  }

  // 현재 계정 해시 얻는 함수
  get currentAcc() {
    return this.account;
  }

  // 메타 마스크 계정 변경 이벤트 리스너
  onAccChange(callback) {
    this.web3.currentProvider.publicConfigStore.on('update', (v) => {
    console.log("v : ", v);
      if (this.currentAcc.toUpperCase() !== v.selectedAddress.toUpperCase()) {
        if (callback) callback(v);
      }
    });
  }

  // 첫번째 계정이 맞는지 식별
  async isAdmin() {
    const owner = await this.contract.methods.owner().call();
    return owner === this.currentAcc;
  }

  // 유저 정보 저장하는 함수
  async userAppend(name, email, hash) {
    const res = await this.contract.methods.userAppend(name, email, hash).call({ from: this.currentAcc });
    await this.contract.methods.userAppend(name, email, hash).send({ from: this.currentAcc });
    return res;
  }

  // 공개키 키링 정보 저장하는 함수
  async keyRingAppend(time_stamp, publicKey, ownerTrust, hash) {
    const res = await this.contract.methods.keyRingAppend(time_stamp, publicKey, ownerTrust, hash).call({ from: this.currentAcc });
    await this.contract.methods.keyRingAppend(time_stamp, publicKey, ownerTrust, hash).send({ from: this.currentAcc });
    return res;
  }

  // 메시지 정보 저장하는 함수
  async MsgAppend(_id, content, sign, hash) {
    const res = await this.contract.methods.MsgAppend(_id, content, sign, hash).call({ from: this.currentAcc });
    await this.contract.methods.MsgAppend(_id, content, sign, hash).send({ from: this.currentAcc });
    return res;
  }

  // 유저 정보 얻는 함수
  async getUserInfo(userHash) {
    const res = await this.contract.methods.users(userHash).call();
    return res;
  }

  // 공개키 키링 정보 얻는 함수
  async getKeyRingInfo(userHash) {
    const res = await this.contract.methods.keyring(userHash).call();
    return res;
  }

  // 메시지 정보 얻는 함수
  async getMsgInfo(msgId) {
    const res = await this.contract.methods.messages(msgId).call();
    return res;
  }

  // 신뢰도 증가
  async trustIncre(hash, increTrust) {
    const res = await this.contract.methods.trustAdd(hash, increTrust).call({ from: this.currentAcc });
    await this.contract.methods.trustAdd(hash, increTrust).send({ from: this.currentAcc });
    return res;
  }

  // 신뢰도 감소
  async trustReduc(hash, subTrust) {
    const res = await this.contract.methods.trustSub(hash, subTrust).call({ from: this.currentAcc });
    await this.contract.methods.trustSub(hash, subTrust).send({ from: this.currentAcc });
    return res;
  }
}

export default PGPContract;