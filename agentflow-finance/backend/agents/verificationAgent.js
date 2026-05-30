/**
 * Verification Agent — KYC Validator
 *
 * Responsibilities:
 * - Validate customer identity using CRM data
 * - Ensure customer exists and contains active contact details (phone, address)
 * - Persist execution logs for auditing
 */

const crmService = require("../services/crmService");
const logService = require("../services/logService");

/**
 * Verify customer records.
 * @param {string} customerId - Customer identifier (e.g., C001)
 * @param {string} [sessionId] - Conversation session ID for logging
 * @returns {Promise<Object>} Verification output
 */
const verifyCustomer = async (customerId, sessionId = "system") => {
  const startTime = Date.now();

  // 1. Fetch customer from CRM
  const customer = crmService.getCustomerById(customerId);

  let result;

  // 2. Validate details
  if (!customer) {
    result = {
      verified: false,
      reason: "Customer not found",
    };
  } else if (!customer.phone) {
    result = {
      verified: false,
      reason: "Phone missing in CRM",
    };
  } else if (!customer.address) {
    result = {
      verified: false,
      reason: "Address missing in CRM",
    };
  } else {
    result = {
      verified: true,
      customerData: customer,
    };
  }

  // 3. Create AgentLog in MongoDB Atlas
  await logService.createAgentLog({
    sessionId: sessionId,
    agentName: "VerificationAgent",
    input: { customerId },
    output: {
      status: result.verified ? "SUCCESS" : "FAILED",
      customerId: customerId,
      reason: result.reason || "Customer verification completed successfully.",
    },
    durationMs: Date.now() - startTime,
  });

  return result;
};

module.exports = { verifyCustomer };
