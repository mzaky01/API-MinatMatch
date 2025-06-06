const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: {
    data: Buffer,
    contentType: String,
  },
}, { versionKey: false });

const users = mongoose.model('users', userSchema);

module.exports = users;
