const axios = require('axios');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const dotenv = require('dotenv');

dotenv.config();

// Initialize OpenAI client only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Initialize Anthropic client only if API key is available
let anthropic = null;
if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

// Initialize OpenRouter API key
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Cache for pending requests to prevent duplicates
const pendingRequests = new Map();

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendRequestToOpenAI(model, message) {
  if (!openai) {
    console.warn('OpenAI API key is missing. Using mock data instead.');
    return null;
  }

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: message }],
        max_tokens: 1024,
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error(`Error sending request to OpenAI (attempt ${i + 1}):`, error.message);
      if (i === MAX_RETRIES - 1) throw error;
      await sleep(RETRY_DELAY);
    }
  }
}

async function sendRequestToAnthropic(model, message) {
  if (!anthropic) {
    console.warn('Anthropic API key is missing. Using mock data instead.');
    return null;
  }

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log(`Sending request to Anthropic with model: ${model} and message: ${message}`);
      const response = await anthropic.messages.create({
        model: model,
        messages: [{ role: 'user', content: message }],
        max_tokens: 1024,
      });
      console.log(`Received response from Anthropic: ${JSON.stringify(response.content)}`);
      return response.content[0].text;
    } catch (error) {
      console.error(`Error sending request to Anthropic (attempt ${i + 1}):`, error.message);
      if (i === MAX_RETRIES - 1) throw error;
      await sleep(RETRY_DELAY);
    }
  }
}

async function sendRequestToOpenRouter(model, message) {
  if (!OPENROUTER_API_KEY) {
    console.warn('OpenRouter API key is missing. Using mock data instead.');
    return null;
  }

  const validModel = 'deepseek/deepseek-r1:free';
  console.log(`Using OpenRouter API with model: ${validModel}`);
  console.log(`API Key starts with: ${OPENROUTER_API_KEY.substring(0, 10)}...`);

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log(`Attempt ${i+1}/${MAX_RETRIES}: Sending request to OpenRouter`);

      // Set a timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: validModel,
          messages: [{ role: 'user', content: message }],
          max_tokens: 2048
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://sparkgen.example.com',
            'X-Title': 'Sparkgen'
          },
          signal: controller.signal
        }
      );

      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
        console.log(`Received valid response from OpenRouter`);
        return response.data.choices[0].message.content;
      } else {
        console.warn(`Received unexpected response format from OpenRouter:`, JSON.stringify(response.data));
        return null;
      }
    } catch (error) {
      // Check if this was a timeout error
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        console.error(`OpenRouter request timed out (attempt ${i + 1})`);
      } else {
        console.error(`Error sending request to OpenRouter (attempt ${i + 1}):`,
          error.response ?
            `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` :
            `Message: ${error.message}`);
      }

      if (i === MAX_RETRIES - 1) {
        console.log('Max retries reached for OpenRouter API, using mock data');
        return null;
      }

      // Exponential backoff for retry
      const delay = RETRY_DELAY * Math.pow(2, i);
      console.log(`Waiting ${delay}ms before retry`);
      await sleep(delay);
    }
  }
  return null; // Ensure a return value if all retries fail
}

