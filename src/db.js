const mongoose = require('mongoose');

// Ganti nama database menjadi 'users' di URI
const mongoUri = 'mongodb+srv://mzakyzr4:a0LmxEqjh6YD0DNw@minatmatch.xfi0saq.mongodb.net/data';

mongoose.connect(mongoUri);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

module.exports = db;
