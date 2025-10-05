// Aptitude Question model placeholder
const mongoose = require('mongoose');
const QuestionSchema = new mongoose.Schema({
  statement: String,
  imageUrl: String,
  options: [String],
  correctAnswer: String,
  explanation: String,
  difficulty: String,
  // mainTopic is the primary category (e.g., 'Quantitative Aptitude')
  mainTopic: { type: String, default: '' },
  // marks this question as part of aptitude daily pool
  isAptitude: { type: Boolean, default: false },
  // whether the question should appear in daily aptitude counts
  availableDaily: { type: Boolean, default: false },
  // elaborated notes/formulas to show alongside the question
  notes: { type: String, default: '' },
  // topic helps categorize aptitude questions (e.g. 'math', 'logic', 'verbal', 'time')
  topic: { type: String, default: '' },
  // optional subtopic for finer categorization
  subtopic: { type: String, default: '' }
});
module.exports = mongoose.model('Question', QuestionSchema);