const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);
