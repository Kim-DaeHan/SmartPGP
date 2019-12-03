import mongoose, { Schema } from 'mongoose';

const Pr_keyring = new Schema({
  publickey: {
    type: String,
  },
  encrypted_prkey: {
    type: String,
  },
  user_hash: {
    type: String,
    unique: true,
  },
  time_stamp: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model('pr_keyring', Pr_keyring, 'pr_keyring');
