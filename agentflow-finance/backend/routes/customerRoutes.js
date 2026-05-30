const express = require("express");
const router = express.Router();
const crmService = require("../services/crmService");

/**
 * Customer Routes (Mock CRM API)
 *
 * GET /api/customer/:id          — Lookup customer by customerId
 * GET /api/customer/phone/:phone — Search by phone number
 * GET /api/customer              — List all customers
 */

// GET /api/customer — List all customers
router.get("/", (req, res) => {
  const customers = crmService.getAllCustomers();
  res.json({
    success: true,
    count: customers.length,
    data: customers,
  });
});

// GET /api/customer/phone/:phone — must be before /:id to avoid conflict
router.get("/phone/:phone", (req, res) => {
  const customer = crmService.getCustomerByPhone(req.params.phone);
  if (!customer) {
    return res.status(404).json({
      success: false,
      message: `Customer with phone ${req.params.phone} not found`,
    });
  }
  res.json({ success: true, data: customer });
});

// GET /api/customer/:id
router.get("/:id", (req, res) => {
  const customer = crmService.getCustomerById(req.params.id);
  if (!customer) {
    return res.status(404).json({
      success: false,
      message: `Customer ${req.params.id} not found`,
    });
  }
  res.json({ success: true, data: customer });
});

module.exports = router;
