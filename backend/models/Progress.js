const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  progress: {
    mood: { type: Number, default: 0 },
    learning: { type: Number, default: 0 },
    social: { type: Number, default: 0 },
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Progress', ProgressSchema);