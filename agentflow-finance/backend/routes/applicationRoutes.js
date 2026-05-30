const express = require("express");
const router = express.Router();
const LoanApplication = require("../models/LoanApplication");
const crmService = require("../services/crmService");
const creditService = require("../services/creditService");
const offerService = require("../services/offerService");
const logService = require("../services/logService");

/**
 * Loan Application Routes
 *
 * POST /api/application          — Create new loan application
 * GET  /api/application          — List all applications
 * GET  /api/application/:id      — Get application by ID
 * PUT  /api/application/:id      — Update application status
 */

// POST /api/application — Create new loan application
router.post("/", async (req, res, next) => {
  try {
    const { customerId, loanAmount, tenure, purpose, userId } = req.body;

    // Validate required fields
    if (!customerId || !loanAmount || !tenure) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: customerId, loanAmount, tenure",
      });
    }

    // Validate customer exists
    const customer = crmService.getCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer ${customerId} not found in CRM`,
      });
    }

    // Fetch credit score and offer for reference
    const creditRecord = creditService.getCreditScore(customerId);
    const offerRecord = offerService.getOffer(customerId);

    // Create application
    const application = await LoanApplication.create({
      userId: userId || null,
      customerId,
      loanAmount,
      tenure,
      purpose: purpose || "",
      status: "PENDING",
      creditScore: creditRecord ? creditRecord.creditScore : null,
      preApprovedLimit: offerRecord ? offerRecord.preApprovedLimit : null,
      interestRate: offerRecord ? offerRecord.interestRate : null,
    });

    // Log the creation
    await logService.createAgentLog({
      sessionId: null,
      agentName: "system",
      input: { customerId, loanAmount, tenure, purpose },
      output: { applicationId: application._id, status: application.status },
    });

    res.status(201).json({
      success: true,
      data: {
        applicationId: application._id,
        customerId: application.customerId,
        loanAmount: application.loanAmount,
        tenure: application.tenure,
        status: application.status,
        creditScore: application.creditScore,
        preApprovedLimit: application.preApprovedLimit,
        interestRate: application.interestRate,
        createdAt: application.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/application — List all applications
router.get("/", async (req, res, next) => {
  try {
    const applications = await LoanApplication.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/application/:id/sanction — Fetch sanction details for on-screen letter display
router.get("/:id/sanction", async (req, res, next) => {
  try {
    const application = await LoanApplication.findById(req.params.id).lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Application ${req.params.id} not found`,
      });
    }

    if (application.status !== "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "No sanction letter is available for unapproved applications.",
      });
    }

    // Lookup customer from CRM to resolve name
    const customer = crmService.getCustomerById(application.customerId);
    const customerName = customer ? customer.name : "Valued Customer";

    res.json({
      success: true,
      sanctionReference: application.sanctionReference,
      customerName,
      approvedAmount: application.approvedAmount || application.loanAmount,
      interestRate: application.interestRate,
      tenure: application.tenure,
      emi: application.emi,
      approvalDate: application.approvalDate || application.updatedAt,
      explanation: application.explanation || { positives: [], riskFactors: [] },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format",
      });
    }
    next(error);
  }
});

// GET /api/application/:id — Get single application
router.get("/:id", async (req, res, next) => {
  try {
    const application = await LoanApplication.findById(req.params.id).lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Application ${req.params.id} not found`,
      });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format",
      });
    }
    next(error);
  }
});

// PUT /api/application/:id — Update application (status, emi, etc.)
router.put("/:id", async (req, res, next) => {
  try {
    const updates = req.body;
    const application = await LoanApplication.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Application ${req.params.id} not found`,
      });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format",
      });
    }
    next(error);
  }
});

module.exports = router;
