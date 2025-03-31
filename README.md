# Sparkgen

Sparkgen is an AI-powered gamified learning platform. It enables users to play AI-generated quizzes, track achievements, and interact with an AI assistant for learning support. The platform leverages an API key from DeepSeek R1 via OpenRouter for generating quiz content and providing chatbot assistance.

## Overview

Sparkgen utilizes a client-server architecture with a React frontend and a Node.js + Express backend. The frontend is served using Vite, and the backend connects to a MongoDB Atlas database. 

The platform is designed to provide a dynamic and engaging learning experience through AI-generated quizzes that adjust their difficulty based on user performance, and an AI chatbot that offers personalized learning support.

### Technologies Used
- Frontend: React, Vite, Tailwind CSS, shadcn-ui component library
- Backend: Node.js, Express, MongoDB Atlas
- AI Integration: DeepSeek R1 via OpenRouter
- Authentication: JWT
- Others: Axios, bcrypt, pino, dotenv, and more

### Project Structure
The project is divided into two main parts:
1. **Frontend**: Located in the `client/` folder
   - **Pages**: `client/src/pages/`
   - **Components**: `client/src/components/`
   - **API Calls**: `client/src/api/`
   - **Styling**: Tailwind CSS, with usage of custom CSS for animations

2. **Backend**: Located in the `server/` folder
   - **Routes**: `server/routes/`
   - **Models**: `server/models/`
   - **Services**: `server/services/`
   - **Utility Functions**: `server/utils/`

## Features

1. **Authentication Pages**: User can register, login, and logout.
2. **Home Page**:
   - Displays a welcome message, XP points, levels, recent achievements, and available AI-powered quizzes.
3. **Games Page**:
   - Displays various AI-powered quizzes (Math, Coding, Science, etc.) with dynamically generated questions.
4. **Achievements Page**:
   - Shows badges earned, XP points, levels, unlockable challenges, and leaderboard rankings.
5. **Profile Page**:
   - Displays user stats, progress, and personalized game recommendations.
6. **AI Chatbot Assistant**:
   - An AI tutor providing hints and explanations for quiz questions.
7. **API Integration**:
   - Dynamically generates quiz questions via DeepSeek R1 API.
8. **API Endpoints**:
   - Various endpoints for fetching quizzes, submitting answers, retrieving user stats, and AI chatbot interactions.

## Getting Started

### Requirements

To run this project, you will need:
- Node.js and npm installed on your machine
- MongoDB Atlas account (or local MongoDB installation)
- Environment variables setup (e.g., `.env` file with MongoDB connection string, API keys)

### Quickstart

#### Setup the repository

1. Clone the repository:
    ```bash
    git clone https://github.com/charankarthic/sparkgen.git
    cd sparkgen
    ```

2. Setup environment variables:
   - Create `.env` files in the `client/` and `server/` directories based on `.env.example` provided.

#### Install dependencies

1. Install frontend dependencies:
    ```bash
    cd client
    npm install
    ```

2. Install backend dependencies:
    ```bash
    cd ../server
    npm install
    ```

#### Run the project

1. Start the backend server:
    ```bash
    npm run dev
    ```

2. Start the frontend server:
    ```bash
    cd ../client
    npm run dev
    ```

3. Access the application:
    Open your browser and navigate to `http://localhost:5173`.

### License

The project is proprietary (not open source). 

Copyright (c) 2024.

