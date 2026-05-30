/**
 * Sanction Reference Service
 *
 * Generates unique sanction references for approved loan applications.
 * Pattern: QBK-2026-000001, QBK-2026-000002, etc.
 */

const LoanApplication = require("../models/LoanApplication");

/**
 * Generate a unique sanction reference based on the current application counts.
 * @returns {Promise<string>} Unique reference code
 */
const generateReference = async () => {
  try {
    const count = await LoanApplication.countDocuments({ sanctionReference: { $ne: null } });
    const sequenceNumber = String(count + 1).padStart(6, "0");
    return `QBK-2026-${sequenceNumber}`;
  } catch (error) {
    console.error("Failed to generate reference code, falling back to random:", error.message);
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `QBK-2026-${rand}`;
  }
};

module.exports = { generateReference };
