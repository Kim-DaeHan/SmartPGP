import React, { Component } from 'react';

import "./Client/Client.scss";

class Eva extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
          isLaoding: true,
        }
    }
    // 컴포넌트가 로드 되었을때 실행(라이프 싸이클 함수)
    async componentDidMount() {
        const { pgpContract } = this.props;
        const userHash = this.props.match.params.hash;

        
        //const currentUser =  await pgpContract.currentAcc;
        const userInfo = await pgpContract.getUserInfo(userHash);        
        const keyInfo = await pgpContract.getKeyRingInfo(userHash);
        

        const { name } = userInfo;
        const { ownerTrust } = keyInfo;
        console.log("신뢰도 : ",ownerTrust);

        // 계정 바꼇을때 새로고침
        pgpContract.onAccChange(() => window.location.reload());

        this.setState({
          name,
          ownerTrust,
          isLaoding: false,          
        });
     }

    render() {
        const { isLaoding } = this.state;                        
        // 로딩 중일때 로딩 화면 띄우기
        if (isLaoding) return <div>Loading UserInfo ...</div>        

        return (
            <section id="eva">
            {       
                <div>
                    <div className='evalay'>
                        <div className='eva1'>
                            <span className='evaspan'>The reliability of {this.state.name} is <span className="ownerTrust">{this.state.ownerTrust}</span></span> <br/>
                        </div>
                        <div className='eva1'>
                            <span className='evaspan'>Please evaluate the reliability</span> <br />
                        </div> 
                        <div className='evabtn'>
                            <button onClick={() => this.subTrust()}>-</button>              
                        </div>                                               
                    </div>                                        
                </div>
            }
      </section>
        );
    }

    // 신뢰도 감소
    async subTrust() {
        let increTrust = 0;
        let subTrust = 0;

        increTrust = this.props.match.params.increTrust;
        subTrust = Number(increTrust) + 10;

        console.log("subTrust : ",typeof subTrust);
        const { pgpContract } = this.props;
        const hash = this.props.match.params.hash;
        //신뢰도 감소
        await pgpContract.trustReduc(hash, subTrust);

        window.location.reload();
    }
};

export default Eva;