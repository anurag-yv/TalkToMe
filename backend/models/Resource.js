const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  category: { type: String, default: 'general' }, // e.g., 'learning', 'wellness'
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Resource', ResourceSchema);