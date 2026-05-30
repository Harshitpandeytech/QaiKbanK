/**
 * CRM Service
 *
 * Provides customer lookup from the mock CRM dataset.
 * Used by the Verification Agent and customer routes.
 */

const customers = require("../mockData/customers.json");

/**
 * Get customer by customerId.
 * @param {string} customerId - e.g. "C001"
 * @returns {object|null} Customer record or null
 */
const getCustomerById = (customerId) => {
  const customer = customers.find((c) => c.customerId === customerId);
  return customer || null;
};

/**
 * Get customer by phone number.
 * @param {string} phone - e.g. "9876543210"
 * @returns {object|null} Customer record or null
 */
const getCustomerByPhone = (phone) => {
  const customer = customers.find((c) => c.phone === phone);
  return customer || null;
};

/**
 * Verify customer details against CRM records.
 * @param {string} name
 * @param {string} phone
 * @param {string} address
 * @returns {object} Verification result
 */
const verifyCustomer = (name, phone, address) => {
  const customer = getCustomerByPhone(phone);

  if (!customer) {
    return {
      verified: false,
      customerId: null,
      matchDetails: {},
      mismatches: ["Customer not found in CRM"],
    };
  }

  const mismatches = [];
  const matchDetails = {};

  // Name check (case-insensitive)
  if (customer.name.toLowerCase() === name.toLowerCase()) {
    matchDetails.name = true;
  } else {
    matchDetails.name = false;
    mismatches.push(`Name mismatch: expected "${customer.name}", got "${name}"`);
  }

  // Phone check
  matchDetails.phone = true; // Already matched by lookup

  // Address check (partial match)
  if (address && customer.address.toLowerCase().includes(address.toLowerCase())) {
    matchDetails.address = true;
  } else if (address) {
    matchDetails.address = false;
    mismatches.push(`Address mismatch: expected "${customer.address}", got "${address}"`);
  }

  return {
    verified: mismatches.length === 0,
    customerId: customer.customerId,
    customerName: customer.name,
    matchDetails,
    mismatches,
  };
};

/**
 * Get all customers.
 * @returns {Array} All customer records
 */
const getAllCustomers = () => {
  return customers;
};

module.exports = {
  getCustomerById,
  getCustomerByPhone,
  verifyCustomer,
  getAllCustomers,
};
