const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const masterAgent = require("../agents/masterAgent");

/**
 * Chat Routes
 *
 * POST /api/chat/message    — Send a message to the Master Agent
 *   Body: { message: String, sessionId?: String }
 *   Response: { reply: String, agentName: String, stage: String, sessionId: String, collectedData: Object }
 *
 * GET /api/chat/session/:id  — Get full chat history for a session
 * GET /api/chat/sessions     — List all chat sessions
 */

// Helper to generate a simple unique session ID
const generateSessionId = () => {
  return "session_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
};

// @route   POST /api/chat/message
// @desc    Send a message to the Master Agent orchestrator
// @access  Public (Can be secured via JWT later if needed)
router.post("/message", async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message string is required.",
      });
    }

    let session;
    let activeSessionId = sessionId;

    // Load or create a new session
    if (activeSessionId) {
      session = await Conversation.findOne({ sessionId: activeSessionId });
    }

    if (!session) {
      activeSessionId = generateSessionId();
      session = new Conversation({
        sessionId: activeSessionId,
        currentStage: "WELCOME",
        messages: [],
        collectedData: {},
      });
    }

    // Process user message through Master Agent
    const result = await masterAgent.processMessage(message, session);

    res.json({
      success: true,
      reply: result.reply,
      agentName: result.agentUsed,
      stage: result.stage,
      sessionId: activeSessionId,
      collectedData: result.collectedData,
      decisionDetails: result.decisionDetails,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/chat/session/:id
// @desc    Get conversation history for a specific session
// @access  Public
router.get("/session/:id", async (req, res, next) => {
  try {
    const session = await Conversation.findOne({ sessionId: req.params.id });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found.",
      });
    }

    res.json({
      success: true,
      sessionId: session.sessionId,
      currentStage: session.currentStage,
      collectedData: session.collectedData,
      decisionDetails: session.decisionDetails,
      messages: session.messages,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/chat/sessions
// @desc    List all conversations
// @access  Public
router.get("/sessions", async (req, res, next) => {
  try {
    const sessions = await Conversation.find()
      .sort({ updatedAt: -1 })
      .select("sessionId currentStage collectedData updatedAt");

    res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
