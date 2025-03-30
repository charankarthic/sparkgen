const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const quizRoutes = require('./routes/quiz');
const profileRoutes = require('./routes/profile');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

// Create Express app
const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'https://sparkgen.vercel.app',     // Vercel production domain
    'https://sparkgen-git-main-charankarthic.vercel.app', // Vercel preview domain
    /^https:\/\/sparkgen-.*\.vercel\.app$/,  // Any Vercel deployment for this project
    'http://localhost:5173',           // Local development frontend
    'http://localhost:3000'            // Local development backend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Connect to MongoDB
mongoose.connect(config.mongoURI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => {
  console.log(`MongoDB Connected: ${mongoose.connection.host} to database: ${mongoose.connection.name}`);
  
  // Seed initial data if needed
  if (config.seedData) {
    const seedData = require('./utils/seedData');
    seedData.seedQuizzes();
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: err.message || 'Something went wrong on the server'
  });
});

module.exports = app;