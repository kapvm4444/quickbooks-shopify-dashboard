const express = require("express");
const router = express.Router();
const quickbooksController = require("../controllers/quickbooksController");
const { requireAuth } = require("../middlewares/auth");

// Apply authentication middleware to all routes
router.use(requireAuth);

// QuickBooks data endpoints
router.get("/invoices", quickbooksController.getInvoices);
router.get("/customers", quickbooksController.getCustomers);
router.get("/salesreceipts", quickbooksController.getSalesReceipts);
router.get("/accounts", quickbooksController.getAccounts);
router.get("/bills", quickbooksController.getBills);
router.get("/purchases", quickbooksController.getPurchases);
router.get("/items", quickbooksController.getItems);
router.get("/billpayments", quickbooksController.getBillPayments);
router.get("/company-info", quickbooksController.getCompanyInfo);

module.exports = router;
