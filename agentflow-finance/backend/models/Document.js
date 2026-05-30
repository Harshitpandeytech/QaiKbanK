const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    documentType: {
      type: String, // "salary_slip", "pan_card", "aadhaar", etc.
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    extractedData: {
      type: mongoose.Schema.Types.Mixed, // OCR output / parsed data
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
