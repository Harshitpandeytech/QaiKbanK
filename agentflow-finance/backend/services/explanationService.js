/**
 * Explainability Engine
 *
 * Evaluates underwriting inputs and customer CRM profiles to produce tailored,
 * clear, and structured lending positive insights and risk factors.
 */

/**
 * Generate dynamic loan decision insights (positives and risks).
 * @param {Object} params - Input parameters
 * @param {number} params.creditScore - Customer credit score
 * @param {number} params.loanAmount - Requested loan amount
 * @param {number} params.preApprovedLimit - Customer's pre-approved limit
 * @param {number} params.emi - Monthly EMI value
 * @param {number} [params.monthlySalary] - Verified monthly income
 * @param {Array<string>} [params.existingLoans] - Array of existing loans
 * @returns {Object} Explanation positives and risk factors
 */
const generateExplanation = ({
  creditScore,
  loanAmount,
  preApprovedLimit,
  emi,
  monthlySalary = null,
  existingLoans = [],
}) => {
  const positives = [];
  const riskFactors = [];

  // 1. Credit Score Evaluation
  if (creditScore >= 800) {
    positives.push(`Exceptional credit score of ${creditScore}, reflecting a pristine repayment history.`);
  } else if (creditScore >= 750) {
    positives.push(`Excellent credit score of ${creditScore}, exceeding the 700 threshold.`);
  } else if (creditScore >= 700) {
    positives.push(`Good credit score of ${creditScore}, above our eligibility criteria.`);
  } else {
    riskFactors.push(`Credit score of ${creditScore} represents elevated credit utilization.`);
  }

  // 2. Loan Amount vs Pre-Approved Limit
  if (loanAmount <= preApprovedLimit) {
    positives.push(`Requested loan amount of ₹${loanAmount.toLocaleString("en-IN")} is within your pre-approved limit of ₹${preApprovedLimit.toLocaleString("en-IN")}.`);
  } else if (loanAmount <= 2 * preApprovedLimit) {
    positives.push(`Requested amount is within our 2x pre-approved boundary allowance.`);
    riskFactors.push(`Loan amount exceeds pre-approved limit by ₹${(loanAmount - preApprovedLimit).toLocaleString("en-IN")}.`);
  }

  // 3. EMI-to-Income Burden
  if (monthlySalary) {
    const emiPercentage = Math.round((emi / monthlySalary) * 100);
    if (emiPercentage <= 30) {
      positives.push(`Low debt-to-income ratio (EMI is only ${emiPercentage}% of monthly take-home income).`);
    } else if (emiPercentage <= 50) {
      positives.push(`Monthly EMI burden (${emiPercentage}%) is within our standard 50% safety cap.`);
    } else {
      riskFactors.push(`High EMI-to-income burden (${emiPercentage}% of take-home income).`);
    }
  } else {
    positives.push("Instant approval path utilized without require of document proofing.");
  }

  // 4. CRM Existing Debt Obligations check
  if (existingLoans && existingLoans.length > 0) {
    const activeObligations = existingLoans.join(", ");
    riskFactors.push(`Existing debt portfolio detected: ${activeObligations}.`);
  } else {
    positives.push("Zero prior outstanding NBFC personal loans detected.");
  }

  // Fallback reassure
  if (riskFactors.length === 0) {
    positives.push("No credit breaches, payment defaults, or warnings reported.");
  }

  return {
    positives,
    riskFactors,
  };
};

module.exports = { generateExplanation };
