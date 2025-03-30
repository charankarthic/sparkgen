// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const path = require('path');
const basicRoutes = require("./routes/index");
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quiz");
const userRoutes = require("./routes/user");
const chatRoutes = require("./routes/chat");
const { connectDB } = require("./config/database");
const cors = require("cors");
const seedQuizzes = require('./utils/seedQuizzes');

// Validate environment variables
if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL variable in .env is missing.");
  process.exit(-1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ Error: JWT_SECRET variable in .env is missing.");
  process.exit(-1);
}

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Configure express
app.enable('json spaces'); // Pretty-print JSON responses
app.enable('strict routing'); // Be consistent with URL paths

// Middleware setup
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://sparkgen.vercel.app',
        'https://sparkgen-chi.vercel.app',
        'https://sparkgen-git-main-charankarthic.vercel.app',
        /^https:\/\/sparkgen-.*\.vercel\.app$/,  // Any Vercel deployment for this project
        'https://sparkgen-api.onrender.com',
        'https://sparkgen.onrender.com'
      ]
    : 'http://localhost:5173',
  credentials: true,
  // Add custom headers to handle private network access
  exposedHeaders: ['Access-Control-Allow-Private-Network'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add a middleware to handle the private network access header
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Private-Network', 'true');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
(async () => {
  try {
    await connectDB();
    // Seed quizzes after successful DB connection
    await seedQuizzes();
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
    // In production, we'll let the app continue running to retry connection
    // In development, we might want to exit
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }
  }
})();

// Error handling for server-wide issues
app.on("error", (error) => {
  console.error(`❌ Server error: ${error.message}`);
  console.error(error.stack);
});

// API Routes
app.use(basicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  console.log('🌐 Serving static files from:', path.join(__dirname, '../client/dist'));
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    // Don't serve React app for API routes
    if (req.url.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Handle 404 errors for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Handle 404 errors for non-API routes in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res) => {
    res.status(404).send("Page not found.");
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`❌ Application error (${statusCode}): ${err.message}`);
  console.error(err.stack);

  // Send error response
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // In production we don't want to exit the process
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // In production we don't want to exit the process immediately
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});