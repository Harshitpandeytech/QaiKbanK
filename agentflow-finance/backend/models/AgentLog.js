const mongoose = require("mongoose");

const agentLogSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      default: null,
    },
    agentName: {
      type: String, // "masterAgent", "salesAgent", "verificationAgent", etc.
      required: true,
    },
    input: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    durationMs: {
      type: Number,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AgentLog", agentLogSchema);
