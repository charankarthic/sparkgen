# Sparkgen - AI-Powered Gamified Learning Platform

Sparkgen is an interactive learning platform that uses AI to generate personalized quiz content and provide learning assistance. It features gamified quizzes, achievements, and an AI assistant to support users in their learning journey.

![Sparkgen Platform](https://i.imgur.com/YOUR_DEMO_IMAGE.png)

## Table of Contents

- [Features](#features)
- [Project Architecture](#project-architecture)
- [Local Development Setup](#local-development-setup)
- [Deployment Guide](#deployment-guide)
  - [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
  - [Backend Deployment (Render)](#backend-deployment-render)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Technologies Used](#technologies-used)

## Features

### Authentication
- User registration and login
- JWT-based authentication with access and refresh tokens

### Home Page
- Welcome message with user statistics
- XP points, levels, and recent achievements display
- Available AI-powered quizzes with quick replay functionality

### Games Page
- 6 AI-powered quiz types: Math, Escape Room, Coding, Science, Word Scramble, and Grammar
- Dynamic difficulty adjustment based on user performance
- AI-generated questions tailored to user's level

### Achievements Page
- Badges earned and unlockable challenges
- User XP points and level progression
- Leaderboard rankings

### Profile Page
- User statistics and progress tracking
- Personalized game recommendations
- Account management options

### AI Chatbot Assistant
- Floating assistant accessible from all pages
- Personalized help and explanations
- Step-by-step solution guidance

## Project Architecture

Sparkgen is built using a client-server architecture:

### Frontend
- React.js with TypeScript
- Vite build tool for fast development
- Shadcn UI components with Tailwind CSS
- React Router for client-side routing

### Backend
- Node.js with Express
- MongoDB Atlas for database storage
- JWT-based authentication
- AI integration with DeepSeek R1 via OpenRouter

### API Integration
- RESTful API endpoints
- AI-powered quiz generation
- Real-time chat assistance

## Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or Atlas connection)
- API keys for OpenRouter and OpenAI

### Installation Steps

1. Clone the repository:
   ```
   git clone https://github.com/charankarthic/sparkgen.git
   cd sparkgen
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create `.env` file in the root directory
   - Create `.env` file in the server directory
   - Create `.env.development` and `.env.production` in the client directory
   (See [Environment Variables](#environment-variables) section for details)

4. Start the development server:
   ```
   npm run start
   ```
   This will start both the frontend (port 5173) and backend (port 3000) concurrently.

5. Access the application at `http://localhost:5173`

## Deployment Guide

### Frontend Deployment (Vercel)

Vercel is recommended for deploying the React frontend due to its simplicity and performance optimizations.

#### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub at: https://github.com/charankarthic/sparkgen.git

#### Step 2: Set Up Vercel Project

1. Sign up or log in to [Vercel](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository (sparkgen)
4. Configure the project:
   - **Framework Preset**: Select "Vite"
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Step 3: Configure Environment Variables

Add the following environment variables:
- `VITE_API_BASE_URL`: Your backend API URL (e.g., https://sparkgen-api.onrender.com)

#### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your frontend will be available at the assigned Vercel URL

#### Troubleshooting TypeScript Errors on Vercel

If you encounter TypeScript errors during Vercel deployment (like the 53 errors mentioned in the logs), follow these steps:

1. Fix the TypeScript errors in the API files:
   - Update `client/src/api/api.ts` to properly handle Axios types
   - Ensure error handling follows the pattern: `throw new Error(error?.response?.data?.error || error.message)`
   - Add proper type checking for potentially undefined values

2. Update the `vercel.json` file to include:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://sparkgen-api.onrender.com/api/$1" }
     ],
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           { "key": "Access-Control-Allow-Origin", "value": "*" },
           { "key": "Access-Control-Allow-Methods", "value": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS" },
           { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
         ]
       }
     ]
   }
   ```

3. Disable TypeScript build errors (if necessary) by adding to your `vercel.json`:
   ```json
   {
     "buildCommand": "CI=false npm run build"
   }
   ```

### Backend Deployment (Render)

Render provides easy deployment for Node.js applications with persistent database connections.

#### Step 1: Create a Render Account

Sign up at [Render](https://render.com) if you don't already have an account.

#### Step 2: Create a New Web Service

1. From your Render dashboard, click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `sparkgen-api`
   - **Root Directory**: Leave empty (or specify `server` if your backend is in a subdirectory)
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node server.js`

#### Step 3: Configure Environment Variables

Add all necessary environment variables from your `.env` file:
- `PORT`: 3000 (Render will override this with its own PORT)
- `DATABASE_URL`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Your secret key for JWT tokens
- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `OPENAI_API_KEY`: Your OpenAI API key (backup)
- `ANTHROPIC_API_KEY`: Your Anthropic API key (optional)
- `NODE_ENV`: production

#### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for the build and deployment to complete
3. Your backend will be available at `https://sparkgen-api.onrender.com`

#### Step 5: Verify CORS Settings

Ensure your `server.js` has CORS configured to allow requests from your Vercel frontend domain:

```javascript
app.use(cors({
  origin: [
    'https://sparkgen.vercel.app',
    'https://sparkgen-chi.vercel.app',
    'https://sparkgen-git-main-charankarthic.vercel.app',
    /^https:\/\/sparkgen-.*\.vercel\.app$/
  ],
  credentials: true
}));
```

## Environment Variables

### Frontend (.env.production in client directory)
```
VITE_API_BASE_URL=https://sparkgen-api.onrender.com
```

### Backend (.env in server directory)
```
PORT=3000
DATABASE_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=<your_jwt_secret>
OPENROUTER_API_KEY=<your_openrouter_api_key>
OPENAI_API_KEY=<your_openai_api_key>
ANTHROPIC_API_KEY=<your_anthropic_api_key>
NODE_ENV=production
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in and get tokens
- `POST /api/auth/logout` - Log out a user
- `POST /api/auth/refresh` - Refresh access token

### Quiz Endpoints
- `GET /api/quiz` - Get all available quizzes
- `GET /api/quiz/:id` - Get quiz by ID
- `GET /api/quiz/:id/questions` - Generate questions for a quiz
- `POST /api/quiz/submit` - Submit quiz answers

### User Endpoints
- `GET /api/user/profile` - Get user profile
- `GET /api/user/leaderboard` - Get leaderboard
- `PUT /api/user/xp` - Update user XP
- `POST /api/user/achievements` - Add user achievement
- `PUT /api/user/displayName` - Update display name

### Chat Endpoint
- `POST /api/chat` - Send message to AI assistant

## Technologies Used

- **Frontend**:
  - React.js with TypeScript
  - Vite build tool
  - Tailwind CSS
  - Shadcn UI components
  - React Router
  - Axios for API requests

- **Backend**:
  - Node.js and Express
  - MongoDB with Mongoose
  - JWT for authentication
  - OpenRouter API for AI integration
  - OpenAI API (backup)

- **Deployment**:
  - Vercel for frontend
  - Render for backend
  - MongoDB Atlas for database

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.