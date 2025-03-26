/**
 * Constants for the application
 */

// User levels
const USER_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

// Quiz difficulty levels
const QUIZ_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// Mapping user levels to quiz difficulty
const USER_LEVEL_TO_DIFFICULTY = {
  [USER_LEVELS.BEGINNER]: QUIZ_DIFFICULTY.EASY,
  [USER_LEVELS.INTERMEDIATE]: QUIZ_DIFFICULTY.MEDIUM,
  [USER_LEVELS.ADVANCED]: QUIZ_DIFFICULTY.HARD
};

// Default number of questions to return in a quiz
const DEFAULT_QUESTION_COUNT = 10;

// Maximum number of questions to return in a quiz
const MAX_QUESTION_COUNT = 50;

module.exports = {
  USER_LEVELS,
  QUIZ_DIFFICULTY,
  USER_LEVEL_TO_DIFFICULTY,
  DEFAULT_QUESTION_COUNT,
  MAX_QUESTION_COUNT
};