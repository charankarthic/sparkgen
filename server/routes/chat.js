const express = require('express');
const router = express.Router();
const ChatService = require('../services/chatService');
const { requireUser } = require('./middleware/auth');

/**
 * @route POST /api/chat
 * @desc Send a message to the AI assistant and get a response
 * @access Private
 */
router.post('/', requireUser, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    console.log(`Processing chat message from user ${userId}`);
    const response = await ChatService.processMessage(userId, message);

    console.log(`Successfully generated response for user ${userId}`);
    return res.json({ response });
  } catch (error) {
    console.error('Error in chat message route:', error);
    return res.status(500).json({ error: error.message || 'Failed to process message' });
  }
});

module.exports = router;