const { getTokens } = require("../utils/tokenStorage");

/**
 * Middleware to check if user is authenticated with QuickBooks
 * Just checks if tokens exist in memory - super simple!
 */
const requireAuth = (req, res, next) => {
  const tokens = getTokens();

  if (
    !tokens ||
    !tokens.access_token ||
    !tokens.refresh_token ||
    !tokens.realmId
  ) {
    return res.status(401).json({
      error: "Not authenticated",
      message: "Please connect to QuickBooks first",
    });
  }

  // Attach tokens to request object for use in controllers
  req.qbTokens = tokens;

  next();
};

/**
 * Middleware to update tokens in memory after refresh
 */
const updateTokensInMemory = (tokens) => {
  const { setTokens } = require("../utils/tokenStorage");
  setTokens(tokens);
};

module.exports = {
  requireAuth,
  updateTokensInMemory,
};