async function sendLLMRequest(provider, model, message) {
  console.log(`Attempting to send request to ${provider} using model ${model}`);

  // Map incorrect model IDs to correct ones
  const modelMapping = {
    'deepseek-ai/deepseek-chat-v1': 'deepseek/deepseek-r1:free',
    'deepseek/deepseek-chat-r1': 'deepseek/deepseek-r1:free'
  };

  // Check if we need to map the model ID
  if (modelMapping[model]) {
    const oldModel = model;
    model = modelMapping[model];
    console.log(`Remapped model ID from ${oldModel} to ${model}`);
  }

  // Create a cache key based on the request parameters
  const cacheKey = `${provider}:${model}:${message}`;

  // If we already have a pending request for this exact query, return that promise
  if (pendingRequests.has(cacheKey)) {
    console.log(`Using cached request for prompt: ${message.substring(0, 30)}...`);
    return pendingRequests.get(cacheKey);
  }

  // Create a new promise for this request
  const requestPromise = (async () => {
    let apiResponse = null;

    try {
      // Try each provider in sequence
      switch (provider.toLowerCase()) {
        case 'openrouter':
          apiResponse = await sendRequestToOpenRouter(model, message);
          break;
        case 'openai':
          apiResponse = await sendRequestToOpenAI(model, message);
          break;
        case 'anthropic':
          apiResponse = await sendRequestToAnthropic(model, message);
          break;
        default:
          console.log(`Unsupported provider: ${provider}`);
      }

      // If we got a valid API response, return it
      if (apiResponse && typeof apiResponse === 'string' && apiResponse.trim().length > 0) {
        // For chat messages from /api/chat endpoint, we should return the response directly
        // without checking for quiz format
        if (message.includes("You are a helpful AI tutor assistant")) {
          console.log('Processing chat message, returning direct response');
          return apiResponse;
        }

        // For quiz generation, check if it follows expected format
        if (apiResponse.includes('"question"') && apiResponse.includes('"options"')) {
          console.log('Using valid API response from LLM');
          return apiResponse;
        } else {
          console.log('API response does not contain proper question format, using mock data');
        }
      } else {
        console.log('No valid API response received, using mock data');
      }

      // Only generate mock data for quiz requests, not for chat messages
      if (message.includes("You are a helpful AI tutor assistant")) {
        console.log('Returning fallback response for chat message');
        return "I'm sorry, I couldn't process your question. Please try asking something else or rephrase your question.";
      }

      // From here on, generate mock quiz data
      console.log('Using mock LLM response as fallback');

      // Determine quiz type from the message
      let quizType = '';
      // Check for math topics
      if (message.toLowerCase().includes('math') ||
          message.toLowerCase().includes('algebra') ||
          message.toLowerCase().includes('geometry') ||
          message.toLowerCase().includes('calculus')) {
        quizType = 'math';
      }
      // Check for coding topics
      else if (message.toLowerCase().includes('coding') ||
              message.toLowerCase().includes('programming') ||
              message.toLowerCase().includes('computer') ||
              message.toLowerCase().includes('python') ||
              message.toLowerCase().includes('java')) {
        quizType = 'coding';
      }
      else if (message.toLowerCase().includes('science')) quizType = 'science';
      else if (message.toLowerCase().includes('grammar')) quizType = 'grammar';
      else if (message.toLowerCase().includes('word scramble')) quizType = 'word';
      else if (message.toLowerCase().includes('general knowledge')) quizType = 'general';
      else quizType = 'general';

      console.log(`Quiz type detected: ${quizType} from message: ${message.substring(0, 50)}...`);
      console.log(`Mock data generation for quiz type: ${quizType}`);

      // Generate different mock responses based on quiz type
      switch (quizType) {
        case 'math':
          return JSON.stringify([
            {
              question: "What is the value of x in the equation 2x + 5 = 15?",
              options: ["4", "5", "7", "10"],
              answer: "5"
            },
            {
              question: "If a = 3 and b = 4, what is the value of a² + b²?",
              options: ["7", "25", "12", "9"],
              answer: "25"
            },
            {
              question: "Simplify the expression: 3(x + 2) - 2(x - 1)",
              options: ["x + 8", "x + 4", "5x", "x + 5"],
              answer: "x + 8"
            },
            {
              question: "Solve for x: 2x/3 = 8",
              options: ["x = 12", "x = 16/3", "x = 24/3", "x = 12/3"],
              answer: "x = 12"
            },
            {
              question: "What is the slope of the line passing through points (2,3) and (4,7)?",
              options: ["1", "2", "3", "4"],
              answer: "2"
            }
          ]);

        case 'coding':
          return JSON.stringify([
            {
              question: "Which of the following is not a programming language?",
              options: ["Python", "Java", "HTML", "Photoshop"],
              answer: "Photoshop"
            },
            {
              question: "What does the acronym API stand for?",
              options: ["Application Programming Interface", "Advanced Programming Integration", "Automated Process Interaction", "Application Process Interpreter"],
              answer: "Application Programming Interface"
            },
            {
              question: "Which data structure operates on a FIFO (First In, First Out) principle?",
              options: ["Stack", "Queue", "Heap", "Tree"],
              answer: "Queue"
            },
            {
              question: "What is the result of 5 + '5' in JavaScript?",
              options: ["10", "55", "Error", "undefined"],
              answer: "55"
            },
            {
              question: "Which of these is not a version control system?",
              options: ["Git", "SVN", "Mercurial", "JavaFX"],
              answer: "JavaFX"
            }
          ]);

        case 'science':
          return JSON.stringify([
            {
              question: "What is Newton's First Law of Motion?",
              options: [
                "Force equals mass times acceleration",
                "An object at rest stays at rest unless acted on by a force",
                "For every action there is an equal and opposite reaction",
                "Energy cannot be created or destroyed"
              ],
              answer: "An object at rest stays at rest unless acted on by a force"
            },
            {
              question: "What is the chemical symbol for water?",
              options: ["H2O", "CO2", "O2", "NaCl"],
              answer: "H2O"
            },
            {
              question: "Which planet is known as the Red Planet?",
              options: ["Earth", "Mars", "Venus", "Jupiter"],
              answer: "Mars"
            },
            {
              question: "What is the smallest unit of matter?",
              options: ["Atom", "Cell", "Molecule", "Electron"],
              answer: "Atom"
            },
            {
              question: "What is the process by which plants make their own food?",
              options: ["Photosynthesis", "Respiration", "Digestion", "Fermentation"],
              answer: "Photosynthesis"
            }
          ]);

        case 'grammar':
          return JSON.stringify([
            {
              question: "Which of the following is a proper noun?",
              options: ["Book", "Paris", "Happy", "Run"],
              answer: "Paris"
            },
            {
              question: "What is the past tense of 'eat'?",
              options: ["Eating", "Ate", "Eaten", "Eats"],
              answer: "Ate"
            },
            {
              question: "Which sentence uses the correct form of there/their/they're?",
              options: [
                "There going to the store.",
                "Their going to the store.",
                "They're going to the store.",
                "They'r going to the store."
              ],
              answer: "They're going to the store."
            },
            {
              question: "Which of the following is an adverb?",
              options: ["Happy", "Beautiful", "Quickly", "Mountain"],
              answer: "Quickly"
            },
            {
              question: "What is the plural form of 'child'?",
              options: ["Childs", "Childes", "Children", "Childies"],
              answer: "Children"
            }
          ]);

        case 'word':
          return JSON.stringify([
            {
              question: "Unscramble the letters: PMOCURET",
              options: ["Computer", "Conductor", "Commuter", "Completer"],
              answer: "Computer"
            },
            {
              question: "Unscramble the letters: AEOCN",
              options: ["Canoe", "Ocean", "Aceon", "Coane"],
              answer: "Ocean"
            },
            {
              question: "Unscramble the letters: ELEPNHAT",
              options: ["Helpaten", "Elephant", "Telephane", "Pantehel"],
              answer: "Elephant"
            },
            {
              question: "Unscramble the letters: IZZAP",
              options: ["Zippa", "Pazzi", "Pizza", "Izpaz"],
              answer: "Pizza"
            },
            {
              question: "Unscramble the letters: OESCRITCU",
              options: ["Circteous", "Courtesic", "Discourse", "Courteous"],
              answer: "Courteous"
            }
          ]);

        case 'general':
          return JSON.stringify([
            {
              question: "Which famous artist painted the Mona Lisa?",
              options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
              answer: "Leonardo da Vinci"
            },
            {
              question: "What is the capital of Japan?",
              options: ["Beijing", "Seoul", "Bangkok", "Tokyo"],
              answer: "Tokyo"
            },
            {
              question: "In which year did the first human land on the moon?",
              options: ["1965", "1969", "1973", "1981"],
              answer: "1969"
            },
            {
              question: "Who wrote the play 'Hamlet'?",
              options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
              answer: "William Shakespeare"
            },
            {
              question: "What is the largest organ in the human body?",
              options: ["Heart", "Brain", "Liver", "Skin"],
              answer: "Skin"
            }
          ]);

        default:
          // Default general knowledge questions
          return JSON.stringify([
            {
              question: "What is the capital of France?",
              options: ["London", "Berlin", "Madrid", "Paris"],
              answer: "Paris"
            },
            {
              question: "Who wrote 'Romeo and Juliet'?",
              options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
              answer: "William Shakespeare"
            },
            {
              question: "What is the largest planet in our solar system?",
              options: ["Earth", "Mars", "Jupiter", "Saturn"],
              answer: "Jupiter"
            },
            {
              question: "What year did World War II end?",
              options: ["1943", "1944", "1945", "1946"],
              answer: "1945"
            },
            {
              question: "What is the chemical symbol for gold?",
              options: ["Go", "Gl", "Gd", "Au"],
              answer: "Au"
            }
          ]);
      }
    } finally {
      // Remove this request from the pending requests map
      pendingRequests.delete(cacheKey);
    }
  })();

  // Store the promise in the pending requests map
  pendingRequests.set(cacheKey, requestPromise);

  // Return the promise
  return requestPromise;
}

module.exports = {
  sendLLMRequest
};