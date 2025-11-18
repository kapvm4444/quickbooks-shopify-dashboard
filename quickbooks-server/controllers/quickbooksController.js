const TokenManager = require("../utils/tokenManager");
const { updateTokensInMemory } = require("../middlewares/auth");

/**
 * Generic function to query QuickBooks entities
 */
const queryEntity = async (req, res, entityName, entityKey) => {
  try {
    const tokens = req.qbTokens;
    const query = `SELECT * FROM ${entityName} MAXRESULTS 100`;
    const url = `${TokenManager.getQboBaseUrl(tokens.realmId)}/query?query=${encodeURIComponent(
      query,
    )}&minorversion=75`;

    const response = await TokenManager.makeApiCallWithRefresh(url, tokens);

    // If tokens were refreshed, update memory
    if (response.token) {
      const newTokens = {
        access_token: response.token.access_token,
        refresh_token: response.token.refresh_token,
        realmId: tokens.realmId,
      };
      updateTokensInMemory(newTokens);
    }

    const data = response.json.QueryResponse[entityKey] || [];
    res.json(data);
  } catch (error) {
    console.error(
      `❌ Error fetching ${entityName}:`,
      error.originalMessage || error.message,
    );
    res.status(500).json({
      error: `Failed to fetch ${entityName}`,
      message: error.message,
    });
  }
};

/**
 * Get invoices
 */
const getInvoices = async (req, res) => {
  await queryEntity(req, res, "Invoice", "Invoice");
};

/**
 * Get customers
 */
const getCustomers = async (req, res) => {
  await queryEntity(req, res, "Customer", "Customer");
};

/**
 * Get sales receipts
 */
const getSalesReceipts = async (req, res) => {
  await queryEntity(req, res, "SalesReceipt", "SalesReceipt");
};

/**
 * Get accounts
 */
const getAccounts = async (req, res) => {
  await queryEntity(req, res, "Account", "Account");
};

/**
 * Get bills
 */
const getBills = async (req, res) => {
  await queryEntity(req, res, "Bill", "Bill");
};

/**
 * Get purchases
 */
const getPurchases = async (req, res) => {
  await queryEntity(req, res, "Purchase", "Purchase");
};

/**
 * Get items
 */
const getItems = async (req, res) => {
  await queryEntity(req, res, "Item", "Item");
};

/**
 * Get bill payments
 */
const getBillPayments = async (req, res) => {
  await queryEntity(req, res, "BillPayment", "BillPayment");
};

/**
 * Get company info
 */
const getCompanyInfo = async (req, res) => {
  try {
    const tokens = req.qbTokens;
    const url = `${TokenManager.getQboBaseUrl(tokens.realmId)}/companyinfo/${tokens.realmId}?minorversion=65`;

    const response = await TokenManager.makeApiCallWithRefresh(url, tokens);

    // If tokens were refreshed, update memory
    if (response.token) {
      const newTokens = {
        access_token: response.token.access_token,
        refresh_token: response.token.refresh_token,
        realmId: tokens.realmId,
      };
      updateTokensInMemory(newTokens);
    }

    res.json(response.json.CompanyInfo);
  } catch (error) {
    console.error(
      "❌ Error fetching company info:",
      error.originalMessage || error.message,
    );
    res.status(500).json({
      error: "Failed to fetch company info",
      message: error.message,
    });
  }
};

module.exports = {
  getInvoices,
  getCustomers,
  getSalesReceipts,
  getAccounts,
  getBills,
  getPurchases,
  getItems,
  getBillPayments,
  getCompanyInfo,
};
