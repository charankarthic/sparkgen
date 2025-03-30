const express = require('express');
const router = express.Router();

// Simple log endpoint to receive logs
router.post('/', (req, res) => {
    try {
        console.log('Received logs:', req.body.logs); // Log to console or save to a database
        res.status(200).json({ message: 'Logs received' });
    } catch (error) {
        console.error('Log handling error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add a ping endpoint to check availability
router.head('/ping', (req, res) => {
    res.status(200).end();
});

// GET ping endpoint for connectivity testing
router.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

module.exports = router;