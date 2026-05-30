const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const Document = require("../models/Document");

/**
 * Upload Routes
 *
 * POST /api/upload       — Upload a salary slip (PDF or image)
 * GET  /api/upload       — List all uploaded documents
 * GET  /api/upload/:id   — Get upload details
 */

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP and PDF files are allowed"), false);
    }
  },
});

const ocrService = require("../services/ocrService");

// POST /api/upload — Upload salary slip
router.post("/", upload.single("salarySlip"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Use field name 'salarySlip'.",
      });
    }

    // Run OCR salary extraction
    const ocrResult = await ocrService.extractSalary(req.file.path);

    // Save document record to MongoDB
    const doc = await Document.create({
      userId: req.body.userId || null,
      documentType: "salary_slip",
      filePath: `/uploads/${req.file.filename}`,
      extractedData: {
        salary: ocrResult.salary,
        rawText: ocrResult.text,
      },
      verificationStatus: ocrResult.success ? "verified" : "failed",
    });

    res.status(201).json({
      success: true,
      message: "File uploaded and OCR processed successfully.",
      documentId: doc._id,
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      verificationStatus: doc.verificationStatus,
      extractedSalary: ocrResult.salary,
      uploadedAt: doc.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/upload — List all documents
router.get("/", async (req, res, next) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/upload/:id — Get document by ID
router.get("/:id", async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id).lean();
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `Document ${req.params.id} not found`,
      });
    }
    res.json({ success: true, data: doc });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID format",
      });
    }
    next(error);
  }
});

// Multer error handling
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  if (error.message && error.message.includes("Only JPEG")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  next(error);
});

module.exports = router;
