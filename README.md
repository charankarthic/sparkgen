```markdown
# Sparkgen

Sparkgen is an AI-powered gamified learning platform designed to enhance learning through interactive AI-generated quizzes, achievements tracking, and a personalized AI assistant. The app dynamically generates quiz content and provides chatbot assistance using the DeepSeek R1 API via OpenRouter.

## Overview

The Sparkgen app utilizes a client-server architecture:
- **Frontend**: Built with ReactJS, utilizing Vite as the development server, styled with Tailwind CSS, and integrated with shadcn-ui components. React Router handles client-side navigation.
- **Backend**: Implemented using an Express-based server with REST API endpoints. The backend connects to a MongoDB Atlas database.
- **AI Integration**: AI-powered quizzes and chatbot functionalities are supported by the DeepSeek R1 API through OpenRouter.

### Project Structure

- `client/`: React frontend application.
  - `src/pages/`: Contains major page components like Home, Games, Achievements, Profile, etc.
  - `src/components/`: Reusable UI components.
  - `src/api/`: Contains API request implementations.
  - `public/`: Static assets.
- `server/`: Express backend application.
  - `api/`: REST API implementations.
  - `routes/`: Routing definitions.
  - `models/`: MongoDB schemas.
  - `services/`: Business logic and helper functions.
- `scripts/`: Database seeding scripts.
- `.env`: Environment variable configurations for both frontend and backend.

## Features

- **Authentication Pages**: Register, Login, and Logout functionalities.
- **Home Page**: Displays welcome message, XP points, levels, recent achievements, and available quizzes. Provides a seamless "Start Game" or "Play Again" button for quick access.
- **Games Page**: Lists categories of AI-powered quizzes that adjust difficulty based on user performance.
- **Achievements Page**: Showcases badges earned, XP points, levels, and leaderboard rankings.
- **Profile Page**: User stats, progress, and personalized game recommendations.
- **Floating AI Chatbot**: AI tutor powered by DeepSeek R1 API for hints and detailed explanations on quiz questions.
- **API Integration**: Dynamically generates quiz content based on user's level and quiz type on demand.

## Getting started

### Requirements

- Node.js (v14+)
- MongoDB Atlas account
- Vite

### Quickstart

1. **Clone the repository**:
   ```bash
   git clone https://github.com/charankarthic/sparkgen.git
   cd sparkgen
   ```

2. **Frontend Setup**:
    - Navigate to the client directory:
      ```bash
      cd client
      ```
    - Install dependencies:
      ```bash
      npm install
      ```

3. **Backend Setup**:
    - Navigate to the server directory:
      ```bash
      cd ../server
      ```
    - Install dependencies:
      ```bash
      npm install
      ```

4. **Environment Configuration**:
    - Create a .env file in the `server` directory with the following template:
      ```env
      PORT=3000
      MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sparkgen
      JWT_SECRET=your_jwt_secret
      DEEPSEEK_API_KEY=your_deepseek_api_key
      ```

5. **Run the Application**:
    - From the root of the project, start both frontend and backend servers concurrently:
      ```bash
      npm run start
      ```
    - The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.

### License

The project is proprietary (not open source), just output the standard Copyright (c) 2024.
```