const oauthClient = require("../config/oauthClient");

class TokenManager {
  /**
   * Refresh the access token using the refresh token
   * @param {object} tokens - Current tokens object with refresh_token
   * @returns {Promise<object>} - New tokens
   */
  static async refreshAccessToken(tokens) {
    try {
      console.log("🔄 Refreshing access token...");

      // Set the current tokens in the client
      oauthClient.setToken({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        realmId: tokens.realmId,
      });

      // Request new tokens using refresh token
      const authResponse = await oauthClient.refresh();

      const newTokens = {
        access_token: authResponse.token.access_token,
        refresh_token: authResponse.token.refresh_token,
        realmId: tokens.realmId,
      };

      console.log("✅ Token refreshed successfully");
      return newTokens;
    } catch (error) {
      console.error("❌ Error refreshing token:", error);
      throw error;
    }
  }

  /**
   * Make API call with automatic token refresh on 401
   * @param {string} url - API endpoint URL
   * @param {object} tokens - Current tokens
   * @returns {Promise<object>} - API response
   */
  static async makeApiCallWithRefresh(url, tokens) {
    try {
      oauthClient.setToken({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        realmId: tokens.realmId,
      });

      return await oauthClient.makeApiCall({ url });
    } catch (error) {
      // If token expired, try refreshing
      if (error.authResponse && error.authResponse.status === 401) {
        const newTokens = await this.refreshAccessToken(tokens);

        // Update the client with new tokens
        oauthClient.setToken({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          realmId: newTokens.realmId,
        });

        // Retry the API call
        return await oauthClient.makeApiCall({ url });
      }

      // For other errors, re-throw
      throw error;
    }
  }

  /**
   * Get QuickBooks API base URL
   * @param {string} realmId - Company ID
   * @returns {string} - Base URL
   */
  static getQboBaseUrl(realmId) {
    const subdomain = process.env.ENVIRONMENT === "sandbox" ? "sandbox-" : "";
    return `https://${subdomain}quickbooks.api.intuit.com/v3/company/${realmId}`;
  }
}

module.exports = TokenManager;
