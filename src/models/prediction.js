const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  predictions: [
    {
      career: String,
      probability: Number,
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const predictions = mongoose.model('predictions', predictionSchema);
module.exports = predictions;