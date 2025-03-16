const Quiz = require('../models/Quiz');
const quizService = require('../services/quizService');

async function seedQuizzes() {
  try {
    console.log('Checking quiz data...');

    // Define expected quiz types
    const expectedQuizTypes = ['math', 'general', 'coding', 'science', 'word', 'grammar'];

    // Check if all expected quiz types exist
    const existingQuizTypes = await Quiz.distinct('type');
    console.log(`Found ${existingQuizTypes.length} quiz types: ${existingQuizTypes.join(', ')}`);

    const missingQuizTypes = expectedQuizTypes.filter(type => !existingQuizTypes.includes(type));

    if (missingQuizTypes.length === 0) {
      console.log('All required quiz types already exist. Skipping seeding...');
      return;
    }

    console.log(`Seeding missing quiz types: ${missingQuizTypes.join(', ')}...`);

    // Define seed quizzes
    const quizTypesToSeed = {
      'math': {
        title: 'Math Quiz',
        type: 'math',
        description: 'Test your math skills',
        topic: 'Algebra',
        quizType: 'multiple_choice',
        difficulty: 'medium'
      },
      'general': {
        title: 'Escape Room',
        type: 'general',
        description: 'General knowledge challenge',
        topic: 'General Knowledge',
        quizType: 'multiple_choice',
        difficulty: 'hard'
      },
      'coding': {
        title: 'Coding Quiz',
        type: 'coding',
        description: 'Programming challenges',
        topic: 'Python Basics',
        quizType: 'multiple_choice',
        difficulty: 'easy'
      },
      'science': {
        title: 'Science Quiz',
        type: 'science',
        description: 'Science mysteries',
        topic: 'Physics',
        quizType: 'multiple_choice',
        difficulty: 'medium'
      },
      'word': {
        title: 'Word Scramble',
        type: 'word',
        description: 'Word puzzles',
        topic: 'Vocabulary',
        quizType: 'multiple_choice',
        difficulty: 'medium'
      },
      'grammar': {
        title: 'Grammar Quiz',
        type: 'grammar',
        description: 'Test your grammar',
        topic: 'English Grammar',
        quizType: 'multiple_choice',
        difficulty: 'medium'
      }
    };

    // Create quizzes for missing types only
    for (const quizType of missingQuizTypes) {
      const quizInfo = quizTypesToSeed[quizType];
      console.log(`Creating ${quizInfo.title}...`);

      // Generate questions for this quiz
      const questions = await quizService.generateQuizQuestions({
        topic: quizInfo.topic,
        quizType: quizInfo.quizType,
        difficulty: quizInfo.difficulty
      });

      // Create the quiz
      await Quiz.create({
        title: quizInfo.title,
        type: quizInfo.type,
        description: quizInfo.description,
        questions: questions
      });

      console.log(`${quizInfo.title} created successfully!`);
    }

    console.log('Quiz seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding quizzes:', error.stack || error);
    throw error; // Rethrow to allow handling at a higher level
  }
}

module.exports = seedQuizzes;