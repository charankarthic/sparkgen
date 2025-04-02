```markdown
# Sparkgen

Sparkgen is an AI-powered gamified learning platform that enables users to play AI-generated quizzes, track achievements, and interact with an AI assistant for learning support. The platform utilizes an API key from DeepSeek R1 via OpenRouter to dynamically generate quiz content and provide personalized chatbot assistance.

## Overview

Sparkgen is built using a client-server architecture, with a React frontend and an Express-based backend. The frontend is served using Vite, while the backend connects to MongoDB Atlas for cloud-based data management. The entire application is deployed on Render (backend) and Vercel (frontend) to ensure scalability and ease of deployment.

Project Structure:

- **Frontend** (`client` directory):
  - ReactJS-based frontend using Vite for the dev server.
  - Shadcn-UI component library integrated with Tailwind CSS framework.
  - Client-side routing managed using `react-router-dom`.
  - Components and pages organized in `client/src/components` and `client/src/pages`.
  
- **Backend** (`server` directory):
  - Express-based server implementing REST API endpoints.
  - MongoDB database support with Mongoose.
  - User authentication using JWT (bearer access and refresh tokens).
  - API endpoints for quizzes, user management, authentication, etc.
  
## Features

1. **Authentication Pages**:
   - Register, Login, and Logout functionalities.

2. **Home Page**:
   - Displays a welcome message, XP points, levels, and recent achievements for logged-in users.
   - Shows available AI-powered quizzes for quick access.

3. **Games Page**:
   - Lists AI-powered quizzes such as Math Quiz, Escape Room, Coding Quiz, Science Quiz, Word Scramble, and Grammar Quiz.
   - Dynamically generates quiz questions based on the user's difficulty level using the DeepSeek R1 API via OpenRouter.

4. **Achievements Page**:
   - Displays badges earned, XP points, levels, unlockable challenges, and leaderboard rankings.

5. **Profile Page**:
   - Displays user stats, progress, and personalized game recommendations.

6. **AI Chatbot Assistant**:
   - A floating AI chatbot assistant available on all pages.
   - Provides hints, explanations, and step-by-step solutions to quiz questions.

7. **API Integration for AI-Generated Quizzes**:
   - Dynamic quiz question generation based on topics, quiz types, and difficulty levels using DeepSeek R1 API via OpenRouter.

8. **Development and Deployment**:
   - The backend is deployed on Render, while the frontend is deployed on Vercel.
   - MongoDB Atlas is used for cloud-based data management.

## Getting Started

### Requirements

- Node.js and npm
- MongoDB Atlas account
- Vercel account for frontend deployment
- Render account for backend deployment

### Quickstart

1. **Clone the repository**:
   ```bash
   git clone https://github.com/charankarthic/sparkgen.git
   cd sparkgen
   ```

2. **Setting up the environment variables**:
   Create the necessary `.env` files from examples provided (e.g., `server/.env.example`).

3. **Install dependencies**:
   ```bash
   # Install frontend dependencies
   cd client
   npm install

   # Install backend dependencies
   cd ../server
   npm install
   ```

4. **Run the application locally**:
   ```bash
   # Start both frontend and backend servers
   npm run start
   ```

   - The frontend will be available at: `http://localhost:5173`
   - The backend will be available at: `http://localhost:3000`

5. **Deploy the application**:
   - **Backend**: Deploy the backend on Render by following Render's deployment guides and ensure the `DATABASE_URL` and other secrets are set.
   - **Frontend**: Deploy the frontend on Vercel by connecting the GitHub repository and setting the `VITE_API_BASE_URL` to point to the backend hosted on Render.

### License

The project is proprietary (not open source).  
Copyright (c) 2024.
```

## Resources and Links

1. **GitHub Repository**: [Sparkgen GitHub] https://github.com/charankarthic/sparkgen

2. **Project Report**: [Google Docs Report] https://docs.google.com/document/d/1XHui44OO8QOrSyeBulMV0WSUaO8-HP8_/edit?usp=drive_link&ouid=112572534447293046629&rtpof=true&sd=true

3. **Demo Video**: [Watch the Demo] https://drive.google.com/file/d/1xBifSdpTJnbtQwSsuKARz_7fXxjyykQR/view?usp=drive_link  

4. **Frontend (Live Website on Vercel)**: [Sparkgen - Live Site] https://sparkgen-chi.vercel.app 

## 🚀 **Performance Notice**  

> - The backend is hosted on **Render's free tier**, which puts the server to sleep after **15 minutes of inactivity**.  
> - The **first request after inactivity may take 20-30 seconds** to load.  
> - Since we use the **DeepSeek R1 API via OpenRouter.com**, generating **quiz questions and chatbot responses may take up to 20 seconds**.  
> - ⏳ *We appreciate your patience while the AI processes your request!*  


