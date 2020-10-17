import express from "express";
import { Msg, Pr_keyring } from '../../db/models';
import NodeRSA from 'node-rsa';
import { sha512 } from 'js-sha512';
import nodemailer from 'nodemailer';

const msg = express.Router();

msg.post('/send', send);
msg.get('/list/:to', getList);

// 메시지 전송
async function send(req, res) {
  try {
    
    let increTrust = 0;
    
    const crypto = require("crypto");
    
    const { from, to, content, publicKey, ownerTrust, to_trust, name, from_email, to_email } = req.body;
    const keyInfo = await Pr_keyring.findOne({ user_hash: from });
    // 발신자 기준으로 유저 이름, 유저 개인키 획득
    const { user_hash: sender_hash, encrypted_prkey } = keyInfo;
    const decipher = crypto.createDecipher('aes-256-cbc', 'password');
    const privatekey = decipher.update(encrypted_prkey, 'binary', 'utf8') + decipher.final('utf8');
     
    console.log("개인키 복호화 : ", from, to, content, publicKey, ownerTrust, name, from_email, to_email);
    // 메시지 내용 해시화 
    const msgHash = sha512(content);
    // 개인키로 메시지 서명
    const prkey = new NodeRSA(privatekey);
    const sign = prkey.sign(msgHash, 'binary');

    //서명 확인
    const puKey = new NodeRSA(publicKey);
    const isValid = puKey.verify(msgHash, sign, 'utf8', 'binary');

    if(isValid){
      increTrust = to_trust / 10;
      increTrust = Math.round(increTrust);
      console.log("increTrust : ", increTrust);
      console.log("increTrust : ", typeof increTrust);
    }

    // 메시지 정보를 데이터베이스에 저장
    const msg = new Msg({ from_email, to_email, content, sign, increTrust });
    //console.log("test----------- : ", from, sender_hash);
    const data = await msg.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth:{
        user: from_email,
        pass: 'eogks6637!',
      },
    });

    const mailOptions = {
      //from: from_email+'('+name+')',
      from: from_email,
      to: to_email,
      subject: ownerTrust < 70 ? '(unreliable)This is '+name : 'This is ' + name,
      html: '<h1>'+content+'</h1>'+
      '<p>Click <a href="http://localhost:3000/Eva/' + from + '/' + increTrust + '">Delete</a></p>'
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if(error) {
        console.log(error);
      } else {
        console.log(`Message sent: ${info.response}`);
      }
      transporter.close();
    });   

    // 저장된 데이터를 요청자에게 반환
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

// 메시지 리스트
// 수신자 계정 정보(to)를 기준으로 메시지 리스트 반환
async function getList(req, res) {
  const { to } = req.params;

  try {
    // user 테이블과 msg.from = hash 로 조인을 한 결과 반환
    const data = await Msg.aggregate([
      {
        $lookup: {
          from: 'user',
          localField: 'from',
          foreignField: 'hash',
          as: 'user', // join 시 컬럼명
        },
      },
      {
        $match: { to }, // where 절
      },
    ]);
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

export default msg;