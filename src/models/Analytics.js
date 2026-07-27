const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  userId: String,
  action: String,
  metadata: Object,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
