# Sparkgen

Sparkgen is an AI-powered gamified learning platform that enables users to engage in AI-generated quizzes, track achievements, and interact with an AI assistant for learning support. The platform utilizes the DeepSeek R1 API for generating dynamic quiz content and providing chatbot assistance.

## Overview

Sparkgen is built using a client-server architecture with the frontend developed in React and the backend implemented with Node.js and Express. The frontend uses Vite as the dev server and Tailwind CSS for styling. The backend connects to a MongoDB database for data storage and integrates the DeepSeek R1 API via OpenRouter for AI-driven features.

Project Structure:
- `client/`: React-based frontend.
- `server/`: Express-based backend.

## Features

1. **Authentication Pages**: Register, Login, and Logout functionality.
2. **Home Page**: Displays a welcome message, XP points, levels, recent achievements, and available quizzes based on user login status.
3. **Games Page**: Features AI-powered quizzes in various subjects like Math, Science, Coding, and more. Quizzes are dynamically generated based on user performance for optimal resource usage.
4. **Achievements Page**: Showcases badges earned, XP points, levels, and leaderboard rankings.
5. **Profile Page**: Displays user stats, progress, and personalized game recommendations.
6. **AI Chatbot Assistant**: Provides hints and explanations for quiz questions, ensuring understanding and readability.
7. **API Integration for AI-Generated Quizzes**: Ensures fresh and engaging content for quizzes every time a user starts a quiz.
8. **API Endpoints**: Various endpoints for fetching quizzes, submitting answers, retrieving user stats, and AI chatbot interactions.

## Getting Started

### Requirements

- Node.js and npm
- MongoDB

### Quickstart

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd sparkgen
    ```

2. Install dependencies for both client and server:
    ```sh
    npm install
    cd client && npm install
    cd ../server && npm install
    cd ..
    ```

3. Set up environment variables by creating a `.env` file in both `client/` and `server/` directories with the necessary configurations.

4. Start the application:
    ```sh
    npm run start
    ```

5. Open the application in your browser:
    ```sh
    http://localhost:5173
    ```

### License

The project is proprietary (not open source). Copyright (c) 2024.
