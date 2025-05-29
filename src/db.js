const mongoose = require('mongoose');
require('dotenv').config();

console.log(process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI);
console.log('Connecting to MongoDB Atlas...');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

module.exports = db;
