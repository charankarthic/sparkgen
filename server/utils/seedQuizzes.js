const Quiz = require('../models/Quiz');

async function seedQuizzes() {
  try {
    console.log('Seeding quiz data...');

    // Delete existing quizzes first
    await Quiz.deleteMany({});
    console.log('Removed existing quizzes');

    // Create quiz templates without questions
    const quizzes = [
      {
        title: 'Math Quiz',
        type: 'math',
        description: 'Test your math skills with algebra and geometry questions'
      },
      {
        title: 'General Knowledge Quiz',
        type: 'general',
        description: 'Solve riddles and puzzles to escape the virtual room'
      },
      {
        title: 'Coding Quiz',
        type: 'coding',
        description: 'Challenge your programming knowledge with coding questions'
      },
      {
        title: 'Science Quiz',
        type: 'science',
        description: 'Explore physics, chemistry, and biology concepts'
      },
      {
        title: 'Word Scramble',
        type: 'word',
        description: 'Unscramble letters to form words and expand your vocabulary'
      },
      {
        title: 'Grammar Quiz',
        type: 'grammar',
        description: 'Test your grammar knowledge and improve language skills'
      }
    ];

    // Create the quiz templates in the database
    const createdQuizzes = await Quiz.insertMany(quizzes);
    console.log(`Successfully seeded ${createdQuizzes.length} quiz templates (without questions)`);

    return createdQuizzes;
  } catch (error) {
    console.error('Error seeding quizzes:', error);
    throw error;
  }
}

module.exports = seedQuizzes;