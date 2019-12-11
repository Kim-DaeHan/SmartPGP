import React, { Component } from "react";
import loadWeb3 from "ethpki-utils/loadWeb3";
import PGPContract from 'ethpki-utils/PGPContract';

import Client from './pages/Client';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pgpContract: undefined,
    }
  }

  async componentDidMount() {
    await this.loadWeb3();
  };

  render() {
    // pgpContract 객체가 존재하지 않을때는 로딩화면 보여주기
    if (!this.state.pgpContract) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div id='app'>
         {/* state에 저장된 pgpContract 객체를 하위 컴포넌트로 전달 */}
        <Client pgpContract={this.state.pgpContract} />
      </div>
    );
  }

  // web3를 로드하고 PGPContract 객체 생성 후 state로 저장
  async loadWeb3() {
    const web3 = await loadWeb3();
    const pgpContract = new PGPContract(web3);
    this.setState({ pgpContract });
  }
}

export default App;
