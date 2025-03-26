require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/sparkgen',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret', // INPUT_REQUIRED {JWT secret key for authentication}
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret', // INPUT_REQUIRED {Refresh token secret key for authentication}
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  seedData: process.env.SEED_DATA === 'true' || false,
  openRouterApiKey: process.env.OPENROUTER_API_KEY, // INPUT_REQUIRED {OpenRouter API key for AI service access}
  openRouterUrl: process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  openaiApiKey: process.env.OPENAI_API_KEY, // INPUT_REQUIRED {OpenAI API key for alternative AI service}
  anthropicApiKey: process.env.ANTHROPIC_API_KEY // INPUT_REQUIRED {Anthropic API key for Claude models}
};