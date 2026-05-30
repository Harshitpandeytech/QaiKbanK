/**
 * Sanction Letter Agent — Document & Package Generator
 *
 * Responsibilities:
 * - Generates structured sanction packages upon loan approval
 * - Calls referenceService to create unique reference numbers (QBK-2026-XXXXXX)
 * - Invokes explanationService to provide explainable lending points
 * - Updates the Mongoose LoanApplication record with approval details
 * - Logs completion metrics to MongoDB AgentLogs
 */

const referenceService = require("../services/referenceService");
const explanationService = require("../services/explanationService");
const logService = require("../services/logService");
const LoanApplication = require("../models/LoanApplication");

/**
 * Generate a professional on-screen sanction package.
 * @param {Object} input
 * @param {string} input.customerId
 * @param {string} input.customerName
 * @param {number} input.loanAmount
 * @param {number} input.interestRate
 * @param {number} input.tenure
 * @param {number} input.emi
 * @param {number} input.creditScore
 * @param {number} [input.monthlySalary]
 * @param {Array<string>} [input.existingLoans]
 * @param {string} [input.sessionId]
 * @returns {Promise<Object>} The complete sanction package details
 */
const generateSanctionPackage = async ({
  customerId,
  customerName,
  loanAmount,
  interestRate,
  tenure,
  emi,
  creditScore,
  monthlySalary = null,
  existingLoans = [],
  sessionId = "system",
}) => {
  const startTime = Date.now();

  // 1. Generate unique sanction reference number
  const sanctionReference = await referenceService.generateReference();
  const approvalDate = new Date();

  // 2. Generate explainability insights (positives & risks)
  const explanation = explanationService.generateExplanation({
    creditScore,
    loanAmount,
    preApprovedLimit: loanAmount, // Standard pre-approved reference limit
    emi,
    monthlySalary,
    existingLoans,
  });

  const sanctionPackage = {
    sanctionReference,
    customerName,
    loanAmount,
    interestRate,
    tenure,
    emi,
    approvalDate,
    decision: "APPROVED",
    explanation,
  };

  try {
    // 3. Find and update the LoanApplication document in MongoDB
    // Look for the latest pending or existing application for this customer to update
    let application = await LoanApplication.findOne({ customerId, status: "PENDING" }).sort({ createdAt: -1 });

    if (!application) {
      // If no PENDING application exists, look for the most recent application
      application = await LoanApplication.findOne({ customerId }).sort({ createdAt: -1 });
    }

    if (application) {
      application.status = "APPROVED";
      application.sanctionReference = sanctionReference;
      application.approvalDate = approvalDate;
      application.finalDecision = "APPROVED";
      application.approvedAmount = loanAmount;
      application.emi = emi;
      application.interestRate = interestRate;
      application.explanation = explanation;
      await application.save();
    } else {
      // If no application exists, create a fresh one directly!
      await LoanApplication.create({
        customerId,
        loanAmount,
        purpose: "Personal Loan",
        tenure,
        interestRate,
        emi,
        status: "APPROVED",
        creditScore,
        preApprovedLimit: loanAmount,
        sanctionReference,
        approvalDate,
        finalDecision: "APPROVED",
        approvedAmount: loanAmount,
        explanation,
      });
    }

    // 4. Record execution log in MongoDB AgentLogs
    await logService.createAgentLog({
      sessionId,
      agentName: "SanctionAgent",
      input: { customerId, customerName, loanAmount, emi },
      output: {
        status: "SUCCESS",
        sanctionReference,
        approvalDate,
        message: "Sanction package created successfully.",
      },
      durationMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error("SanctionAgent database error:", error.message);
  }

  return sanctionPackage;
};

module.exports = { generateSanctionPackage };
