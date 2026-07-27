const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  keyword: { type: String, required: true },
  conditions: { type: Object, default: {} },
  frequency: { type: String, enum: ['daily', 'weekly', 'realtime'], default: 'daily' },
  lastSent: { type: Date },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Alert', AlertSchema);
