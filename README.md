```markdown
# Sparkgen

Sparkgen is an AI-powered gamified learning platform that enables users to engage in AI-generated quizzes, track achievements, and interact with an AI assistant for learning support. It leverages the DeepSeek R1 API via OpenRouter to generate dynamic quiz content and provide a personalized chatbot experience.

## Overview

Sparkgen utilizes a client-server architecture with a React frontend, implemented using Vite, and a Node.js + Express backend. The backend connects to MongoDB Atlas for cloud data management. The project encompasses various user-centric features such as dynamic quiz generation, achievement tracking, and an interactive chatbot assistant.

### Technologies Used:
- **Frontend:**
  - ReactJS
  - Vite
  - Tailwind CSS
  - Shadcn-ui component library
  - React Router for client-side routing
- **Backend:**
  - Node.js
  - Express.js
  - Mongoose (MongoDB)
  - Flask for AI Endpoint integration
- **Deployment:**
  - Render for Backend and frontend deployment
  - MongoDB Atlas for database hosting

### Project Structure:
- **client/**: Contains the React frontend codebase.
  - **src/pages/**: Page components for different app views.
  - **src/components/**: Reusable UI components.
  - **src/api/**: API request abstractions.
- **server/**: Contains the Express backend codebase.
  - **routes/**: Defines all API endpoints including auth, quiz, user, and chat routes.
  - **models/**: Mongoose schemas for User and Quiz models.
  - **services/**: Business logic and service integrations.
  - **middleware/**: Middleware functions for authentication and user level handling.
  - **utils/**: Utility functions including JWT generation and seeding quizzes.
  
## Features

1. **Authentication Pages:**
   - Register, Login, and Logout functionalities.

2. **Home Page:**
   - Displays a welcome message.
   - Shows XP points, levels, and recent achievements if the user is logged in.
   - Displays available AI-powered quizzes.

3. **Games Page:**
   - Displays various AI-powered quizzes (Math, Coding, Science, etc.).
   - Quizzes dynamically generated based on difficulty levels.

4. **Achievements Page:**
   - Shows badges earned, XP points, levels, and unlockable challenges.
   - Displays leaderboard rankings.

5. **Profile Page:**
   - Displays user stats, progress, and personalized game recommendations.

6. **Floating AI Chatbot Assistant:**
   - Provides hints, explanations, and step-by-step solutions.
   - Each user gets a personalized instance of the AI chatbot.

7. **API Integration for AI-Generated Quizzes:**
   - Dynamically generates quiz questions using the DeepSeek R1 API via OpenRouter.

8. **Real-Time Data:**
   - Incorporates dynamic data fetching with API endpoints.

## Getting Started

### Requirements
- Node.js (version 14.x or later)
- MongoDB Atlas account
- Vite (for frontend development server)
- Render account (for deployment)

### Quickstart

1. **Setup Environment:**
   - Clone the GitHub repository: `git clone https://github.com/charankarthic/sparkgen.git`
   - Navigate into the project directory: `cd sparkgen`
   
2. **Environment Configuration:**
   - Create a `.env` file in the root of the `server` directory with the following variables:
     ```
     PORT=3000
     DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sparkgen?retryWrites=true&w=majority
     JWT_SECRET=your_jwt_secret
     OPENROUTER_API_KEY=your_openrouter_api_key
     OPENAI_API_KEY=your_openai_api_key
     ANTHROPIC_API_KEY=your_anthropic_api_key
     ```

3. **Running the Project:**
   - Install dependencies for both frontend and backend:
     ```bash
     npm install
     cd client
     npm install
     cd ../server
     npm install
     ```
   - Start the development servers concurrently:
     ```bash
     npm run start
     ```
   - The frontend can be accessed at `http://localhost:5173`.
   - The backend can be accessed at `http://localhost:3000`.

4. **Frontend Development Server:**
   - Navigate to the `client` directory:
     ```bash
     cd client
     npm run dev
     ```
   - Access the frontend at `http://localhost:5173`.

5. **Backend Development Server:**
   - Navigate to the `server` directory:
     ```bash
     cd server
     npm run dev
     ```
   - Access backend endpoints at `http://localhost:3000`.

### License

The project is proprietary (not open source). Copyright (c) 2024.
```