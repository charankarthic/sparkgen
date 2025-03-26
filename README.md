```markdown
# Sparkgen

Sparkgen is an AI-powered gamified learning platform that enables users to participate in AI-generated quizzes, track achievements, and interact with an AI assistant for learning support. The platform uses an API key from DeepSeek R1 via OpenRouter for generating quiz content and providing chatbot assistance.

## Overview

Sparkgen utilizes a client-server architecture:
- **Frontend**: A ReactJS-based frontend housed in the `client/` directory, employing the Vite dev server. The frontend leverages the Shadcn-UI component library with Tailwind CSS for styling and `react-router-dom` for client-side routing.
- **Backend**: An Express-based server located in the `server/` directory, providing REST API endpoints. The backend interacts with a MongoDB database for data storage and utilizes Mongoose for data modeling.

The frontend runs on port 5173 and the backend on port 3000. Concurrently is used to run both the frontend and backend together with a single command (`npm run start`).

### Project Structure
- **client/**: Contains all frontend-related code.
  - `src/`: Holds all source code for the frontend, including pages, components, context, and API interaction files.
  - `public/`: Contains the index.html file that serves as the entry point.
- **server/**: Contains all backend-related code.
  - `routes/`: Houses API route definitions.
  - `models/`: Defines Mongoose schemas for MongoDB collections.
  - `services/`: Contains service classes for business logic.
- **.env**: Environment variable configurations for both client and server.
- **package.json**: Configuration files for project dependencies and scripts.

## Features

1. **Authentication**: 
   - Register, Login, and Logout functionalities.
  
2. **Home Page**: 
   - Personalized welcome message.
   - Displays user XP points, levels, achievements, and available quizzes.
   - Options for logged-in and logged-out users.

3. **Games Page**: 
   - Variety of AI-powered quizzes such as Math Quiz, Coding Quiz, Science Quiz, etc.
   - Dynamic generation of quiz questions using DeepSeek R1 API based on user performance.
   - "Start" and "Play Again" buttons for seamless user experience.

4. **Achievements Page**: 
   - Displays earned badges, XP points, levels, and challenges.
   - Leaderboard rankings.

5. **Profile Page**: 
   - Shows user statistics, progress, and personalized game recommendations.
   
6. **Floating AI Chatbot Assistant**: 
   - AI-powered tutor available on all pages.
   - Provides hints, explanations, and step-by-step solutions to quiz questions.

7. **API Integration**: 
   - Dynamic generation of quiz questions at the time of quiz start.
   - API endpoints for quiz management, user statistics, and AI chatbot interaction.

## Getting started

### Requirements

Ensure you have the following installed on your computer:
- Node.js (v14.x or higher)
- MongoDB (v4.x or higher)

### Quickstart

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/charankarthic/sparkgen.git
   cd sparkgen
    ```

2. **Install Dependencies**:
   - For the root directory:
     ```bash
     npm install
     ```
   - For the frontend (navigate to `client/` directory):
     ```bash
     cd client
     npm install
     ```
   - For the backend (navigate to `server/` directory):
     ```bash
     cd ../server
     npm install
     ```

3. **Set Up Environment Variables**:
   - Create a `.env` file in the root directory based on the `.env.example` provided.

4. **Run the Application**:
   - Start both client and server:
     ```bash
     npm run start
     ```

5. **Access the App**:
   - Open your browser and navigate to `http://localhost:5173/` for the frontend.
   - The backend server will run on `http://localhost:3000/`.

### License

The project is proprietary (not open source). 

© 2024.
```