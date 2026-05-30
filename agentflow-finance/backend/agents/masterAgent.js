/**
 * Master Agent — Central Orchestrator
 *
 * Responsibilities:
 * - Initiates customer conversations
 * - Maintains conversation state across turns
 * - Routes tasks to the appropriate Worker Agent
 * - Coordinates the full workflow: Sales → Verification → Underwriting → Sanction
 * - Consolidates outputs from all agents
 * - Delivers final loan decisions with natural language responses
 */

const salesAgent = require("./salesAgent");
const verificationAgent = require("./verificationAgent");
const underwritingAgent = require("./underwritingAgent");
const crmService = require("../services/crmService");
const logService = require("../services/logService");
const Document = require("../models/Document");
const LoanApplication = require("../models/LoanApplication");
const sanctionAgent = require("./sanctionAgent");

/**
 * Processes an incoming user message, updates conversation state, and generates a reply.
 * @param {string} userMessage - Message from the user
 * @param {Object} session - Mongoose conversation session document
 * @returns {Promise<Object>} The processed response details
 */
const processMessage = async (userMessage, session) => {
  const startTime = Date.now();

  // 1. Append user's message to conversation history
  session.messages.push({
    role: "user",
    content: userMessage,
    timestamp: new Date(),
  });

  let reply = "";
  let agentUsed = "masterAgent";

  // Check if we are handling a salary slip upload in the upload stage
  const isUploadMessage = userMessage.toLowerCase().includes("[file uploaded]");

  if (session.currentStage === "SALARY_UPLOAD_REQUIRED" && isUploadMessage) {
    session.currentStage = "UNDERWRITING_REVIEW";
  }

  // ─── STAGE: SALES / GREETING ───
  const salesStages = [
    "WELCOME",
    "COLLECT_CUSTOMER_ID",
    "COLLECT_LOAN_AMOUNT",
    "COLLECT_LOAN_PURPOSE",
    "COLLECT_TENURE",
    "COLLECT_EMPLOYMENT",
  ];

  if (salesStages.includes(session.currentStage)) {
    // Invoke the Sales Agent to collect loan parameters
    const salesResult = await salesAgent.collectRequirements(
      session.messages,
      session.collectedData
    );

    reply = salesResult.reply;
    agentUsed = "salesAgent";

    // Merge extracted details
    if (salesResult.extractedData) {
      const ext = salesResult.extractedData;
      if (ext.loanAmount) session.collectedData.loanAmount = ext.loanAmount;
      if (ext.loanPurpose) session.collectedData.loanPurpose = ext.loanPurpose;
      if (ext.tenure) session.collectedData.tenure = ext.tenure;
      if (ext.employmentType) session.collectedData.employmentType = ext.employmentType;

      // Auto-identify profile upon customerId or 10-digit phone extraction
      if (ext.customerId && ext.customerId !== session.collectedData.customerId) {
        let customer = null;
        if (/^\d{10}$/.test(ext.customerId)) {
          customer = crmService.getCustomerByPhone(ext.customerId);
        } else {
          customer = crmService.getCustomerById(ext.customerId);
        }

        if (customer) {
          session.collectedData.customerId = customer.customerId;
          session.collectedData.customerName = customer.name;
          session.collectedData.monthlyIncome = customer.salary;
          session.collectedData.existingLoans = customer.existingLoans || [];
        } else {
          session.collectedData.customerId = ext.customerId;
        }
      }
    }

    // Determine if data gathering is complete
    const data = session.collectedData;
    const isCollected =
      data.customerId &&
      data.loanAmount &&
      data.loanPurpose &&
      data.tenure &&
      data.employmentType;

    if (isCollected) {
      session.currentStage = "SALES_COMPLETED";
    } else {
      // Keep in appropriate data collection sub-stage
      if (!data.customerId) session.currentStage = "COLLECT_CUSTOMER_ID";
      else if (!data.loanAmount) session.currentStage = "COLLECT_LOAN_AMOUNT";
      else if (!data.loanPurpose) session.currentStage = "COLLECT_LOAN_PURPOSE";
      else if (!data.tenure) session.currentStage = "COLLECT_TENURE";
      else if (!data.employmentType) session.currentStage = "COLLECT_EMPLOYMENT";
    }

    await logService.createAgentLog({
      sessionId: session.sessionId,
      agentName: "salesAgent",
      input: { messageCount: session.messages.length, collectedData: session.collectedData },
      output: salesResult,
      durationMs: Date.now() - startTime,
    });
  }

  // ─── AUTOMATIC TRIGGERS: SALES_COMPLETED → VERIFICATION → UNDERWRITING ───
  if (session.currentStage === "SALES_COMPLETED") {
    const customerId = session.collectedData.customerId;

    // 1. Trigger Verification Agent
    session.currentStage = "VERIFICATION";
    const verifyResult = await verificationAgent.verifyCustomer(customerId, session.sessionId);

    if (verifyResult.verified) {
      // 2. Trigger Underwriting Agent
      session.currentStage = "UNDERWRITING";
      agentUsed = "UnderwritingAgent";

      const loanAmount = session.collectedData.loanAmount;
      const tenure = session.collectedData.tenure;
      const monthlyIncome = session.collectedData.monthlyIncome; // Seeded from CRM lookup during Sales

      const underwritingResult = await underwritingAgent.evaluateEligibility(
        customerId,
        loanAmount,
        tenure,
        monthlyIncome,
        session.sessionId
      );

      // Handle Underwriting Output
      if (underwritingResult.decision === "APPROVED") {
        session.currentStage = "LOAN_COMPLETED";
        
        // Invoke Sanction Agent!
        const sanctionPackage = await sanctionAgent.generateSanctionPackage({
          customerId,
          customerName: session.collectedData.customerName,
          loanAmount,
          interestRate: underwritingResult.interestRate,
          tenure,
          emi: underwritingResult.emi,
          creditScore: underwritingResult.creditScore,
          monthlySalary: session.collectedData.monthlyIncome,
          existingLoans: session.collectedData.existingLoans,
          sessionId: session.sessionId
        });

        session.decisionDetails = {
          decision: "APPROVED",
          creditScore: underwritingResult.creditScore,
          preApprovedLimit: underwritingResult.preApprovedLimit,
          requestedAmount: loanAmount,
          interestRate: underwritingResult.interestRate,
          emi: underwritingResult.emi,
          reason: underwritingResult.reason,
          sanctionPackage,
        };

        const latestApp = await LoanApplication.findOne({ customerId }).sort({ createdAt: -1 });
        if (latestApp) session.loanApplicationId = latestApp._id;

        reply = `🎉 **Congratulations! Your Personal Loan is APPROVED and COMPLETED!**

We have prepared your professional **Personal Loan Sanction Letter (Ref: ${sanctionPackage.sanctionReference})**! You can view it directly on-screen in the sidebar.

Here are your approved loan details:
- **Reference Number:** ${sanctionPackage.sanctionReference}
- **Approved Amount:** ₹${loanAmount.toLocaleString("en-IN")}
- **Interest Rate:** ${underwritingResult.interestRate}% p.a.
- **Tenure:** ${tenure} months
- **Monthly EMI:** ₹${underwritingResult.emi.toLocaleString("en-IN")}
- **Credit Score:** ${underwritingResult.creditScore}

*Ducky's Note: ${underwritingResult.reason}*`;
      } 
      else if (underwritingResult.decision === "REJECTED") {
        session.currentStage = "DECISION_COMPLETE";

        session.decisionDetails = {
          decision: "REJECTED",
          creditScore: underwritingResult.creditScore,
          preApprovedLimit: underwritingResult.preApprovedLimit,
          requestedAmount: loanAmount,
          interestRate: underwritingResult.interestRate,
          emi: underwritingResult.emi,
          reason: underwritingResult.reason,
        };

        // Save rejected application to MongoDB
        const application = await LoanApplication.create({
          customerId,
          loanAmount,
          purpose: session.collectedData.loanPurpose,
          tenure,
          interestRate: underwritingResult.interestRate,
          emi: underwritingResult.emi,
          status: "REJECTED",
          creditScore: underwritingResult.creditScore,
          preApprovedLimit: underwritingResult.preApprovedLimit,
          reason: underwritingResult.reason,
        });

        session.loanApplicationId = application._id;

        reply = `❌ **Personal Loan Application Declined**

Thank you for your interest in QaiKbanK. Unfortunately, we cannot approve your loan application at this time.
- **Reason:** ${underwritingResult.reason}
- **Credit Score Checked:** ${underwritingResult.creditScore}

If you believe there has been an error or your situation improves, you are welcome to re-apply in the future.`;
      } 
      else if (underwritingResult.decision === "SALARY_REQUIRED") {
        session.currentStage = "SALARY_UPLOAD_REQUIRED";

        session.decisionDetails = {
          decision: "SALARY_REQUIRED",
          creditScore: underwritingResult.creditScore,
          preApprovedLimit: underwritingResult.preApprovedLimit,
          requestedAmount: loanAmount,
          interestRate: underwritingResult.interestRate,
          emi: underwritingResult.emi,
          reason: underwritingResult.reason,
        };
        
        reply = `📤 **Salary Verification Required**

Your requested amount of **₹${loanAmount.toLocaleString("en-IN")}** exceeds your pre-approved limit of **₹${underwritingResult.preApprovedLimit.toLocaleString("en-IN")}** (but is within our maximum eligibility margin). 

To proceed, **please upload your monthly salary slip** (PDF or image) using the attachment button below. Once uploaded, I will instantly run OCR to extract your salary and complete your evaluation!`;
      }
    } else {
      // Verification Failed
      session.currentStage = "DECISION_COMPLETE";

      session.decisionDetails = {
        decision: "REJECTED",
        creditScore: null,
        preApprovedLimit: null,
        requestedAmount: session.collectedData.loanAmount,
        emi: null,
        reason: `KYC verification failed: ${verifyResult.reason}`,
      };
      
      const application = await LoanApplication.create({
        customerId,
        loanAmount: session.collectedData.loanAmount,
        purpose: session.collectedData.loanPurpose,
        tenure: session.collectedData.tenure,
        status: "REJECTED",
        reason: `KYC verification failed: ${verifyResult.reason}`,
      });

      session.loanApplicationId = application._id;

      reply = `❌ **KYC Verification Failed**

We were unable to verify your identity against our CRM records.
- **Reason:** ${verifyResult.reason}

For security purposes, we cannot proceed with this loan application. Please contact customer support to resolve any profile discrepancies.`;
    }
  }

  // ─── STAGE: SALARY SLIP OCR VERIFICATION ───
  if (session.currentStage === "UNDERWRITING_REVIEW") {
    agentUsed = "UnderwritingAgent";
    const customerId = session.collectedData.customerId;
    const loanAmount = session.collectedData.loanAmount;
    const tenure = session.collectedData.tenure;

    // 1. Fetch the latest uploaded document containing OCR salary
    const latestDoc = await Document.findOne({ documentType: "salary_slip" }).sort({ createdAt: -1 });

    if (latestDoc && latestDoc.extractedData && latestDoc.extractedData.salary) {
      const extractedSalary = latestDoc.extractedData.salary;
      session.collectedData.monthlyIncome = extractedSalary;

      // 2. Re-run underwriting evaluation with the OCR salary!
      const underwritingResult = await underwritingAgent.evaluateEligibility(
        customerId,
        loanAmount,
        tenure,
        extractedSalary,
        session.sessionId
      );

      session.currentStage = "DECISION_COMPLETE";

      session.decisionDetails = {
        decision: underwritingResult.decision,
        creditScore: underwritingResult.creditScore,
        preApprovedLimit: underwritingResult.preApprovedLimit,
        requestedAmount: loanAmount,
        interestRate: underwritingResult.interestRate,
        emi: underwritingResult.emi,
        reason: underwritingResult.reason,
      };

      // 3. Save the final application to MongoDB
      const application = await LoanApplication.create({
        customerId,
        loanAmount,
        purpose: session.collectedData.loanPurpose,
        tenure,
        interestRate: underwritingResult.interestRate,
        emi: underwritingResult.emi,
        status: underwritingResult.decision === "APPROVED" ? "APPROVED" : "REJECTED",
        creditScore: underwritingResult.creditScore,
        preApprovedLimit: underwritingResult.preApprovedLimit,
        reason: underwritingResult.reason,
      });

      session.loanApplicationId = application._id;

      if (underwritingResult.decision === "APPROVED") {
        session.currentStage = "LOAN_COMPLETED";

        // Invoke Sanction Agent!
        const sanctionPackage = await sanctionAgent.generateSanctionPackage({
          customerId,
          customerName: session.collectedData.customerName,
          loanAmount,
          interestRate: underwritingResult.interestRate,
          tenure,
          emi: underwritingResult.emi,
          creditScore: underwritingResult.creditScore,
          monthlySalary: extractedSalary,
          existingLoans: session.collectedData.existingLoans,
          sessionId: session.sessionId
        });

        session.decisionDetails = {
          decision: "APPROVED",
          creditScore: underwritingResult.creditScore,
          preApprovedLimit: underwritingResult.preApprovedLimit,
          requestedAmount: loanAmount,
          interestRate: underwritingResult.interestRate,
          emi: underwritingResult.emi,
          reason: underwritingResult.reason,
          sanctionPackage,
        };

        const latestApp = await LoanApplication.findOne({ customerId }).sort({ createdAt: -1 });
        if (latestApp) session.loanApplicationId = latestApp._id;

        reply = `🎉 **Salary Verified! Your Loan is APPROVED and COMPLETED!**

We scanned your payslip and verified a monthly income of **₹${extractedSalary.toLocaleString("en-IN")}**.

We have prepared your professional **Personal Loan Sanction Letter (Ref: ${sanctionPackage.sanctionReference})**! You can view it directly on-screen in the sidebar.

Here are your approved loan details:
- **Reference Number:** ${sanctionPackage.sanctionReference}
- **Extracted Salary:** ₹${extractedSalary.toLocaleString("en-IN")}
- **Monthly EMI:** ₹${underwritingResult.emi.toLocaleString("en-IN")} (Only **${Math.round((underwritingResult.emi / extractedSalary) * 100)}%** of your monthly income, which is well within the 50% limit!)
- **Interest Rate:** ${underwritingResult.interestRate}% p.a.
- **Tenure:** ${tenure} months
- **Reason:** ${underwritingResult.reason}`;
      } else {
        reply = `❌ **Loan Declined After Salary Review**

We scanned your payslip and verified a monthly income of **₹${extractedSalary.toLocaleString("en-IN")}**.

Unfortunately, your application was declined:
- **Monthly EMI:** ₹${underwritingResult.emi.toLocaleString("en-IN")}
- **Max EMI Allowed (50% of Income):** ₹${(extractedSalary * 0.5).toLocaleString("en-IN")}
- **Reason:** ${underwritingResult.reason}`;
      }
    } else {
      // Document lookup failed or OCR data missing
      session.currentStage = "SALARY_UPLOAD_REQUIRED";
      reply = `⚠️ I received your upload notification, but I was unable to parse your salary slip. Please make sure the uploaded image is clear and try uploading again.`;
    }
  }

  // 3. Append Agent's response to history
  session.messages.push({
    role: "model",
    content: reply,
    agentName: agentUsed,
    timestamp: new Date(),
  });

  // 4. Save updated session to MongoDB Atlas
  await session.save();

  return {
    reply,
    stage: session.currentStage,
    agentUsed,
    collectedData: session.collectedData,
    decisionDetails: session.decisionDetails,
  };
};

module.exports = { processMessage };
