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
 * @param {Object} userData - User data including level
 * @param {boolean} forceRegenerate - Whether to force regeneration of questions
 * @returns {Promise<Object>} Quiz object
 */
async function getQuizById(quizId, userData = {}, forceRegenerate = false) {
  try {
    console.log(`Fetching quiz with ID: ${quizId}, forceRegenerate: ${forceRegenerate}`);
    console.log(`User level: ${userData?.level || 'not provided'}`);

    // First try to get the quiz with its questions
    let quiz = await Quiz.findById(quizId);

    if (!quiz) {
      console.log(`Quiz with ID ${quizId} not found`);
      return null;
    }

    // Determine difficulty based on user level
    let userDifficulty = 'medium';
    if (userData && userData.level) {
      const userLevel = parseInt(userData.level, 10);
      if (!isNaN(userLevel)) {
        if (userLevel <= 3) {
          userDifficulty = 'easy';
        } else if (userLevel <= 7) {
          userDifficulty = 'medium';
        } else {
          userDifficulty = 'hard';
        }
        console.log(`Setting difficulty to ${userDifficulty} based on user level ${userLevel}`);
      }
    } else {
      console.log(`No user level provided. Defaulting to ${userDifficulty} difficulty`);
    }

    // Store current quiz difficulty
    const currentDifficulty = quiz.difficulty || 'medium';
    console.log(`Current quiz difficulty in database: ${currentDifficulty}`);
    console.log(`User needs difficulty: ${userDifficulty}`);

    // Check if quiz already has questions and we don't need to force regenerate
    if (!forceRegenerate && quiz.questions && quiz.questions.length > 0) {
      const currentTime = new Date();
      const lastGenerated = quiz.lastQuestionsGenerated || new Date(0);
      const timeSinceLastGeneration = currentTime - lastGenerated;

      // If questions were generated in the last 30 seconds, don't regenerate them
      // This prevents duplicate generation on multiple requests
      if (timeSinceLastGeneration < 30000) { // 30 seconds
        console.log(`Quiz ${quiz.title} has questions that were recently generated (${Math.round(timeSinceLastGeneration / 1000)}s ago) - returning existing questions to ensure ID consistency`);
        return quiz;
      }

      // If difficulty matches and we're not forcing regeneration, return existing questions
      if (quiz.difficulty === userDifficulty) {
        console.log(`Quiz ${quiz.title} already has ${quiz.questions.length} questions with matching difficulty ${userDifficulty} - returning existing questions`);
        return quiz;
      }
    }

    // Check if generation is already in progress by atomically checking and setting the flag
    // This uses MongoDB's findOneAndUpdate with conditions to ensure only one process can set it
    const updateResult = await Quiz.findOneAndUpdate(
      { _id: quizId, generationInProgress: false }, // Only update if not already in progress
      { $set: { generationInProgress: true } },
      { new: true }
    );

    // If updateResult is null, another process is already generating questions
    if (!updateResult) {
      console.log(`Question generation already in progress for quiz ${quiz.title} - waiting for completion`);

      // Check every 500ms for up to 30 seconds if generation has completed
      let updatedQuiz = null;
      for (let i = 0; i < 60; i++) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms

        // Get the latest version
        updatedQuiz = await Quiz.findById(quizId);

        // If generation is no longer in progress AND we have questions, return the updated quiz
        if (!updatedQuiz.generationInProgress && updatedQuiz.questions && updatedQuiz.questions.length > 0) {
          console.log(`Generation completed while waiting - returning fresh questions (${updatedQuiz.questions.length} questions)`);
          return updatedQuiz;
        }
      }

      // If we waited for 30 seconds and still don't have questions, generate them now
      // This handles the case where the previous generation attempt might have failed
      console.log(`Waited too long for question generation, taking over the process`);

      // Reset the generation flag and continue with generation
      await Quiz.findByIdAndUpdate(quizId, { generationInProgress: false });

      // Recursively call this function to start the generation process
      return getQuizById(quizId, userData);
    }

    // We are now responsible for generation
    console.log(`Marked quiz ${quiz.title} as generation in progress`);

    try {
      // For Word Scramble quizzes, we need to handle them specially
      if (quiz.type === 'word') {
        console.log(`Word Scramble quiz detected - ID: ${quizId}, difficulty: ${userDifficulty}`);

        // Generate word scramble questions
        const wordScrambleQuestions = generateWordScrambleQuestions(userDifficulty);

        // Update the quiz with the new word scramble questions
        const updatedQuiz = await Quiz.findOneAndUpdate(
          { _id: quizId },
          {
            $set: {
              questions: wordScrambleQuestions,
              difficulty: userDifficulty,
              lastQuestionsGenerated: new Date(), // Track when questions were generated
              generationInProgress: false, // Clear the flag
              updatedAt: new Date()
            }
          },
          { new: true, runValidators: true }
        );

        if (updatedQuiz) {
          console.log(`Generated and saved ${wordScrambleQuestions.length} word scramble questions with difficulty ${userDifficulty}`);
          quiz = updatedQuiz;
        } else {
          console.log(`Failed to update quiz with new word scramble questions`);
          quiz = await Quiz.findById(quizId);
        }
      } else {
        // For other quiz types, generate questions with the appropriate difficulty
        console.log(`Quiz ${quiz.title} needs new questions with difficulty: ${userDifficulty}`);

        // Determine parameters based on quiz type
        let topic, quizType, difficulty = userDifficulty;

        switch (quiz.type) {
          case 'math':
            topic = 'Algebra';
            quizType = 'multiple_choice';
            break;
          case 'general':
            topic = 'General Knowledge';
            quizType = 'multiple_choice';
            break;
          case 'coding':
            topic = 'Programming Basics';
            quizType = 'multiple_choice';
            break;
          case 'science':
            topic = 'Science Concepts';
            quizType = 'multiple_choice';
            break;
          case 'grammar':
            topic = 'Grammar Rules';
            quizType = 'multiple_choice';
            break;
          default:
            topic = quiz.title;
            quizType = 'multiple_choice';
        }

        // Generate questions for this quiz
        const generatedQuestions = await generateQuizQuestions({
          topic,
          quizType,
          difficulty,
          numQuestions: 5
        });

        // Mark the difficulty of each question
        const questionsWithDifficulty = generatedQuestions.map(q => ({
          ...q,
          difficulty: userDifficulty
        }));

        // Update the quiz with new questions and the current difficulty
        const updatedQuiz = await Quiz.findOneAndUpdate(
          { _id: quizId },
          {
            $set: {
              questions: questionsWithDifficulty,
              difficulty: userDifficulty,  // Save the user difficulty level
              lastQuestionsGenerated: new Date(), // Track when questions were generated
              generationInProgress: false, // Clear the flag
              updatedAt: new Date()
            }
          },
          { new: true, runValidators: true }
        );

        if (updatedQuiz) {
          console.log(`Generated and saved ${questionsWithDifficulty.length} questions for quiz ${quiz.title} with difficulty ${userDifficulty}`);
          quiz = updatedQuiz;
        } else {
          console.log(`Failed to update quiz with new questions`);
          // Get the latest version
          quiz = await Quiz.findById(quizId);
        }
      }
    } catch (error) {
      // If there's an error during generation, make sure to clear the flag
      await Quiz.findByIdAndUpdate(quizId, { generationInProgress: false });
      throw error;
    }

    console.log(`Quiz ${quiz.title} details:`, {
      hasQuestions: !!quiz.questions,
      questionsCount: quiz.questions ? quiz.questions.length : 0,
      difficulty: quiz.difficulty,
      questionsSample: quiz.questions && quiz.questions.length > 0 ?
        quiz.questions[0] : 'No questions'
    });

    // Final check to ensure we have questions
    if (!quiz.questions || quiz.questions.length === 0) {
      console.log(`Warning: Returning quiz without questions. Generating default questions.`);

      // Generate default questions as a fallback
      const defaultQuestions = [
        {
          question: `What is a key concept in ${quiz.title}?`,
          options: [`Concept A`, `Concept B`, `Concept C`, `Concept D`],
          answer: `Concept A`,
          difficulty: userDifficulty
        },
        {
          question: `Which formula is most important in ${quiz.title}?`,
          options: [`Formula A`, `Formula B`, `Formula C`, `Formula D`],
          answer: `Formula A`,
          difficulty: userDifficulty
        },
        {
          question: `Who made significant contributions to ${quiz.title}?`,
          options: [`Person A`, `Person B`, `Person C`, `Person D`],
          answer: `Person A`,
          difficulty: userDifficulty
        },
        {
          question: `What is the application of ${quiz.title} in real life?`,
          options: [`Application A`, `Application B`, `Application C`, `Application D`],
          answer: `Application A`,
          difficulty: userDifficulty
        },
        {
          question: `Which of these is NOT related to ${quiz.title}?`,
          options: [`Related A`, `Related B`, `Unrelated C`, `Related D`],
          answer: `Unrelated C`,
          difficulty: userDifficulty
        }
      ];

      // Save these default questions
      const updatedQuiz = await Quiz.findByIdAndUpdate(
        quizId,
        {
          $set: {
            questions: defaultQuestions,
            difficulty: userDifficulty,
            lastQuestionsGenerated: new Date(),
            generationInProgress: false,
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      return updatedQuiz;
    }

    return quiz;
  } catch (error) {
    console.error(`Error fetching quiz with ID ${quizId}:`, error);
    // Make sure to clear the generation flag in case of error
    try {
      await Quiz.findByIdAndUpdate(quizId, { generationInProgress: false });
    } catch (cleanupError) {
      console.error(`Failed to clear generation flag: ${cleanupError.message}`);
    }
    throw error;
  }
}

/**
 * Generate word scramble questions
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @returns {Array} Array of word scramble question objects
 */
function generateWordScrambleQuestions(difficulty) {
  console.log(`Generating word scramble questions with ${difficulty} difficulty`);

  // Words for different difficulty levels
  const wordsByDifficulty = {
    easy: [
      { word: "CAT", options: ["Cat", "Act", "Tac", "Atc"] },
      { word: "DOG", options: ["Dog", "God", "Dgo", "Odg"] },
      { word: "SUN", options: ["Sun", "Nus", "Snu", "Usn"] },
      { word: "HAT", options: ["Hat", "Tha", "Ath", "Hta"] },
      { word: "PEN", options: ["Pen", "Nep", "Enp", "Pne"] },
      { word: "BOOK", options: ["Book", "Kobo", "Obok", "Boko"] },
      { word: "FISH", options: ["Fish", "Shfi", "Ifsh", "Fshi"] },
      { word: "BALL", options: ["Ball", "Lalb", "Blal", "Allb"] },
      { word: "TREE", options: ["Tree", "Reet", "Eter", "Teer"] },
      { word: "MOON", options: ["Moon", "Omon", "Nomo", "Omno"] },
      { word: "STAR", options: ["Star", "Rats", "Arts", "Tars"] },
      { word: "LAMP", options: ["Lamp", "Paml", "Almp", "Plam"] },
      { word: "FROG", options: ["Frog", "Gorf", "Orfg", "Rogf"] },
      { word: "HAND", options: ["Hand", "Dhan", "Nadh", "Hnad"] },
      { word: "CHAIR", options: ["Chair", "Cihra", "Hcira", "Rchai"] },
      { word: "SAND", options: ["Sand", "Dnas", "Ands", "Nads"] },
      { word: "GLASS", options: ["Glass", "Ssgal", "Lsgas", "Sglas"] },
      { word: "CLOUD", options: ["Cloud", "Udcol", "Loduc", "Dluoc"] },
      { word: "BREAD", options: ["Bread", "Arbde", "Rebad", "Drabe"] },
      { word: "PLANE", options: ["Plane", "Napel", "Enalp", "Lepna"] }
    ],
    medium: [
      { word: "COMPUTER", options: ["Computer", "Conductor", "Commuter", "Completer"] },
      { word: "OCEAN", options: ["Canoe", "Ocean", "Aceon", "Coane"] },
      { word: "ELEPHANT", options: ["Helpaten", "Elephant", "Telephane", "Pantehel"] },
      { word: "PIZZA", options: ["Zippa", "Pazzi", "Pizza", "Izpaz"] },
      { word: "KEYBOARD", options: ["Keyboard", "Boardkey", "Kdyborea", "Boarkeyd"] },
      { word: "MOUNTAIN", options: ["Mountain", "Tainmoun", "Moutanin", "Niatmoun"] },
      { word: "LIBRARY", options: ["Library", "Rarylib", "Bralyri", "Librayr"] },
      { word: "BICYCLE", options: ["Bicycle", "Cyclebi", "Bilecy", "Clebiby"] },
      { word: "COURTEOUS", options: ["Circteous", "Courtesic", "Discourse", "Courteous"] },
      { word: "GIRAFFE", options: ["Giraffe", "Fegraif", "Raffegi", "Giffaer"] },
      { word: "LANTERN", options: ["Lantern", "Ternlan", "Nterlan", "Latern"] },
      { word: "CAPTURE", options: ["Capture", "Pturace", "Cuetarp", "Recatpu"] },
      { word: "DYNAMIC", options: ["Dynamic", "Nydamic", "Micdyn", "Cadmyni"] },
      { word: "JOURNAL", options: ["Journal", "Rnaljou", "Jourlan", "Noujral"] }
    ],
    hard: [
      { word: "ALGORITHM", options: ["Logarithm", "Algorithm", "Rithmalgo", "Gorithmal"] },
      { word: "UNIVERSITY", options: ["University", "Versatynui", "Versityuni", "Yuniverse"] },
      { word: "CHOCOLATE", options: ["Latechoco", "Cocolate", "Chocolate", "Chotelaco"] },
      { word: "PSYCHOLOGY", options: ["Psychology", "Sychologp", "Psychogoly", "Logysycho"] },
      { word: "REVOLUTION", options: ["Revolution", "Volutioner", "Revoltion", "Tionrevolu"] },
      { word: "PHILOSOPHY", options: ["Philosophy", "Sophyphilo", "Phylosoph", "Philosopy"] },
      { word: "TECHNOLOGY", options: ["Technology", "Nologytec", "Techgyolo", "Logytechno"] },
      { word: "GOVERNMENT", options: ["Government", "Mentgovern", "Governtmen", "Vernmentgo"] },
      { word: "ENTHUSIASTIC", options: ["Enthusiastic", "Ticenthusia", "Husianetsti", "Tasticenhus"] },
      { word: "EXAGGERATE", options: ["Exaggerate", "Reexaggate", "Tegarexag", "Exateggar"] },
      { word: "ASTRONOMY", options: ["Astronomy", "Nomyrasto", "Tronamoys", "Trosanomy"] },
      { word: "DEMOCRACY", options: ["Democracy", "Ycamerod", "Mocdarey", "Darecomy"] },
      { word: "PHARMACEUTICAL", options: ["Pharmaceutical", "Ceuticalpharma", "Harmacceutial", "Ceutialpharma"] },
      { word: "MATHEMATICS", options: ["Mathematics", "Csemathimat", "Hematismatc", "Thamaticsma"] }
    ]
  };

  // Select words based on difficulty
  const words = wordsByDifficulty[difficulty] || wordsByDifficulty.medium;

  // Randomly select 5 different words for the quiz
  const selectedWords = [];
  const usedIndices = new Set();

  while (selectedWords.length < 5 && usedIndices.size < words.length) {
    // Generate a random index
    const randomIndex = Math.floor(Math.random() * words.length);

    // If we haven't used this index yet, add the word
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);

      const wordObj = words[randomIndex];
      // Randomize the letters in the original word
      const scrambledLetters = shuffleString(wordObj.word);

      selectedWords.push({
        question: `Unscramble the letters: ${scrambledLetters}`,
        options: wordObj.options,
        answer: wordObj.options.find(opt => opt.toUpperCase() === wordObj.word),
        difficulty: difficulty
      });
    }
  }

  return selectedWords;
}

/**
 * Helper function to shuffle a string's characters
 * @param {string} str - String to shuffle
 * @returns {string} Shuffled string
 */
function shuffleString(str) {
  const array = str.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
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
      question: `Sample ${topic} question ${i + 1}?`,
      options: [`Option A for question ${i + 1}`, `Option B for question ${i + 1}`, `Option C for question ${i + 1}`, `Option D for question ${i + 1}`],
      answer: `Option A for question ${i + 1}`
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
                  if (char === '"' && (i === 0 || optionsText[i - 1] !== '\\')) {
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