/**
 * Underwriting Agent — Credit Evaluator
 *
 * Responsibilities:
 * - Evaluate loan eligibility using business rules
 * - Fetch credit score from Credit Bureau API
 * - Fetch pre-approved limit and interest rate from Offer Mart API
 * - Calculate monthly EMI using emiService
 * - Determine loan decision (APPROVED, REJECTED, SALARY_REQUIRED)
 * - Persist execution logs for auditing
 */

const creditService = require("../services/creditService");
const offerService = require("../services/offerService");
const emiService = require("../services/emiService");
const logService = require("../services/logService");

/**
 * Evaluate loan eligibility.
 *
 * Business Rules:
 *   Rule 1: Credit score < 700 → REJECT
 *   Rule 2: Requested amount <= pre-approved limit → APPROVE INSTANTLY
 *   Rule 3: Requested amount <= 2x pre-approved limit → REQUEST SALARY SLIP
 *           (Approved on re-run only if EMI <= 50% of monthly salary)
 *   Rule 4: Requested amount > 2x pre-approved limit → REJECT
 *
 * @param {string} customerId - Customer identifier (e.g., C001)
 * @param {number} loanAmount - Requested principal amount
 * @param {number} tenure - Loan tenure in months
 * @param {number} [monthlySalary] - Monthly salary (from CRM or OCR)
 * @param {string} [sessionId] - Conversation session ID for logging
 * @returns {Promise<Object>} Underwriting decision details
 */
const evaluateEligibility = async (
  customerId,
  loanAmount,
  tenure,
  monthlySalary = null,
  sessionId = "system"
) => {
  const startTime = Date.now();

  // 1. Fetch data from mock APIs
  const creditRecord = creditService.getCreditScore(customerId);
  const offerRecord = offerService.getOffer(customerId);

  if (!creditRecord || !offerRecord) {
    return {
      decision: "REJECTED",
      reason: "Could not retrieve credit score or pre-approved limit details.",
    };
  }

  const creditScore = creditRecord.creditScore;
  const preApprovedLimit = offerRecord.preApprovedLimit;
  const interestRate = offerRecord.interestRate;

  // 2. Calculate EMI using emiService
  const emi = emiService.calculateEMI(loanAmount, interestRate, tenure);

  let decision = "";
  let reason = "";

  // 3. Apply Underwriting Business Rules
  if (creditScore < 700) {
    // Rule 1: Credit Score too low
    decision = "REJECTED";
    reason = `Credit score of ${creditScore} is below the minimum eligibility threshold of 700.`;
  } else if (loanAmount <= preApprovedLimit) {
    // Rule 2: Within pre-approved limit
    decision = "APPROVED";
    reason = `Loan amount ₹${loanAmount.toLocaleString("en-IN")} is within your pre-approved limit of ₹${preApprovedLimit.toLocaleString("en-IN")}.`;
  } else if (loanAmount > 2 * preApprovedLimit) {
    // Rule 4: Exceeds 2x pre-approved limit
    decision = "REJECTED";
    reason = `Loan amount ₹${loanAmount.toLocaleString("en-IN")} exceeds twice your pre-approved limit of ₹${preApprovedLimit.toLocaleString("en-IN")}.`;
  } else {
    // Rule 3: Between preApprovedLimit and 2x preApprovedLimit (Requires salary verification)
    if (monthlySalary) {
      // Re-run evaluation using extracted salary
      const maxAllowedEmi = 0.5 * monthlySalary;
      if (emi <= maxAllowedEmi) {
        decision = "APPROVED";
        reason = `Loan amount ₹${loanAmount.toLocaleString("en-IN")} is within 2x pre-approved limit, and your EMI of ₹${emi.toLocaleString("en-IN")} is within the allowed 50% monthly income threshold (Salary: ₹${monthlySalary.toLocaleString("en-IN")}).`;
      } else {
        decision = "REJECTED";
        reason = `Your EMI of ₹${emi.toLocaleString("en-IN")} exceeds the allowed 50% monthly income threshold of ₹${maxAllowedEmi.toLocaleString("en-IN")} (Salary: ₹${monthlySalary.toLocaleString("en-IN")}).`;
      }
    } else {
      decision = "SALARY_REQUIRED";
      reason = `Loan amount ₹${loanAmount.toLocaleString("en-IN")} exceeds your pre-approved limit of ₹${preApprovedLimit.toLocaleString("en-IN")}, requiring salary slip upload for verification.`;
    }
  }

  const result = {
    decision,
    creditScore,
    preApprovedLimit,
    requestedAmount: loanAmount,
    interestRate,
    emi,
    reason,
  };

  // 4. Save audit log into MongoDB Atlas
  await logService.createAgentLog({
    sessionId: sessionId,
    agentName: "UnderwritingAgent",
    input: { customerId, loanAmount, tenure, monthlySalary },
    output: {
      status: decision,
      creditScore,
      preApprovedLimit,
      requestedAmount: loanAmount,
      emi,
      reason,
    },
    durationMs: Date.now() - startTime,
  });

  return result;
};

module.exports = { evaluateEligibility };
