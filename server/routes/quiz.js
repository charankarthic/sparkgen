const express = require('express');
const router = express.Router();
const auth = require('../routes/middleware/auth');
const quizService = require('../services/quizService');
const userService = require('../services/userService');
const { calculateLevel } = require('../utils/gameUtils');

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
    const quiz = await quizService.getQuizById(req.params.id);
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
    const userId = req.user._id;

    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const quiz = await quizService.getQuizById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if all questions are answered
    if (answers.length < quiz.questions.length) {
      return res.status(400).json({
        error: 'Please answer all questions before submitting the quiz'
      });
    }

    // Calculate score
    let correct = 0;
    const total = answers.length;

    answers.forEach(answer => {
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
      if (question && question.answer === answer.answer) {
        correct++;
      }
    });

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Award XP for correct answers (10 XP per correct answer)
    if (correct > 0) {
      // Get current user
      const user = await userService.get(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Calculate new XP and level
      const earnedXP = correct * 10; // 10 XP per correct answer
      const newXP = user.xp + earnedXP;
      const newLevel = calculateLevel(newXP);

      // Update user XP and level
      await userService.updateXpAndLevel(userId, newXP, newLevel);

      // Update user stats
      await userService.update(userId, {
        $inc: {
          'stats.quizzesCompleted': 1,
        },
        $set: {
          'stats.averageScore': user.stats.averageScore
            ? Math.round((user.stats.averageScore * user.stats.quizzesCompleted + score) / (user.stats.quizzesCompleted + 1))
            : score
        }
      });

      // Award achievements if applicable
      const achievements = [];

      // First quiz completed achievement
      if (user.stats.quizzesCompleted === 0) {
        const achievement = {
          title: 'First Quiz Completed',
          description: 'You completed your first quiz!'
        };
        await userService.addAchievement(userId, achievement);
        achievements.push(achievement);
      }

      // Perfect score achievement
      if (score === 100) {
        const achievement = {
          title: 'Perfect Score',
          description: 'You got a perfect score on a quiz!'
        };
        await userService.addAchievement(userId, achievement);
        achievements.push(achievement);
      }

      // Level up achievement
      if (newLevel > user.level) {
        const achievement = {
          title: 'Level Up',
          description: `You reached level ${newLevel}!`
        };
        await userService.addAchievement(userId, achievement);
        achievements.push(achievement);
      }

      res.json({
        score,
        correct,
        total,
        earnedXP,
        newXP,
        newLevel,
        achievements
      });
    } else {
      // No correct answers
      res.json({
        score,
        correct,
        total,
        earnedXP: 0,
        achievements: []
      });
    }
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