const Quiz = require('../models/Quiz');
const { sendLLMRequest } = require('./llmService');

/**
 * Create a new quiz with the given parameters
 * @param {Object} quizData - Quiz data including title, type, and description
 * @returns {Promise<Object>} Created quiz object
 */
async function createQuiz(quizData) {
  try {
    console.log('Creating new quiz:', quizData.title);
    const quiz = new Quiz(quizData);
    await quiz.save();
    console.log('Quiz created successfully with ID:', quiz._id);
    return quiz;
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
}

/**
 * Get all quizzes
 * @returns {Promise<Array>} Array of quiz objects
 */
async function getAllQuizzes() {
  try {
    console.log('Fetching all quizzes');
    const quizzes = await Quiz.find().select('_id title type description');
    console.log(`Retrieved ${quizzes.length} quizzes`);
    return quizzes;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
}

/**
 * Get a quiz by ID
 * @param {string} quizId - ID of the quiz to get
 * @returns {Promise<Object>} Quiz object
 */
async function getQuizById(quizId) {
  try {
    console.log(`Fetching quiz with ID: ${quizId}`);

    // First try to get the quiz with its questions
    let quiz = await Quiz.findById(quizId);

    if (!quiz) {
      console.log(`Quiz with ID ${quizId} not found`);
      return null;
    }

    // Check if the quiz already has questions
    if (!quiz.questions || quiz.questions.length === 0) {
      console.log(`Quiz ${quiz.title} has no questions. Generating questions dynamically...`);

      // Determine parameters based on quiz type
      let topic, quizType, difficulty;

      switch(quiz.type) {
        case 'math':
          topic = 'Algebra';
          quizType = 'multiple_choice';
          difficulty = 'medium';
          break;
        case 'general':
          topic = 'General Knowledge';
          quizType = 'multiple_choice';
          difficulty = 'medium';
          break;
        case 'coding':
          topic = 'Programming Basics';
          quizType = 'multiple_choice';
          difficulty = 'medium';
          break;
        case 'science':
          topic = 'Science Concepts';
          quizType = 'multiple_choice';
          difficulty = 'medium';
          break;
        case 'word':
          topic = 'Word Scramble';
          quizType = 'word_scramble';
          difficulty = 'medium';
          break;
        case 'grammar':
          topic = 'Grammar Rules';
          quizType = 'multiple_choice';
          difficulty = 'medium';
          break;
        default:
          topic = quiz.title;
          quizType = 'multiple_choice';
          difficulty = 'medium';
      }

      // Generate questions for this quiz
      const generatedQuestions = await generateQuizQuestions({
        topic,
        quizType,
        difficulty,
        numQuestions: 5
      });

      // Use findOneAndUpdate to atomically update the quiz with questions
      // This prevents race conditions when multiple requests try to update the same quiz
      const updatedQuiz = await Quiz.findOneAndUpdate(
        { _id: quizId, $or: [{ questions: { $exists: false } }, { questions: { $size: 0 } }] },
        { $set: { questions: generatedQuestions } },
        { new: true, runValidators: true }
      );

      if (updatedQuiz) {
        console.log(`Generated and saved ${generatedQuestions.length} questions for quiz ${quiz.title}`);
        quiz = updatedQuiz;
      } else {
        // If update failed, another request might have updated it first
        // Get the latest version
        quiz = await Quiz.findById(quizId);
        console.log(`Quiz already updated by another request, using existing questions`);
      }
    } else {
      console.log(`Quiz ${quiz.title} already has ${quiz.questions.length} questions`);
    }

    console.log(`Quiz ${quiz.title} details:`, {
      hasQuestions: !!quiz.questions,
      questionsCount: quiz.questions ? quiz.questions.length : 0,
      questionsSample: quiz.questions && quiz.questions.length > 0 ?
        quiz.questions[0] : 'No questions'
    });

    return quiz;
  } catch (error) {
    console.error(`Error fetching quiz with ID ${quizId}:`, error);
    throw error;
  }
}

/**
 * Generate quiz questions using LLM
 * @param {Object} params - Parameters for quiz generation
 * @param {string} params.topic - Topic of the quiz
 * @param {string} params.quizType - Type of quiz (multiple_choice, true_false, etc.)
 * @param {string} params.difficulty - Difficulty level (easy, medium, hard)
 * @param {number} params.numQuestions - Number of questions to generate (default: 5)
 * @returns {Promise<Array>} Array of question objects
 */
async function generateQuizQuestions(params) {
  const { topic, quizType, difficulty, numQuestions = 5 } = params;

  try {
    console.log(`Generating ${numQuestions} ${difficulty} level ${quizType} questions about ${topic}`);

    // Construct shorter prompt for DeepSeek
    const prompt = constructPrompt(topic, quizType, difficulty, numQuestions);
    console.log("Using prompt:", prompt);

    // Use LLM service with DeepSeek via OpenRouter
    let llmResponse = await sendLLMRequest('openrouter', 'deepseek/deepseek-r1:free', prompt);

    // Parse the response to extract questions
    const parsedQuestions = parseQuizQuestions(llmResponse);
    console.log(`Successfully generated ${parsedQuestions.length} questions`);

    // If we got at least one valid question, use it
    if (parsedQuestions.length > 0) {
      return parsedQuestions;
    }

    throw new Error('No valid questions could be parsed from the LLM response');
  } catch (error) {
    console.error('Error generating quiz questions:', error.message);
    console.log('Falling back to default questions due to error');
    return generateDefaultQuestions(topic);
  }
}

/**
 * Generate mock questions when API fails
 * @param {string} topic - Topic of the quiz
 * @param {number} numQuestions - Number of questions to generate
 * @returns {string} JSON string of mock questions
 */
function generateMockQuestions(topic, numQuestions = 5) {
  console.log(`Generating ${numQuestions} mock questions for ${topic}`);

  const questions = [];
  for (let i = 0; i < numQuestions; i++) {
    questions.push({
      question: `Sample ${topic} question ${i+1}?`,
      options: [`Option A for question ${i+1}`, `Option B for question ${i+1}`, `Option C for question ${i+1}`, `Option D for question ${i+1}`],
      answer: `Option A for question ${i+1}`
    });
  }

  return JSON.stringify(questions);
}

/**
 * Default questions as a last resort
 * @param {string} topic - Topic of the quiz
 * @returns {Array} Array of default question objects
 */
function generateDefaultQuestions(topic) {
  console.log(`Generating default questions for ${topic}`);

  return [
    {
      question: `What is a key concept in ${topic}?`,
      options: [`Concept A`, `Concept B`, `Concept C`, `Concept D`],
      answer: `Concept A`
    },
    {
      question: `Who is an important figure in ${topic}?`,
      options: [`Person A`, `Person B`, `Person C`, `Person D`],
      answer: `Person A`
    },
    {
      question: `Which of these is related to ${topic}?`,
      options: [`Related thing A`, `Unrelated thing B`, `Unrelated thing C`, `Unrelated thing D`],
      answer: `Related thing A`
    },
    {
      question: `When did ${topic} become significant?`,
      options: [`Year A`, `Year B`, `Year C`, `Year D`],
      answer: `Year A`
    },
    {
      question: `Where is ${topic} most commonly applied?`,
      options: [`Field A`, `Field B`, `Field C`, `Field D`],
      answer: `Field A`
    }
  ];
}

/**
 * Construct a prompt for quiz generation
 */
function constructPrompt(topic, quizType, difficulty, numQuestions) {
  // Make the prompt shorter to fit within token limits
  const prompt = `Generate ${numQuestions} ${difficulty} ${quizType} questions about ${topic}. Format as JSON array with objects having: "question", "options" (4 strings), "answer" (correct option).`;

  console.log('Constructed prompt for quiz generation');
  return prompt;
}

/**
 * Parse the LLM response to extract quiz questions
 */
function parseQuizQuestions(llmResponse) {
  try {
    console.log('Parsing quiz questions from LLM response');

    if (!llmResponse) {
      console.error('Received empty LLM response');
      throw new Error('Empty response from LLM');
    }

    // If the response is a string, process it
    if (typeof llmResponse === 'string') {
      console.log('LLM Response length:', llmResponse.length);

      // Remove markdown code blocks
      let cleanResponse = llmResponse;
      if (cleanResponse.includes('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n|\n```/g, '');
      } else if (cleanResponse.includes('```')) {
        cleanResponse = cleanResponse.replace(/```\n|\n```/g, '');
      }

      // First try to parse the entire response as a JSON array
      try {
        const parsedJson = JSON.parse(cleanResponse);
        if (Array.isArray(parsedJson) && parsedJson.length > 0) {
          console.log(`Successfully parsed entire response as JSON array with ${parsedJson.length} questions`);
          return parsedJson;
        }
      } catch (e) {
        console.log('Failed to parse entire response as JSON, attempting to extract individual questions');
      }

      // Extract individual question objects using regex with proper escaping for JSON
      const questions = [];
      // This improved regex handles escaped quotes and special characters in JSON
      const objectRegex = /\{[\s\S]*?"question"[\s\S]*?"options"[\s\S]*?"answer"[\s\S]*?\}/g;
      const matches = cleanResponse.match(objectRegex);

      if (matches && matches.length > 0) {
        console.log(`Found ${matches.length} potential question objects`);

        // Process each potential match
        for (const obj of matches) {
          try {
            // Fix common JSON issues before parsing
            let fixedObj = obj
              // Fix unescaped quotes within strings
              .replace(/([^\\])"([^"]*?)([^\\])"/g, '$1\\"$2$3\\"')
              // Fix missing quotes around property names if needed
              .replace(/(\{|\,)\s*([a-zA-Z0-9_]+)\s*\:/g, '$1"$2":');

            const question = JSON.parse(fixedObj);
            if (question.question && Array.isArray(question.options) && question.answer) {
              questions.push(question);
              console.log(`Added valid question: "${question.question.substring(0, 30)}..."`);
            }
          } catch (e) {
            // Try an alternative approach for this object
            try {
              // Extract the components manually
              const questionMatch = obj.match(/"question"\s*:\s*"([^"]+)"/);
              const optionsMatch = obj.match(/"options"\s*:\s*\[(.*?)\]/s);
              const answerMatch = obj.match(/"answer"\s*:\s*"([^"]+)"/);

              if (questionMatch && optionsMatch && answerMatch) {
                const question = questionMatch[1];
                // Split options by comma, but handle quoted strings properly
                const optionsText = optionsMatch[1];
                const options = [];
                let currentOption = '';
                let inQuotes = false;

                for (let i = 0; i < optionsText.length; i++) {
                  const char = optionsText[i];
                  if (char === '"' && (i === 0 || optionsText[i-1] !== '\\')) {
                    inQuotes = !inQuotes;
                  }

                  if (char === ',' && !inQuotes) {
                    options.push(currentOption.trim().replace(/^"|"$/g, ''));
                    currentOption = '';
                  } else {
                    currentOption += char;
                  }
                }

                if (currentOption) {
                  options.push(currentOption.trim().replace(/^"|"$/g, ''));
                }

                const answer = answerMatch[1];

                const questionObj = {
                  question,
                  options,
                  answer
                };

                questions.push(questionObj);
                console.log(`Added manually extracted question: "${question.substring(0, 30)}..."`);
              } else {
                console.log(`Failed to manually extract components from: ${obj.substring(0, 50)}...`);
              }
            } catch (manualError) {
              console.log(`Failed to parse object: ${obj.substring(0, 50)}...`);
            }
          }
        }

        if (questions.length > 0) {
          console.log(`Successfully extracted ${questions.length} valid questions`);
          return questions;
        }
      }

      // If regex extraction failed, try standard JSON parsing again
      try {
        // Try to parse as a complete JSON array
        const parsed = JSON.parse(cleanResponse);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // Last-ditch effort: try to extract and fix a partial array
        try {
          // Look for array pattern and try to complete it
          if (cleanResponse.includes('[') && cleanResponse.includes('{')) {
            const startBracket = cleanResponse.indexOf('[');
            let content = cleanResponse.substring(startBracket);

            // Count open/close braces to find complete objects
            let completeContent = '';
            let openBraces = 0;
            let openBrackets = 0;
            let inObject = false;

            for (let i = 0; i < content.length; i++) {
              const char = content[i];
              completeContent += char;

              if (char === '{') {
                openBraces++;
                inObject = true;
              } else if (char === '}') {
                openBraces--;
                if (openBraces === 0 && inObject) {
                  // We've completed an object
                  inObject = false;
                }
              } else if (char === '[') {
                openBrackets++;
              } else if (char === ']') {
                openBrackets--;
                if (openBrackets === 0) {
                  // We've completed the array
                  break;
                }
              }
            }

            // If we don't have a closing bracket but have complete objects, add it
            if (openBrackets > 0 && !inObject) {
              completeContent += ']';
            }

            // Try to parse the fixed content
            try {
              const parsedArray = JSON.parse(completeContent);
              if (Array.isArray(parsedArray) && parsedArray.length > 0) {
                console.log(`Successfully parsed fixed array content with ${parsedArray.length} questions`);
                return parsedArray;
              }
            } catch (err) {
              console.log('Failed to parse fixed array content');
            }
          }
        } catch (err) {
          console.log('Error during array recovery attempt');
        }
      }
    }

    // If we have any successfully parsed questions, return them
    if (questions && questions.length > 0) {
      return questions;
    }

    // If none of our parsing attempts worked, throw an error
    console.error('Failed to parse any valid questions from the LLM response');
    throw new Error('Unable to parse valid questions from LLM response');
  } catch (error) {
    console.error('Error parsing quiz questions:', error.message);
    throw new Error('Failed to parse quiz questions from LLM response');
  }
}

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  generateQuizQuestions
};