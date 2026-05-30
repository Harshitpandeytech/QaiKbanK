/**
 * EMI Calculator Service
 *
 * Calculates monthly EMI based on loan amount, interest rate, and tenure in months.
 */

/**
 * Calculate EMI using standard formula:
 * EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 *
 * @param {number} loanAmount - Principal amount
 * @param {number} interestRate - Annual interest rate (e.g., 11.5 for 11.5%)
 * @param {number} tenure - Tenure in months
 * @returns {number} Monthly EMI rounded to the nearest integer
 */
const calculateEMI = (loanAmount, interestRate, tenure) => {
  if (loanAmount <= 0 || interestRate <= 0 || tenure <= 0) return 0;

  const monthlyRate = interestRate / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenure);
  const emi = (loanAmount * monthlyRate * factor) / (factor - 1);

  return Math.round(emi);
};

module.exports = { calculateEMI };
