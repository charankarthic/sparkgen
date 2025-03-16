const jwt = require('jsonwebtoken');

// Generate access token (short-lived)
const generateAccessToken = (user) => {
  // Check if JWT_SECRET exists
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is missing');
    throw new Error('Authentication configuration error');
  }

  const payload = {
    sub: user._id
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Generate refresh token (long-lived)
const generateRefreshToken = (user) => {
  // Check if JWT_SECRET exists
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is missing');
    throw new Error('Authentication configuration error');
  }

  const payload = {
    sub: user._id
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};