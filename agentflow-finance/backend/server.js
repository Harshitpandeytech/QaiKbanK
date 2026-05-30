const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ───
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// Serve generated sanction PDFs
app.use("/sanctions", express.static("sanctions"));

// ─── Request Logger (dev) ───
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ─── API Routes ───
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/customer", require("./routes/customerRoutes"));
app.use("/api/credit", require("./routes/creditRoutes"));
app.use("/api/offer", require("./routes/offerRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/application", require("./routes/applicationRoutes"));
app.use("/api/logs", require("./routes/logRoutes"));

// ─── Health Check ───
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "QaiKbanK Backend",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET  /api/customer/:id",
      "GET  /api/customer/phone/:phone",
      "GET  /api/credit/:id",
      "GET  /api/credit/profile/:id",
      "GET  /api/offer/:id",
      "POST /api/offer/emi",
      "POST /api/upload",
      "POST /api/application",
      "GET  /api/application/:id",
      "GET  /api/application",
      "GET  /api/logs",
      "POST /api/logs",
      "POST /api/chat/message",
    ],
  });
});

// ─── Error Handling ───
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ───
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🏦 QaiKbanK Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   CRM:    http://localhost:${PORT}/api/customer/C001`);
  console.log(`   Credit: http://localhost:${PORT}/api/credit/C001`);
  console.log(`   Offer:  http://localhost:${PORT}/api/offer/C001\n`);
});
