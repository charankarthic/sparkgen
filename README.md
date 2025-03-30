```markdown
# Sparkgen

Sparkgen is an AI-powered gamified learning platform that enables users to play AI-generated quizzes, track achievements, and interact with an AI assistant for learning support. DeepSeek R1 API via OpenRouter is used to generate the quiz content and provide chatbot assistance.

## Overview

### Architecture and Technologies

Sparkgen is built with a client-server architecture:

- **Frontend:** 
  - **ReactJS** with Vite devserver
  - **Shadcn-ui** component library integrated with Tailwind CSS framework
  - **React Router** for client-side routing
  - **Axios** for API requests

- **Backend:**
  - **Node.js** with **Express** for REST API implementation
  - **MongoDB Atlas** for cloud-based data management, using Mongoose for database operations
  - **Authentication** with JWT tokens
  - **Dynamic content generation with DeepSeek R1 API via OpenRouter**
  - **API key management to tailor quiz difficulty levels**

### Project Structure

- **client/** - ReactJS frontend source code
  - *src/* - frontend source code
  - *public/* - public assets
  - *tailwind.config.js* - TailwindCSS configuration
  - *vite.config.ts* - Vite configuration for the frontend devserver

- **server/** - Node.js backend source code
  - *api/* - Express routes and middleware
  - *models/* - Mongoose schemas
  - *services/* - Application logic and third-party APIs integration
  - *utils/* - Utility functions
  - *config/* - Configuration and constants
  - *app.js* - Main entry point for the backend application

## Features

1. **Authentication Pages:**
   - **Register, Login, and Logout functionality.**

2. **Home Page:**
   - Displays a welcome message.
   - Shows user XP points, levels, and recent achievements if logged in.
   - Displays available AI-powered quizzes.

3. **Games Page:**
   - Displays AI-powered quizzes (Math Quiz, Escape Room, Coding Quiz, Science Quiz, Word Scramble, Grammar Quiz).
   - AI-generated questions using DeepSeek R1 API tailored to user levels.
   - Dynamic adjustment of game difficulty based on user performance.

4. **Achievements Page:**
   - Shows badges earned, XP points, levels, and unlockable challenges.
   - Displays leaderboard rankings.

5. **Profile Page:**
   - Displays user stats, progress, and personalized game recommendations.

6. **Floating AI Chatbot Assistant:**
   - AI tutor providing hints, explanations, and detailed solutions.
   - Available across all pages.
   - Powered by DeepSeek R1 API.

7. **API Integration for AI-generated quizzes:**
   - Dynamic question generation upon starting a quiz.

## Getting Started

### Requirements

To run the project, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MongoDB Atlas** account

### Quickstart

1. **Clone the repository:**
   ```bash
   git clone https://github.com/charankarthic/sparkgen.git
   cd sparkgen
   ```

2. **Install dependencies:**

   - For frontend:
     ```bash
     cd client
     npm install
     ```

   - For backend:
     ```bash
     cd ../server
     npm install
     ```

3. **Set up environment variables:**

   - Create a `.env` file in the `server` directory with the following content:
     ```
     PORT=3000
     DATABASE_URL=YOUR_MONGODB_ATLAS_URL
     JWT_SECRET=YOUR_JWT_SECRET
     OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
     OPENAI_API_KEY=YOUR_OPENAI_API_KEY
     ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
     ```

4. **Seed the initial quiz data:**
   ```bash
   cd server
   npm run seed
   ```

5. **Start the development server:**

   - For frontend:
     ```bash
     cd ../client
     npm run dev
     ```

   - For backend:
     ```bash
     cd ../server
     npm run dev
     ```

6. **Access the application:**
   - Open your browser and navigate to `http://localhost:5173`

### License

The project is proprietary (not open source).

(c) 2024.
```