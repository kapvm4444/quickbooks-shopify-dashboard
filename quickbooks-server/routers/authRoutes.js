const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Get QuickBooks authorization URL
router.get("/url", authController.getAuthUrl);

// Check authentication status
router.get("/status", authController.getAuthStatus);

// Disconnect/logout
router.post("/disconnect", authController.disconnect);

module.exports = router;
