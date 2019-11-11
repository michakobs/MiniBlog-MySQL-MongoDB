const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    privilege: String,
    activationcode: String,
    activate: String
  });

module.exports = mongoose.model('User', UserSchema);