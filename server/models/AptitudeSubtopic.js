const mongoose = require('mongoose');

const AptitudeSubtopicSchema = new mongoose.Schema({
  mainTopic: { type: String, default: 'Quantitative Aptitude' },
  topic: { type: String, default: '' },
  subtopic: { type: String, default: '' },
  slug: { type: String, default: '' },
  notes: { type: String, default: '' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('AptitudeSubtopic', AptitudeSubtopicSchema);
