import api from './api';

// Description: Get list of available quizzes
// Endpoint: GET /api/quiz/quizzes
// Request: {}
// Response: Array<{ _id: string, title: string, type: string, description: string }>
export const getQuizzes = async () => {
  try {
    const response = await api.get('/api/quiz/quizzes');
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get quiz questions
// Endpoint: GET /api/quiz/quiz/:id
// Request: { id: string, regenerate?: boolean }
// Response: { questions: Array<{ id: string, question: string, options: string[], answer: string }> }
export const getQuizQuestions = async (id: string, regenerate: boolean = false) => {
  try {
    const url = regenerate
      ? `/api/quiz/quiz/${id}?regenerate=true`
      : `/api/quiz/quiz/${id}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Submit quiz answers
// Endpoint: POST /api/quiz/quiz/submit
// Request: { quizId: string, answers: Array<{ questionId: string, answer: string }> }
// Response: {
//   score: number,
//   correct: number,
//   total: number,
//   earnedXP: number,
//   newLevel: number,
//   leveledUp: boolean,
//   achievements: Array<{ title: string, description: string }>,
//   questionsWithAnswers: Array<{
//     _id: string,
//     question: string,
//     options: string[],
//     userAnswer: string,
//     correctAnswer: string,
//     isCorrect: boolean
//   }>
// }
export const submitQuiz = async (data: { quizId: string, answers: Array<{ questionId: string, answer: string }> }) => {
  try {
    const response = await api.post('/api/quiz/quiz/submit', data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Generate quiz questions
// Endpoint: POST /api/quiz/generate
// Request: { topic: string, quizType: string, difficulty: string, numQuestions?: number }
// Response: { questions: Array<{ question: string, options: string[], answer: string }> }
export const generateQuizQuestions = async (data: {
  topic: string,
  quizType: string,
  difficulty: string,
  numQuestions?: number
}) => {
  try {
    const response = await api.post('/api/quiz/generate', data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create a new quiz
// Endpoint: POST /api/quiz/create
// Request: { title: string, type: string, description: string, questions: Array<{ question: string, options: string[], answer: string }> }
// Response: { _id: string, title: string, type: string, description: string }
export const createQuiz = async (data: {
  title: string,
  type: string,
  description: string,
  questions: Array<{ question: string, options: string[], answer: string }>
}) => {
  try {
    const response = await api.post('/api/quiz/create', data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};