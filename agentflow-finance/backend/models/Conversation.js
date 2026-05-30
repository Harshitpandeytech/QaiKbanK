const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "model"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    agentName: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    currentStage: {
      type: String,
      enum: [
        "WELCOME",
        "COLLECT_CUSTOMER_ID",
        "COLLECT_LOAN_AMOUNT",
        "COLLECT_LOAN_PURPOSE",
        "COLLECT_TENURE",
        "COLLECT_EMPLOYMENT",
        "SALES_COMPLETED",
        "VERIFICATION",
        "UNDERWRITING",
        "SALARY_UPLOAD_REQUIRED",
        "UNDERWRITING_REVIEW",
        "DECISION_COMPLETE",
        "SALARY_UPLOAD",
        "DECISION",
        "SANCTION",
        "COMPLETED",
      ],
      default: "WELCOME",
    },
    collectedData: {
      customerId: { type: String, default: null },
      customerName: { type: String, default: null },
      loanAmount: { type: Number, default: null },
      loanPurpose: { type: String, default: null },
      tenure: { type: Number, default: null },
      employmentType: { type: String, default: null },
      monthlyIncome: { type: Number, default: null },
      existingLoans: { type: [String], default: [] },
    },
    decisionDetails: {
      decision: { type: String, default: null },
      creditScore: { type: Number, default: null },
      preApprovedLimit: { type: Number, default: null },
      requestedAmount: { type: Number, default: null },
      interestRate: { type: Number, default: null },
      emi: { type: Number, default: null },
      reason: { type: String, default: null }
    },
    loanApplicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
