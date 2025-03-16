require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/sparkgen',
  jwtSecret: process.env.JWT_SECRET, // INPUT_REQUIRED {JWT secret key for authentication}
  openrouterApiKey: process.env.OPENROUTER_API_KEY, // INPUT_REQUIRED {OpenRouter API key for AI service access}
  openaiApiKey: process.env.OPENAI_API_KEY, // INPUT_REQUIRED {OpenAI API key for alternative AI service}
  anthropicApiKey: process.env.ANTHROPIC_API_KEY // INPUT_REQUIRED {Anthropic API key for Claude models}
};