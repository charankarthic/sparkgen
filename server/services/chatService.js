const { sendLLMRequest } = require('./llmService');

/**
 * Service for handling chat interactions with the AI assistant
 */
class ChatService {
  /**
   * Process a user message and generate an AI response
   * @param {string} userId - The ID of the user sending the message
   * @param {string} message - The message from the user
   * @returns {Promise<string>} The AI response
   */
  static async processMessage(userId, message) {
    try {
      console.log(`Processing chat message for user ${userId}`);
      // Create a prompt that contains user context and instructions for assistant behavior
      const prompt = this.createChatPrompt(message);

      // Call the LLM service with the provider, model, and message
      console.log('Sending request to LLM service with model: deepseek/deepseek-r1:free');

      // Add a timeout for the entire operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('LLM request timed out after 45 seconds')), 45000);
      });

      // Race between the actual request and the timeout
      const response = await Promise.race([
        sendLLMRequest('openrouter', 'deepseek/deepseek-r1:free', prompt),
        timeoutPromise
      ]);

      console.log('Received response from LLM service');

      // Parse and clean the response
      const cleanedResponse = this.processResponse(response);
      console.log('Processed and cleaned response for user');

      return cleanedResponse;
    } catch (error) {
      console.error('Error in ChatService.processMessage:', error);
      // Return a fallback response instead of throwing an error, to prevent server crashes
      return "I'm sorry, I couldn't process your request at the moment. Our AI service might be experiencing high load or connectivity issues. Please try again in a few moments.";
    }
  }

  /**
   * Create a prompt for the AI assistant with context and instructions
   * @param {string} userMessage - The message from the user
   * @returns {string} The formatted prompt
   */
  static createChatPrompt(userMessage) {
    return `You are a helpful AI tutor assistant for the Sparkgen learning platform. Your goal is to help users learn and understand concepts by providing clear and concise explanations. Be friendly, patient, and encouraging.

When providing step-by-step explanations, especially for math problems:
1. Use clear, numbered steps
2. Make important terms and results **bold** by surrounding them with double asterisks (**like this**)
3. Present numerical calculations clearly with proper spacing
4. Explain the reasoning behind each step
5. For educational content, always highlight important concepts, properties, and terms in **bold**
6. Use a friendly, encouraging tone with appropriate emojis when appropriate

User question: ${userMessage}

Please provide a helpful response that will aid the user's learning. If the question is about a quiz topic, provide useful explanations and hints without directly giving away answers.`;
  }

  /**
   * Process and clean the response from the LLM
   * @param {string} response - The raw response from the LLM
   * @returns {string} Cleaned and formatted response
   */
  static processResponse(response) {
    try {
      // If the response is already a string, sanitize and return it
      if (typeof response === 'string') {
        // Try to parse as JSON to see if it's actually quiz data
        try {
          // Remove any leading/trailing text that might not be part of the JSON
          const possibleJson = response.replace(/^[^[{]*([\[{])/m, '$1').replace(/([}\]])[^}\]]*$/m, '$1');
          const parsed = JSON.parse(possibleJson);

          // Check if parsed result is an array of questions or contains question structure
          if ((Array.isArray(parsed) && parsed.length > 0 && parsed[0].question && parsed[0].options) ||
              (parsed.question && parsed.options)) {
            console.log('Detected actual quiz data structure in response, returning educational guidance');
            return "I'm here to help you learn, but I can't provide direct quiz answers. Can I help you understand a concept instead?";
          }
        } catch (jsonError) {
          // Not JSON or invalid JSON, which is expected for normal text responses
          console.log('Response is not in JSON format, processing as normal text');
        }

        // Ensure proper formatting and line breaks are preserved
        let formattedResponse = response.trim();

        // Make sure all bold formatting (**text**) is properly spaced
        formattedResponse = formattedResponse.replace(/\*\*(\S)/g, '**$1').replace(/(\S)\*\*/g, '$1**');

        // Do not remove or change line breaks in the response
        return formattedResponse;
      }

      // If the response is null or undefined, return a fallback response
      console.log('Received empty or invalid response from LLM, returning fallback message');
      return "I'm sorry, I couldn't generate a response. Could you please try rephrasing your question?";
    } catch (error) {
      console.error('Error while processing LLM response:', error);
      return "I encountered an issue while processing your request. Could you try again?";
    }
  }
}

module.exports = ChatService;