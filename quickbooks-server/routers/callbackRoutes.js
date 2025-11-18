const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// OAuth callback route (QuickBooks redirects here)
router.get("/callback", authController.handleCallback);

module.exports = router;
