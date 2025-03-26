const express = require('express');
const router = express.Router();
const auth = require('../routes/middleware/auth');
const quizService = require('../services/quizService');
const userService = require('../services/userService');
const { calculateLevel } = require('../utils/gameUtils');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

// Get all quizzes
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await quizService.getAllQuizzes();
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific quiz by ID
router.get('/quiz/:id', auth.requireUser, async (req, res) => {
  try {
    // Add more detailed logging
    console.log(`Quiz request - ID: ${req.params.id}, User ID: ${req.user._id}`);
    console.log(`User object: ${JSON.stringify(req.user)}`);

    // Check if we should force regenerate questions
    const forceRegenerate = req.query.regenerate === 'true';
    console.log(`Force regenerate parameter: ${forceRegenerate}`);

    // Pass user data including level to the service
    const userData = req.user ? { level: req.user.level || 1 } : undefined;
    console.log(`Passing user data to service: ${JSON.stringify(userData)}`);
    console.log(`Fetching quiz with user level: ${userData?.level || 'not available'}`);

    const quiz = await quizService.getQuizById(req.params.id, userData, forceRegenerate);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    console.log(`Quiz ${quiz.title} details:`, {
      hasQuestions: !!quiz.questions,
      questionsCount: quiz.questions ? quiz.questions.length : 0,
      questionsSample: quiz.questions && quiz.questions.length > 0 ?
        quiz.questions[0] : 'No questions'
    });

    res.json({
      title: quiz.title,
      questions: quiz.questions
    });
  } catch (error) {
    console.error(`Error fetching quiz with ID ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Submit quiz answers
router.post('/quiz/submit', auth.requireUser, async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid submission format' });
    }

    // Get the quiz with questions
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    console.log(`Processing quiz submission for quiz ID: ${quizId} by user ID: ${req.user._id}`);

    // Calculate score
    let correct = 0;
    const questionsWithAnswers = [];

    // Map through questions to find the corresponding answer
    quiz.questions.forEach(question => {
      const userAnswer = answers.find(a => a.questionId === question._id.toString());
      const isCorrect = userAnswer && userAnswer.answer === question.answer;

      if (isCorrect) {
        correct++;
      }

      // Add to the questions with answers array
      questionsWithAnswers.push({
        _id: question._id,
        question: question.question,
        options: question.options,
        userAnswer: userAnswer ? userAnswer.answer : null,
        correctAnswer: question.answer,
        isCorrect: isCorrect
      });
    });

    const total = quiz.questions.length;
    const score = Math.round((correct / total) * 100);

    // Get user to update stats
    const user = await User.findById(req.user._id);

    // Update user stats
    user.stats.quizzesCompleted += 1;

    // Calculate new average score
    const currentTotalScore = user.stats.averageScore * (user.stats.quizzesCompleted - 1);
    user.stats.averageScore = (currentTotalScore + score) / user.stats.quizzesCompleted;

    // Calculate XP earned (10 points per correct answer)
    const earnedXP = correct * 10;
    user.xp += earnedXP;
    user.stats.totalXP += earnedXP;

    // Calculate level based on XP
    const previousLevel = user.level;
    user.level = Math.floor(Math.log(user.xp / 100 + 1) / Math.log(1.5)) + 1;

    // Check if user leveled up
    const leveledUp = user.level > previousLevel;

    // Check for achievements
    let achievements = [];

    // Perfect score achievement
    if (score === 100) {
      const perfectScoreAchievement = {
        title: 'Perfect Score',
        description: `Scored 100% on ${quiz.title} quiz`,
        date: new Date()
      };

      // Check if the user already has this achievement
      const hasAchievement = user.achievements.some(
        a => a.title === perfectScoreAchievement.title && a.description === perfectScoreAchievement.description
      );

      if (!hasAchievement) {
        user.achievements.push(perfectScoreAchievement);
        achievements.push(perfectScoreAchievement);
      }
    }

    await user.save();

    res.json({
      score,
      correct,
      total,
      earnedXP,
      newLevel: user.level,
      leveledUp,
      achievements,
      questionsWithAnswers // Include the questions with answers in the response
    });

    console.log(`Quiz submission processed. Score: ${score}%, XP earned: ${earnedXP}`);
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate quiz questions
router.post('/generate', auth.requireUser, async (req, res) => {
  try {
    const { topic, quizType, difficulty, numQuestions } = req.body;

    if (!topic || !quizType || !difficulty) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const questions = await quizService.generateQuizQuestions({
      topic,
      quizType,
      difficulty,
      numQuestions
    });

    res.json({ questions });
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new quiz
router.post('/create', auth.requireUser, async (req, res) => {
  try {
    const { title, type, description, questions } = req.body;

    if (!title || !type || !description || !questions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const quiz = await quizService.createQuiz({
      title,
      type,
      description,
      questions
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;