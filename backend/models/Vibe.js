const mongoose = require('mongoose');

const VibeSchema = new mongoose.Schema({
  user: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Vibe', VibeSchema);