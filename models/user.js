const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  user: {
    type: String,
    required: true,
  },
  pass: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  }
}, { timestamps: true});

const User = mongoose.model('User', userSchema);

module.exports = User;