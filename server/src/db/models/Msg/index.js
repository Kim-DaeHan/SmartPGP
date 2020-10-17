import mongoose, { Schema } from 'mongoose';

const Msg = new Schema({
  from_email: {
    type: String,
  },
  to_email: {
    type: String,
  },
  content: {
    type: String,
  },
  sign: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  increTrust: {
    type: Number,
  },
});

export default mongoose.model('msg', Msg, 'msg');
