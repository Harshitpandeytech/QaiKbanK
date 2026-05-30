const express = require("express");
const router = express.Router();
const logService = require("../services/logService");

/**
 * Agent Log Routes
 *
 * GET  /api/logs              — Get recent logs
 * GET  /api/logs/session/:id  — Get logs for a session
 * GET  /api/logs/agent/:name  — Get logs for an agent
 * POST /api/logs              — Create a log entry (for testing)
 */

// GET /api/logs — Recent logs
router.get("/", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const logs = await logService.getRecentLogs(limit);
    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/logs/session/:id — Logs for a session
router.get("/session/:id", async (req, res, next) => {
  try {
    const logs = await logService.getLogsBySession(req.params.id);
    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/logs/agent/:name — Logs for a specific agent
router.get("/agent/:name", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await logService.getLogsByAgent(req.params.name, limit);
    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/logs — Create a log entry (useful for testing)
router.post("/", async (req, res, next) => {
  try {
    const { sessionId, agentName, input, output, durationMs } = req.body;

    if (!agentName) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: agentName",
      });
    }

    const log = await logService.createAgentLog({
      sessionId,
      agentName,
      input,
      output,
      durationMs,
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
