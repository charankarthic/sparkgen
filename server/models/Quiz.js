const mongoose = require('mongoose');
const { QUIZ_DIFFICULTY } = require('../config/constants');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: Object.values(QUIZ_DIFFICULTY),
    default: QUIZ_DIFFICULTY.MEDIUM
  }
});

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['math', 'general', 'coding', 'science', 'word', 'grammar']
  },
  description: {
    type: String,
    required: true
  },
  questions: [QuestionSchema],
  difficulty: {
    type: String,
    enum: Object.values(QUIZ_DIFFICULTY),
    default: QUIZ_DIFFICULTY.MEDIUM
  },
  lastQuestionsGenerated: {
    type: Date,
    default: null
  },
  generationInProgress: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,  // This will automatically manage createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      console.log(`Converting quiz to JSON: ${ret.title}, type: ${ret.type}, questions: ${ret.questions ? ret.questions.length : 0}`);
      return ret;
    }
  }
});

module.exports = mongoose.model('Quiz', QuizSchema);