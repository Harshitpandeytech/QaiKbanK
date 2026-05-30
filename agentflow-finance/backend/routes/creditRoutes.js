const express = require("express");
const router = express.Router();
const creditService = require("../services/creditService");

/**
 * Credit Bureau Routes (Mock API)
 *
 * GET /api/credit/:id — Returns credit score for a customer
 * GET /api/credit/profile/:id — Returns full credit profile with risk level
 */

// GET /api/credit/:id
router.get("/:id", (req, res) => {
  const record = creditService.getCreditScore(req.params.id);
  if (!record) {
    return res.status(404).json({
      success: false,
      message: `Credit record for ${req.params.id} not found`,
    });
  }
  res.json({ success: true, data: record });
});

// GET /api/credit/profile/:id
router.get("/profile/:id", (req, res) => {
  const profile = creditService.getCreditProfile(req.params.id);
  if (!profile) {
    return res.status(404).json({
      success: false,
      message: `Credit profile for ${req.params.id} not found`,
    });
  }
  res.json({ success: true, data: profile });
});

module.exports = router;
