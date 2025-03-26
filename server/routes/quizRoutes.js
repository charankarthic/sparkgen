const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');

// Get all quizzes
router.get('/', auth, async (req, res) => {
  try {
    const quizzes = await quizController.getAllQuizzes();
    res.json(quizzes);
    console.log('Retrieved all quizzes successfully');
  } catch (error) {
    console.error('Error retrieving quizzes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get quiz by ID
router.get('/:id', auth, async (req, res) => {
  try {
    // Pass the user's level to the controller to get appropriate difficulty questions
    const quiz = await quizController.getQuizById(req.params.id, req.user.level);
    
    if (!quiz) {
      console.log(`Quiz with ID ${req.params.id} not found`);
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    console.log(`Retrieved quiz ${req.params.id} successfully for user level ${req.user.level}`);
    res.json(quiz);
  } catch (error) {
    console.error(`Error retrieving quiz ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new quiz
router.post('/', auth, async (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      console.log(`Unauthorized quiz creation attempt by user ${req.user.id}`);
      return res.status(403).json({ error: 'Only admins can create quizzes' });
    }
    
    const quiz = await quizController.createQuiz(req.body);
    console.log(`Quiz created successfully with ID ${quiz._id}`);
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update a quiz
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      console.log(`Unauthorized quiz update attempt by user ${req.user.id}`);
      return res.status(403).json({ error: 'Only admins can update quizzes' });
    }
    
    const quiz = await quizController.updateQuiz(req.params.id, req.body);
    
    if (!quiz) {
      console.log(`Quiz with ID ${req.params.id} not found for update`);
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    console.log(`Quiz ${req.params.id} updated successfully`);
    res.json(quiz);
  } catch (error) {
    console.error(`Error updating quiz ${req.params.id}:`, error);
    res.status(400).json({ error: error.message });
  }
});

// Delete a quiz
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      console.log(`Unauthorized quiz deletion attempt by user ${req.user.id}`);
      return res.status(403).json({ error: 'Only admins can delete quizzes' });
    }
    
    const result = await quizController.deleteQuiz(req.params.id);
    
    if (!result) {
      console.log(`Quiz with ID ${req.params.id} not found for deletion`);
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    console.log(`Quiz ${req.params.id} deleted successfully`);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error(`Error deleting quiz ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Submit quiz answers
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
      console.log('Invalid quiz submission format');
      return res.status(400).json({ error: 'Invalid submission format' });
    }
    
    const result = await quizController.submitQuizAnswers(req.params.id, req.user.id, answers);
    console.log(`User ${req.user.id} submitted answers for quiz ${req.params.id}`);
    res.json(result);
  } catch (error) {
    console.error(`Error submitting quiz ${req.params.id} answers:`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;