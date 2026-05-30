const mongoose = require("mongoose");

const loanApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    customerId: {
      type: String,
      required: true,
    },
    loanAmount: {
      type: Number,
      required: true,
    },
    purpose: {
      type: String,
      default: "",
    },
    tenure: {
      type: Number, // in months
      required: true,
    },
    interestRate: {
      type: Number,
      default: null,
    },
    emi: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    creditScore: {
      type: Number,
      default: null,
    },
    preApprovedLimit: {
      type: Number,
      default: null,
    },
    riskScore: {
      type: Number,
      default: null,
    },
    reason: {
      type: String,
      default: "",
    },
    sanctionPdfUrl: {
      type: String,
      default: null,
    },
    sanctionReference: {
      type: String,
      default: null,
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    finalDecision: {
      type: String,
      default: null,
    },
    approvedAmount: {
      type: Number,
      default: null,
    },
    explanation: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoanApplication", loanApplicationSchema);
