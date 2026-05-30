/**
 * Agent Log Service
 *
 * Persists agent invocation logs to MongoDB for audit trail and explainability.
 * Every agent call should be logged through this service.
 */

const AgentLog = require("../models/AgentLog");

/**
 * Create a new agent log entry.
 * @param {object} logData
 * @param {string} logData.sessionId - Chat session ID
 * @param {string} logData.agentName - e.g. "salesAgent", "verificationAgent"
 * @param {*} logData.input - Input passed to the agent
 * @param {*} logData.output - Output returned by the agent
 * @param {number} [logData.durationMs] - Processing time in milliseconds
 * @returns {Promise<object>} Saved log document
 */
const createAgentLog = async ({ sessionId, agentName, input, output, durationMs }) => {
  try {
    const log = await AgentLog.create({
      sessionId,
      agentName,
      input,
      output,
      durationMs,
      timestamp: new Date(),
    });
    return log;
  } catch (error) {
    console.error("Failed to create agent log:", error.message);
    // Don't throw — logging failures shouldn't break the main flow
    return null;
  }
};

/**
 * Get all logs for a session.
 * @param {string} sessionId
 * @returns {Promise<Array>} Array of log entries
 */
const getLogsBySession = async (sessionId) => {
  return AgentLog.find({ sessionId }).sort({ timestamp: 1 });
};

/**
 * Get all logs for a specific agent.
 * @param {string} agentName
 * @param {number} [limit=50]
 * @returns {Promise<Array>}
 */
const getLogsByAgent = async (agentName, limit = 50) => {
  return AgentLog.find({ agentName }).sort({ timestamp: -1 }).limit(limit);
};

/**
 * Get recent logs.
 * @param {number} [limit=20]
 * @returns {Promise<Array>}
 */
const getRecentLogs = async (limit = 20) => {
  return AgentLog.find().sort({ timestamp: -1 }).limit(limit);
};

module.exports = {
  createAgentLog,
  getLogsBySession,
  getLogsByAgent,
  getRecentLogs,
};
