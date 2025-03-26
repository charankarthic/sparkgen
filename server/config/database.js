const mongoose = require("mongoose");
require("dotenv").config({ path: "./server/.env" }); // Ensure correct .env path

/**
 * Establishes connection to MongoDB database with retry logic
 * @param {number} retryAttempt - Current retry attempt number
 * @returns {Promise} MongoDB connection
 */
const connectDB = async (retryAttempt = 0) => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("❌ DATABASE_URL is missing in .env file!");
    }

    console.log(`🔄 Connecting to MongoDB Atlas... (Attempt: ${retryAttempt + 1})`);

    // Set mongoose options for Render deployment
    const options = {
      // These options help with Render deployment
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    const conn = await mongoose.connect(process.env.DATABASE_URL, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}, Database: ${conn.connection.name}`);

    // Set up connection error handler for runtime errors after initial connection
    mongoose.connection.on('error', err => {
      console.error(`⚠️ MongoDB runtime connection error: ${err.message}`);
      // For certain errors, we should reconnect
      if (err.name === 'MongoNetworkError' || err.message.includes('topology was destroyed')) {
        console.log('🔄 Attempting to reconnect to MongoDB...');
        setTimeout(() => connectDB(), 5000); // Try to reconnect after 5 seconds
      }
    });

    // Handle disconnection
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
      setTimeout(() => connectDB(), 5000);
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    // Retry logic with exponential backoff for certain errors
    if (
      (error.name === 'MongoNetworkError' ||
      error.message.includes('connection timed out') ||
      error.message.includes('getaddrinfo ENOTFOUND')) &&
      retryAttempt < 5
    ) {
      const nextRetrySeconds = Math.min(Math.pow(2, retryAttempt) * 1000, 30000);
      console.log(`🔄 Retrying in ${nextRetrySeconds / 1000} seconds...`);

      return new Promise(resolve => {
        setTimeout(() => {
          resolve(connectDB(retryAttempt + 1));
        }, nextRetrySeconds);
      });
    }

    // If we've exhausted retries or it's not a retriable error
    if (retryAttempt >= 5) {
      console.error('❌ Maximum retry attempts reached. Could not connect to MongoDB.');
    }

    // Only exit in development; in production environments like Render,
    // we want the process to stay alive so it can retry connections
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }

    throw error;
  }
};

module.exports = { connectDB };