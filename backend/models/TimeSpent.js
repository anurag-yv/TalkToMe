const mongoose = require('mongoose');

const TimeSpentSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  timeSpent: { type: Number, default: 0 }, // Time in seconds
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TimeSpent', TimeSpentSchema);