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
  async userAppend(name, email, publicKey, hash) {
    const res = await this.contract.methods.userAppend(name, email, publicKey, hash).call({ from: this.currentAcc });
    await this.contract.methods.userAppend(name, email, publicKey, hash).send({ from: this.currentAcc });
    return res;
  }

  // 공개키 키링 정보 저장하는 함수
  async keyRingAppend(timestamp, publicKey, ownerTrust, hash, sign, signTrust) {
    const res = await this.contract.methods.keyRingAppend(timestamp, publicKey, ownerTrust, hash, sign, signTrust).call({ from: this.currentAcc });
    await this.contract.methods.keyRingAppend(timestamp, publicKey, ownerTrust, hash, sign, signTrust).send({ from: this.currentAcc });
    return res;
  }

  // 유저 정보 얻는 함수
  async getUserInfo(userId) {
    const res = await this.contract.methods.users(userId).call();
    return res;
  }

  // 공개키 키링 정보 얻는 함수
  async getKeyRingInfo(keyId) {
    const res = await this.contract.methods.keyring(keyId).call();
    return res;
  }

}

export default PGPContract;