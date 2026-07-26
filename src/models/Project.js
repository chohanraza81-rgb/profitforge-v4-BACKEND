const mongoose = require('mongoose');
const ProjectSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  keyword: { type: String, required: true },
  data: { type: Object, required: true },
}, { timestamps: true });
module.exports = mongoose.model('Project', ProjectSchema);
