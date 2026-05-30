const express = require("express");
const router = express.Router();
const offerService = require("../services/offerService");

/**
 * Offer Mart Routes (Mock API)
 *
 * GET /api/offer/:id    — Returns pre-approved offer for a customer
 * GET /api/offer        — Returns all offers
 * POST /api/offer/emi   — Calculate EMI for given parameters
 */

// GET /api/offer — List all offers
router.get("/", (req, res) => {
  const offers = offerService.getAllOffers();
  res.json({
    success: true,
    count: offers.length,
    data: offers,
  });
});

// POST /api/offer/emi — Calculate EMI
router.post("/emi", (req, res) => {
  const { principal, annualRate, tenureMonths } = req.body;

  if (!principal || !annualRate || !tenureMonths) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: principal, annualRate, tenureMonths",
    });
  }

  const emi = offerService.calculateEMI(principal, annualRate, tenureMonths);

  res.json({
    success: true,
    data: {
      principal,
      annualRate,
      tenureMonths,
      monthlyEMI: emi,
      totalPayment: emi * tenureMonths,
      totalInterest: emi * tenureMonths - principal,
    },
  });
});

// GET /api/offer/:id
router.get("/:id", (req, res) => {
  const offer = offerService.getOffer(req.params.id);
  if (!offer) {
    return res.status(404).json({
      success: false,
      message: `Offer for ${req.params.id} not found`,
    });
  }
  res.json({ success: true, data: offer });
});

module.exports = router;
