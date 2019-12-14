import React, { Component } from 'react';
import NodeRSA from 'node-rsa';
import { sha512 } from 'js-sha512';

import UserForm from '../../components/UserForm';
import MailBox from '../../components/MailBox';

import "./Client.scss";
import { User, Msg, Pr_keyring } from 'ethpki-utils/api/models';

class Client extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: '',
      userInfo: {},
      users: [],
      messages: [],
      certs: [],
      isLaoding: false,
      receiver: undefined,
    }

    this.handleSubmitUserForm = this.handleSubmitUserForm.bind(this);
    this.showUserInfo = this.showUserInfo.bind(this);
  }

  // 컴포넌트가 로드 되었을때 실행(라이프 싸이클 함수)
  async componentDidMount() {
    const { pgpContract } = this.props;
    this.setState({ isLaoding: true });

    // 계정 바꼇을때 새로고침
    pgpContract.onAccChange(() => window.location.reload());

    // 현재 유저 정보, 모든 유지 리스트, 인증서 리스트 변수 선언
    const { data: userInfo } = await User.get(pgpContract.currentAcc);
    const { data: users } = await User.getAll();
    const { data: keyring } = await Pr_keyring.getAll();
    const { data: message } = await Msg.getAll();

    const valid = await this.validateSignatures(message, keyring);

    // 메시지 리스트 받아옴(인증된 메시지, 인증되지 않은 메시지)
    const [signedMsgs, unsignedMsgs] = await this.loadMessageData(userInfo.hash, valid);
    
    this.setState({
      userInfo,
      users,
      signedMsgs,
      unsignedMsgs,
      isLaoding: false,
    });
  }

  render() {
    const { userInfo, isLaoding } = this.state;

    // 로딩 중일때 로딩 화면 띄우기
    if (isLaoding) return <div>Loading UserInfo ...</div>

    return (
      <section id="client">
        {
          // 유저 정보가 있을 경우에는 renderContent를 하고 아닐 경우는 회원 가입 form 실행
          (userInfo.name && userInfo.email) ?
            this.renderContent()
            :
            < UserForm onSubmit={this.handleSubmitUserForm} />
        }
      </section>
    );
  }

  // 메시지 전송, 메시지 리스트 화면
  renderContent() {
    return (
      <div className='container'>
        <div className='sender-container main-container'>
          <label>SEND TO:
            <select
              onChange={e => this.setState({ receiver: e.target.value })}
              value={this.state.receiver}>
              <option value=''>--- Select Receiver ---</option>
              {
                // 수신자 선택
                this.state.users
                  .filter((v) => v.hash !== this.state.userInfo.hash)
                  .map((v, i) =>
                    <option
                      key={`user_${i}`}
                      value={v.hash}>{v.name}</option>
                  )
              }
            </select>
          </label>
          <textarea
            className='sender-textarea'
            onChange={e => this.setState({ content: e.target.value })}
            value={this.state.content} />
        </div>
        <div className='button-container'>
          <button className='btn' onClick={() => this.send()}>SEND</button>
        </div>
        <div className='receiver-container main-container'>
          <MailBox
            title='Signed Messages'
            msgs={this.state.signedMsgs}
            onClickName={this.showUserInfo} />
          <MailBox
            title='Unsigned Messages'
            msgs={this.state.unsignedMsgs}
            onClickName={this.showUserInfo} />
        </div>
      </div>
    );
  }

  // async : 비동기를 동기(순서대로)처럼 처리하도록
  // await : 동기 처럼 작동하도록 이전 코드가 완료될떄까지 기다리게 하는 코드
  // 메시지함에서 유저 이름 클릭 했을 때 인증서 정보 보여주는 함수
  async showUserInfo(msg) {
    const { pgpContract } = this.props;
    const { from: userHash } = msg;    

    // 인증서 정보, 서명 여부 변수
    const keyInfo = await pgpContract.getKeyRingInfo(userHash);
    const userInfo = await pgpContract.getuserInfo(userHash);
    const { hash, publicKey, ownerTrust } = keyInfo;
    const { name, email } = userInfo;

//     // 인증서는 존재 하는데 서명이 없을 경우
//     if ((sign_id !== 0 && !sign_id) || !isSignValid) {
//       alert(`
// [data]: ${data},
// [hash]: ${hash},
// [sign]: <Unsigned Certificate>
//       `);
//       return;
//     }

    // const signInfo = await pkiContract.getSignInfo(sign_id);
    // const { expiry, owner, sign } = signInfo;

    // 그 외의 경우(인증서도 존재하고 서명도 된 경우)
    alert(`
[name]: ${name},
[hash]: ${hash},
[email]: ${email},
[publicKey]: ${publicKey},
[ownerTrust]: ${ownerTrust}
    `);
  }

  // 메시지 리스트 로드 함수
  async loadMessageData(userHash, valid) {
    const { data: messages } = await Msg.getAll(userHash);
    return this.groupMessages(messages, valid);
  }

  // 메시지 리스트를 인증된 메시지와 인증되지 않은 메시지 분류
  groupMessages(messages, valid) {
    const signed = [];
    const unsigned = [];

    // 각 메시지 인증 여부를 식별 해서 인증되었을 경우 signed 배열에 넣고 아닐 경우 unsigned 배열에 넣는다.
    messages.forEach((v) => {
      if (valid) signed.push(v);
      else unsigned.push(v);
    });
    console.log("인증된 메시지 : ", signed);
    console.log("인증되지 않은 메시지 : ", unsigned);
    // 배열 리턴
    return [signed, unsigned];
  }

  // 인증서 폐기 목록 리턴(서명 여부 식별)
  async validateSignatures(message, keyring) {
    const { pgpContract } = this.props;
    const valid = {};
    const msgId = 0;

    // certs 배열을 돌면서...(v 는 각각의 배열, 순서대로(0, 1, 2...))
    for (const v of message) {  // 현재 로그인 한 유저 정보 말고는 다른 유저의 정보를 얻을 수 없기 때문에
      msgId++;
      const msgHash = sha512(v.content);
      const sign = v.sign;

      // 현재 인증서를 소유한 유저 정보 획득(인증서를 가지고 있는 유저 전부의 정보를 각각 획득)
      const keyInfo = keyring.find(keyring => keyring.user_hash === v.from);
      // 해당 유저의 publickey를 받아와 NodeRSA 객체 생성
      const { publickey } = keyInfo;
      const key = new NodeRSA(publickey);

      // 서명값 복호화 해서 인증서 hash 값과 일치하는지 비교
      const isValid = key.verify(msgHash, sign, 'utf8', 'base64');
      // 인증서 폐기 목록 생성
      valid[msgId] = isValid;
      console.log(keyInfo.user_hash ,"\npublickey : ", publickey ,"\nsign : ", sign, "\nisValid : ", isValid);
    }

    return valid;
  }

  // 메시지 전송
  async send() {
    const { pgpContract } = this.props;
    const { content, userInfo, receiver: to } = this.state;
    const from = userInfo.hash;

    try {
      const { data } = await Msg.send({ from, to, content });
      console.log("서명 값 : ", data.sign);
      await pgpContract.MsgAppend(data._id, content, data.sign, from);
      alert('성공적으로 발송되었습니다.');
      this.setState({ content: '' });
    } catch (e) {
      alert('메세지 전송 실패');
      console.error(e);
    }
  }

  // 회원 가입
  async handleSubmitUserForm(e) {
    // 기존 이벤트 발생하지 않도록 해줌
    e.preventDefault();

    const { pgpContract } = this.props;

    // 등록 데이터 생성
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const hash = pgpContract.currentAcc;

    try {
      // 유저 등록(서버, 블록체인)
      await pgpContract.userAppend(name, email, hash);
      await User.register({ name, email, hash });
      // 개인키 키링 등록(서버)
      const { data } = await Pr_keyring.append({ hash });
      console.log(data.publickey, data.encrypted_prkey, data.time_stamp, data._id);
      // 방금 저장한 개인키 키링에서 공개키와 생성일자 가져옴
      // 공개키 키링 등록(블록체인)
      await pgpContract.keyRingAppend(data.time_stamp, data.publickey, 100, hash);
      this.setState({ userInfo: { name, email, hash } });
    } catch (e) {
      alert('회원가입에 실패하였습니다.');
      console.error(e);
    }

  }
}

export default Client;