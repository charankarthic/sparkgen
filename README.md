# Sparkgen

**Sparkgen** is an AI-powered gamified learning platform that enables users to engage in AI-generated quizzes, track achievements, and interact with an AI assistant for learning support. By leveraging the DeepSeek R1 API via OpenRouter, Sparkgen customizes quiz content and provides chatbot assistance tailored to the user's level of difficulty.

## Overview

Sparkgen is built using a client-server architecture with the following technologies:
- **Frontend:** ReactJS with Vite, TypeScript, Tailwind CSS, and Shadcn-UI component library.
- **Backend:** Node.js with Express framework, MongoDB Atlas for database management.
- **AI Integration:** AI-generated quizzes and chatbot assistance are powered by the DeepSeek R1 API via OpenRouter.
- **Deployment:** The frontend is deployed on Vercel, and the backend on Render.

### Project Structure

```
.
├── client
│   ├── public
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── contexts
│   │   ├── hooks
│   │   ├── pages
│   │   ├── utils
│   │   └── ...
│   ├── .env
│   ├── package.json
│   ├── ...
├── server
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── utils
│   ├── .env
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   ├── ...
├── .gitignore
├── README.md
└── ...
```

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

- Node.js >= 14.x
- npm >= 6.x
- MongoDB Atlas account for the database
- DeepSeek R1 API Key via OpenRouter
- Vercel account for frontend deployment
- Render account for backend deployment

### Quickstart

1. **Clone the repository**
    ```bash
    git clone https://github.com/charankarthic/sparkgen.git
    cd sparkgen
    ```

2. **Install dependencies for both frontend and backend**
    ```bash
    npm install
    cd client
    npm install
    cd ../server
    npm install
    cd ..
    ```

3. **Create `.env` files**

    Copy `.env.example` to `.env` in both the `client` and `server` directories and update them with your configuration:
    ```bash
    cp client/.env.example client/.env
    cp server/.env.example server/.env
    ```
    Set the appropriate environment variables, including MongoDB connection string, JWT secrets, and API keys.

4. **Run the project**
    ```bash
    npm run start
    ```

   By default:
   - Frontend runs on `http://localhost:5173`
   - Backend runs on `http://localhost:3000`

5. **Deploying to Vercel and Render**

   - **Frontend**: Deploy the frontend to Vercel by connecting the repository and selecting the `client` directory.
   - **Backend**: Deploy the backend to Render by connecting the repository and selecting the `server` directory.

### License

The project is proprietary (not open source).  
Copyright (c) 2024.
```

## Resources and Links

1. **GitHub Repository**: [Sparkgen GitHub] https://github.com/charankarthic/sparkgen

2. **Project Report**: [Google Docs Report] https://docs.google.com/document/d/1XHui44OO8QOrSyeBulMV0WSUaO8-HP8_/edit?usp=drive_link&ouid=112572534447293046629&rtpof=true&sd=true

3. **Demo Video**: [Watch the Demo] https://drive.google.com/file/d/1xBifSdpTJnbtQwSsuKARz_7fXxjyykQR/view?usp=drive_link  

4. **Frontend (Live Website on Vercel)**: [Sparkgen - Live Site] https://sparkgen-chi.vercel.app 

## 🚀 **Performance Notice** (Disclaimer)  

The backend is hosted on **Render's free tier**, which puts the server to sleep after **15 minutes of inactivity**. The **first request after inactivity may take 20-30 seconds** to load.Since we use the **DeepSeek R1 API via OpenRouter.com**, generating **quiz questions and chatbot responses may take up to 20 seconds**.*We appreciate your patience while the AI processes your request!*  


