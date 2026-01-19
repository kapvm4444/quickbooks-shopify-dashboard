const express = require("express");
const router = express.Router();
const appConfigController = require("../controllers/appConfigController");

// Get Global App Configuration
router.get("/", appConfigController.getAppConfig);

module.exports = router;
