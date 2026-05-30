/**
 * Credit Bureau Service
 *
 * Provides credit score lookup from the mock credit bureau dataset.
 * Used by the Underwriting Agent and credit routes.
 */

const creditScores = require("../mockData/creditScores.json");

/**
 * Get credit score by customerId.
 * @param {string} customerId - e.g. "C001"
 * @returns {object|null} Credit record or null
 */
const getCreditScore = (customerId) => {
  const record = creditScores.find((c) => c.customerId === customerId);
  return record || null;
};

/**
 * Get full credit profile with risk assessment.
 * @param {string} customerId
 * @returns {object|null} Credit profile with risk level
 */
const getCreditProfile = (customerId) => {
  const record = getCreditScore(customerId);
  if (!record) return null;

  let riskLevel = "high";
  if (record.creditScore >= 800) riskLevel = "very_low";
  else if (record.creditScore >= 750) riskLevel = "low";
  else if (record.creditScore >= 700) riskLevel = "medium";
  else if (record.creditScore >= 650) riskLevel = "high";
  else riskLevel = "very_high";

  return {
    customerId: record.customerId,
    creditScore: record.creditScore,
    riskLevel,
    scoreRange: "0-900",
    lastUpdated: new Date().toISOString(),
  };
};

module.exports = {
  getCreditScore,
  getCreditProfile,
};
