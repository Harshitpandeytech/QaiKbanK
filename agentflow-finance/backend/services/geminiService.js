/**
 * Gemini Service
 *
 * Initializes and provides access to the Google Gemini AI API.
 * Wraps the @google/generative-ai SDK for reuse across all agents.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get a Gemini generative model instance.
 * @param {string} [modelName="gemini-2.0-flash"] - Model to use
 * @returns {GenerativeModel}
 */
const getModel = (modelName = "gemini-2.0-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Helper to run content generation with automated retries and exponential backoff
 * when hitting 429 Rate Limits / Quota errors.
 */
const generateContentWithRetry = async (model, contentsOptions, retries = 5, delayMs = 4000) => {
  let currentDelay = delayMs;
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(contentsOptions);
      return result;
    } catch (error) {
      const isRateLimit = 
        error.status === 429 || 
        error.message?.includes("429") || 
        error.message?.includes("Quota exceeded") || 
        error.message?.includes("Too Many Requests");

      if (isRateLimit && i < retries - 1) {
        console.warn(
          `⚠️ [Gemini API] 429 Rate Limit/Quota Exceeded. Retrying in ${currentDelay}ms... (Attempt ${i + 1}/${retries})`
        );
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
        currentDelay *= 1.5; // Moderate exponential backoff
        continue;
      }
      throw error;
    }
  }
};


/**
 * Send a single prompt to Gemini and get a text response.
 * @param {string} prompt - The prompt text
 * @param {string} [modelName] - Optional model override
 * @returns {Promise<string>} The generated text
 */
const generateText = async (prompt, modelName) => {
  const model = getModel(modelName);
  const result = await generateContentWithRetry(model, { contents: [{ role: "user", parts: [{ text: prompt }] }] });
  return result.response.text();
};

/**
 * Start or continue a multi-turn chat session.
 * @param {string} systemInstruction - System prompt for the chat
 * @param {Array<{role: string, parts: Array<{text: string}>}>} history - Previous messages
 * @param {string} [modelName] - Optional model override
 * @returns {ChatSession}
 */
const startChat = (systemInstruction, history = [], modelName) => {
  const model = getModel(modelName);
  return model.startChat({
    history,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 1024,
    },
    systemInstruction,
  });
};

/**
 * Send a message in an existing chat session.
 * @param {ChatSession} chat - The chat session
 * @param {string} message - User message
 * @returns {Promise<string>} AI response text
 */
const sendChatMessage = async (chat, message) => {
  const result = await chat.sendMessage(message);
  return result.response.text();
};

module.exports = {
  genAI,
  getModel,
  generateText,
  startChat,
  sendChatMessage,
  generateContentWithRetry,
};

