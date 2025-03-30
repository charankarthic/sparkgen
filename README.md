# Sparkgen

Sparkgen is an AI-powered gamified learning platform that enables users to play AI-generated quizzes, track achievements, and interact with an AI assistant for learning support. The app uses an API key from DeepSeek R1 via OpenRouter to generate quiz content and provide chatbot assistance.

## Overview

The Sparkgen app is implemented using a client-server architecture with ReactJS for the frontend and Node.js + Express for the backend. 

### Architecture

- **Frontend:** 
  - ReactJS-based frontend located in the `client/` folder, served using Vite.
  - The frontend uses Shadcn-UI component library with Tailwind CSS for styling.
  - Client-side routing is implemented using `react-router-dom`.
  - Runs on port 5173.

- **Backend:**
  - Express-based server implementing REST API endpoints in the `server/` folder.
  - Uses MongoDB Atlas for cloud-based data management.
  - The backend runs on port 3000 and is deployed on Render.

### Project Structure

The project is divided into the following main directories:

- `client/`: Contains the React frontend code.
  - `src/`: Main source code directory for the client.
    - `api/`: API request definitions.
    - `components/`: Reusable React components.
    - `contexts/`: Context providers for managing state like authentication.
    - `hooks/`: Custom hooks for various functionalities.
    - `pages/`: Page components for different routes.
    - `utils/`: Utility functions.
    
- `server/`: Contains the Node.js backend code.
  - `controllers/`: Business logic controllers.
  - `middleware/`: Express middleware.
  - `models/`: Mongoose models for MongoDB.
  - `routes/`: Express route definitions.
  - `services/`: Services for handling business logic and external API interactions.
  - `utils/`: Utility functions and configurations.

## Features

1. **Authentication Pages:**
   - Allows users to register, login, and logout.

2. **Home Page:**
   - Displays a welcome message, XP points, levels, and recent achievements.
   - Lists available AI-powered quizzes with a "Start Game" or "Play Again" button.

3. **Games Page:**
   - Lists AI-powered quizzes such as Math Quiz, Escape Room, Coding Quiz, Science Quiz, Word Scramble, and Grammar Quiz.
   - Quizzes dynamically adjust difficulty based on user performance.

4. **Achievements Page:**
   - Shows badges earned, XP points, levels, and unlockable challenges.
   - Displays leaderboard rankings.

5. **Profile Page:**
   - Displays user stats, progress, and personalized game recommendations.

6. **Floating AI Chatbot Assistant:**
   - Provides hints and explanations for quiz questions, powered by DeepSeek R1 API via OpenRouter.
   - Available on all pages.

7. **API Integration for AI-Generated Quizzes:**
   - Questions are dynamically generated using the DeepSeek R1 API via OpenRouter based on the user's difficulty level.

## Getting Started

### Requirements

- Node.js (>= 14.x)
- npm (>= 6.x)
- MongoDB Atlas account
- Vite (for frontend development)
- Render account (for deployment)

### Quickstart

1. **Clone the repository:**

   ```bash
   git clone https://github.com/charankarthic/sparkgen.git
   cd sparkgen
   ```

2. **Set up environment variables:**

   - Create a `.env` file in both the `client/` and `server/` directories based on their respective `.env.example` files.
   - Update the MongoDB Atlas connection string and other required variables.

3. **Install dependencies:**

   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

4. **Run the development servers:**

   ```bash
   # In one terminal, start the backend
   cd server
   npm run dev

   # In another terminal, start the frontend
   cd client
   npm run dev
   ```

5. **Open the app:**

   - The backend will be running on `http://localhost:3000`.
   - The frontend will be running on `http://localhost:5173`.

### License

The project is proprietary (not open source). 

```
© 2024. All rights reserved.
```