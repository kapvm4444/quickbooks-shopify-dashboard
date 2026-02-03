require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import routes
const authRoutes = require("./routers/authRoutes");
const quickbooksRoutes = require("./routers/quickbooksRoutes");
const callbackRoutes = require("./routers/callbackRoutes");
const shopifyRoutes = require("./routers/shopifyRoutes");
const appConfigRoutes = require("./routers/appConfigRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // Your React app URL
  }),
);

// Parse JSON bodies
app.use(express.json());

// ============================================
// ROUTES
// ============================================
// App Configuration (Firebase + Supabase)
app.use("/api/config", appConfigRoutes);

// Authentication routes
app.use("/api/auth", authRoutes);

// QuickBooks data routes (protected by auth middleware)
app.use("/api", quickbooksRoutes);
app.use("/api/shopify", shopifyRoutes);

// OAuth callback route (special route, not under /api)
app.use("/", callbackRoutes);

// ============================================
// HEALTH CHECK
// ============================================

app.get("/", (req, res) => {
  res.status(403).end("Server is running and you do not have access to it");
});

// ============================================
// ERROR HANDLERS
// ============================================

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: "404 Not Found",
    message: "The requested resource was not found on this server.",
    path: req.path,
  });
});

// Generic error handler (must have 4 args)
app.use((err, req, res, next) => {
  console.error("💥 Unhandled error:", err.stack);
  res.status(500).json({
    error: "500 Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log(`🚀 QuickBooks API Server`);
  console.log("=".repeat(60));
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || "Not configured"}`);
  console.log(`🔧 Environment: ${process.env.ENVIRONMENT || "sandbox"}`);
  console.log("=".repeat(60));
});

/*

===========================================
  (`📝 Available Endpoints:
  (`   GET  /api/auth/url          - Get QuickBooks auth URL
  (`   GET  /api/auth/status       - Check connection status
  (`   POST /api/auth/disconnect   - Disconnect from QuickBooks
  (`   GET  /api/invoices          - Get invoices
  (`   GET  /api/customers         - Get customers
  (`   GET  /api/salesreceipts     - Get sales receipts
  (`   GET  /api/accounts          - Get accounts
  (`   GET  /api/bills             - Get bills
  (`   GET  /api/purchases         - Get purchases
  (`   GET  /api/items             - Get items
  (`   GET  /api/billpayments      - Get bill payments
  (`   GET  /api/company-info      - Get company info
===========================================

*/
