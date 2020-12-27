// jshint esversion:6

const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const secret = process.env.MONGOOSE_ENCRYPTION_STRING;  // On live website, don't use process.env...

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']});

const User = mongoose.model('User', userSchema);

module.exports = User;
