const mongoose = require('mongoose');
const AlertSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  keyword: String,
  conditions: Object,
  frequency: { type: String, default: 'daily' },
  lastSent: Date,
}, { timestamps: true });
module.exports = mongoose.model('Alert', AlertSchema);
