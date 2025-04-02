const express = require('express');
const router = express.Router();

// Simple ping endpoint to check availability
router.get('/ping', (req, res) => {
    try {
        console.log('Ping request received');
        res.status(200).json({
            success: true,
            message: 'Service is available'
        });
    } catch (error) {
        console.error('Error handling ping request:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;