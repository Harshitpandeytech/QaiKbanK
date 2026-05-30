/**
 * Offer Mart Service
 *
 * Provides pre-approved loan offers and EMI calculation.
 * Used by the Sales Agent, Underwriting Agent, and offer routes.
 */

const offers = require("../mockData/offers.json");

/**
 * Get pre-approved offer by customerId.
 * @param {string} customerId - e.g. "C001"
 * @returns {object|null} Offer record or null
 */
const getOffer = (customerId) => {
  const offer = offers.find((c) => c.customerId === customerId);
  return offer || null;
};

/**
 * Calculate monthly EMI using the standard reducing balance formula.
 *
 * EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 *
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (e.g. 11.5)
 * @param {number} tenureMonths - Loan tenure in months
 * @returns {number} Monthly EMI rounded to nearest integer
 */
const calculateEMI = (principal, annualRate, tenureMonths) => {
  if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) return 0;

  const monthlyRate = annualRate / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);

  return Math.round(emi);
};

/**
 * Get all available offers.
 * @returns {Array} All offer records
 */
const getAllOffers = () => {
  return offers;
};

module.exports = {
  getOffer,
  calculateEMI,
  getAllOffers,
};
