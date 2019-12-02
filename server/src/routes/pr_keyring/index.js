import express from "express";
import { Pr_keyring, User } from '../../db/models';
import NodeRSA from 'node-rsa';

const pr_keyring = express.Router();

// 프론트(api)와 연결되는 엔드포인트
pr_keyring.post('/append', append);
pr_keyring.get('/info/:key_id', getInfo);
pr_keyring.get('/list', getList);

// 공개키 키링 생성
async function append(req, res) {
  try {
    // 개인키 암호화
    const crypto = require("crypto");
    const cipher = crypto.createCipher('aes256', 'password');
    const { key_id, publickey, privatekey, user_hash } = req.body;
    cipher.update(privatekey, 'ascii', 'hex');
    const encrypted_prkey = cipher.final('hex');
    
    // 공개키 키링 정보 저장
    const pr_keyring = new Pr_keyring({ key_id, publickey, encrypted_prkey, user_hash });
    const data = await pr_keyring.save();

    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

// 공개키 정보
// 공개키 아이디로 공개키 하나의 정보를 획득
async function getInfo(req, res) {
  try {
    const { key_id } = req.params;
    const data = await Pr_keyring.findOne({ key_id });
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

// 키링 리스트 반환
async function getList(req, res) {
  try {
    const data = await Pr_keyring.find();
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

export default pr_keyring;