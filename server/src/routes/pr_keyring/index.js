import express from "express";
import { Pr_keyring } from '../../db/models';
import NodeRSA from 'node-rsa';

const pr_keyring = express.Router();

// 프론트(api)와 연결되는 엔드포인트
pr_keyring.post('/append', append);
pr_keyring.get('/info/:_id', getInfo);
pr_keyring.get('/list', getList);

// 개인키 키링 생성
async function append(req, res) {
  try {
    // 공개키/개인키 생성
    const key = new NodeRSA({ b: 512 });
    const publickey = key.exportKey('pkcs8-public');
    const privatekey = key.exportKey('pkcs8-private');
    // 개인키 암호화
    const crypto = require("crypto");
    const cipher = crypto.createCipher('aes-256-cbc', 'password');
    const { hash: user_hash } = req.body;
    const encrypted_prkey = cipher.update(privatekey, 'utf8', 'binary') + cipher.final('binary');
    
    console.log("암호화 개인키 : ", encrypted_prkey);
    console.log("---", req.body);
    // 개인키 키링 정보 저장
    const pr_keyring = new Pr_keyring({ publickey, encrypted_prkey, user_hash });
    const data = await pr_keyring.save();

    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

// 개인키 정보
// 개인키 아이디로 개인키 하나의 정보를 획득
async function getInfo(req, res) {
  try {
    const { _id } = req.params;
    //const data2 = await Pr_keyring.findById(user_hash);
    //const data = await Pr_keyring.findById(user_hash).exec();
    
    
    const { ObjectId } = require('mongoose').Types;
    console.log(ObjectId.isValid(_id));
    console.log("data : ",data);
    //res.status(200).send(data);
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