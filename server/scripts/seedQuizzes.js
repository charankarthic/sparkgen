const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const quizService = require('../services/quizService');
const config = require('../config');

// Connect to MongoDB
async function connectDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.databaseUrl);
    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.error('MongoDB connection error:', error.stack);
    process.exit(1);
  }
}

async function seedQuizzes() {
  try {
    // Delete existing quizzes first to regenerate with new questions
    console.log('Deleting existing quizzes to regenerate with new questions...');
    await Quiz.deleteMany({});

    console.log('Seeding quizzes...');

    // Define seed quizzes
    const quizzes = [
      {
        title: 'Math Quiz',
        type: 'math',
        description: 'Test your math skills',
        questions: await quizService.generateQuizQuestions({
          topic: 'Algebra',
          quizType: 'multiple_choice',
          difficulty: 'medium'
        })
      },
      {
        title: 'Escape Room',
        type: 'general',
        description: 'General knowledge challenge',
        questions: await quizService.generateQuizQuestions({
          topic: 'General Knowledge',
          quizType: 'multiple_choice',
          difficulty: 'hard'
        })
      },
      {
        title: 'Coding Quiz',
        type: 'coding',
        description: 'Programming challenges',
        questions: await quizService.generateQuizQuestions({
          topic: 'Python Basics',
          quizType: 'multiple_choice',
          difficulty: 'easy'
        })
      },
      {
        title: 'Science Quiz',
        type: 'science',
        description: 'Science mysteries',
        questions: await quizService.generateQuizQuestions({
          topic: 'Physics',
          quizType: 'multiple_choice',
          difficulty: 'medium'
        })
      },
      {
        title: 'Word Scramble',
        type: 'word',
        description: 'Word puzzles',
        questions: await quizService.generateQuizQuestions({
          topic: 'Vocabulary',
          quizType: 'multiple_choice',
          difficulty: 'medium'
        })
      },
      {
        title: 'Grammar Quiz',
        type: 'grammar',
        description: 'Test your grammar',
        questions: await quizService.generateQuizQuestions({
          topic: 'English Grammar',
          quizType: 'multiple_choice',
          difficulty: 'medium'
        })
      }
    ];

    // Insert quizzes
    await Quiz.insertMany(quizzes);

    console.log('Quizzes seeded successfully!');
  } catch (error) {
    console.error('Error seeding quizzes:', error.stack || error);
    throw error; // Rethrow to allow handling at a higher level
  }
}

// Run as standalone script
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedQuizzes();
      console.log('Quiz seeding completed successfully.');
      process.exit(0);
    } catch (error) {
      console.error('Failed to seed quizzes:', error.stack || error);
      process.exit(1);
    }
  })();
}

module.exports = { seedQuizzes };