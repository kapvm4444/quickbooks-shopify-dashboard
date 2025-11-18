/**
 * In-memory token storage (simple variable)
 * This will reset when server restarts
 */
let quickbooksTokens = null;

/**
 * Store tokens in memory
 */
const setTokens = (tokens) => {
  quickbooksTokens = tokens;
};

/**
 * Get tokens from memory
 */
const getTokens = () => {
  return quickbooksTokens;
};

/**
 * Check if tokens exist
 */
const hasTokens = () => {
  return !!(quickbooksTokens && quickbooksTokens.access_token);
};

/**
 * Clear tokens
 */
const clearTokens = () => {
  quickbooksTokens = null;
};

module.exports = {
  setTokens,
  getTokens,
  hasTokens,
  clearTokens,
};
