const jwt = require('jsonwebtoken');
const config = require('../config');

// Generate access token (short-lived)
const generateAccessToken = (user) => {
  // Check if JWT_SECRET exists
  if (!config.jwtSecret) {
    console.error('JWT_SECRET environment variable is missing');
    throw new Error('Authentication configuration error');
  }

  const payload = {
    sub: user._id
  };

  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

// Generate refresh token (long-lived)
const generateRefreshToken = (user) => {
  // Check if refresh token secret exists
  const secret = config.refreshTokenSecret || config.jwtSecret;

  if (!secret) {
    console.error('REFRESH_TOKEN_SECRET environment variable is missing');
    throw new Error('Authentication configuration error');
  }

  const payload = {
    sub: user._id
  };

  return jwt.sign(payload, secret, { expiresIn: config.refreshTokenExpiresIn });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};