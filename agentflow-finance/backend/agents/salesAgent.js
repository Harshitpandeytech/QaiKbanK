/**
 * Sales Agent — Loan Sales Executive
 *
 * Responsibilities:
 * - Understand customer needs through conversation
 * - Collect loan requirements: amount, purpose, tenure, employmentType
 * - Persuade customer and maintain conversational context
 *
 * Required Inputs:
 * - messages: conversation history
 * - collectedData: already collected parameters from the database
 */

const { getModel, generateContentWithRetry } = require("../services/geminiService");

const SYSTEM_INSTRUCTION = `You are Ducky, a warm, professional, and persuasive personal loan sales executive for QaiKbanK (a leading NBFC).
Your goal is to guide the customer through their personal loan journey and collect their loan requirements in a conversational, friendly manner.

You must collect:
1. Customer ID or Phone Number (Ask for this first so we can check pre-approved offers!)
2. Loan Amount (Must be a positive number)
3. Loan Purpose (Why they need the loan, e.g., home renovation, wedding, education, medical, business)
4. Tenure (Duration in months, e.g., 12, 24, 36, 48, 60 months)
5. Employment Type (Must be either 'Salaried' or 'Self-Employed')

Guidelines:
- Start with a very warm greeting if the conversation is beginning.
- Do NOT be robotic or list questions. Ask for missing details one by one in a friendly, conversational flow.
- If the customer asks questions, has concerns, or raises objections (e.g., about interest rates or eligibility), answer them persuasively and reassure them before asking the next question.
- Highlight QaiKbanK benefits: fast processing, flexible tenures, competitive rates, and seamless digital journey.
- The user might provide multiple details at once (e.g., "I want a 2 lakh loan for my sister's wedding for 2 years"). Be smart and extract all of them!

You must output a JSON response in the following exact schema:
{
  "reply": "Your conversational response to the customer",
  "extractedData": {
    "customerId": "extracted customerId or phone number if provided, otherwise null",
    "loanAmount": extracted loanAmount as a number, or null,
    "loanPurpose": "extracted loan purpose or null",
    "tenure": extracted tenure as a number in months, or null,
    "employmentType": "extracted employment type ('Salaried' or 'Self-Employed') or null"
  },
  "complete": true if ALL 5 required fields are successfully collected, false otherwise
}`;

/**
 * Chat with the customer using the Sales Agent context.
 * @param {Array} messages - Message history
 * @param {Object} collectedData - Current database state
 * @returns {Promise<Object>} The response containing reply, extractedData, and complete status
 */
const collectRequirements = async (messages, collectedData = {}) => {
  try {
    const model = getModel("gemini-2.0-flash");
    
    // Map database messages to Gemini contents structure
    const contents = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Inject current database state into system prompt to keep Gemini anchored
    const contextPrompt = `${SYSTEM_INSTRUCTION}

Current State of Collected Data (Already Saved):
- Customer ID: ${collectedData.customerId || "Not collected yet"}
- Customer Name: ${collectedData.customerName || "Not known yet"}
- Loan Amount: ${collectedData.loanAmount ? "₹" + collectedData.loanAmount : "Not collected yet"}
- Loan Purpose: ${collectedData.loanPurpose || "Not collected yet"}
- Tenure: ${collectedData.tenure ? collectedData.tenure + " months" : "Not collected yet"}
- Employment Type: ${collectedData.employmentType || "Not collected yet"}

Remember to respond ONLY in the requested JSON format.`;

    const response = await generateContentWithRetry(model, {
      contents: contents,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
      systemInstruction: contextPrompt,
    });

    const responseText = response.response.text();
    const result = JSON.parse(responseText);

    
    return result;
  } catch (error) {
    console.error("Sales Agent Error:", error);
    // Graceful fallback if JSON parsing or AI fails
    return {
      reply: "I'm sorry, I encountered a temporary issue. Could you please repeat your last message?",
      extractedData: {},
      complete: false,
    };
  }
};

module.exports = { collectRequirements };
