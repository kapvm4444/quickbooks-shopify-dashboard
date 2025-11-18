const OAuthClient = require("intuit-oauth");
const oauthClient = require("../config/oauthClient");
const {
  setTokens,
  getTokens,
  hasTokens,
  clearTokens,
} = require("../utils/tokenStorage");

/**
 * Get QuickBooks authorization URL
 */
const getAuthUrl = (req, res) => {
  try {
    const authUri = oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting],
      state: "secureRandomState123",
    });

    res.json({ authUrl: authUri });
  } catch (error) {
    console.error("❌ Error generating auth URL:", error);
    res.status(500).json({ error: "Failed to generate auth URL" });
  }
};

/**
 * Handle OAuth callback from QuickBooks
 */
const handleCallback = async (req, res) => {
  try {
    const authCode = req.query.code;
    const realmId = req.query.realmId;

    if (!authCode) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=no_auth_code`);
    }

    // Exchange authorization code for tokens
    const authResponse = await oauthClient.createToken(req.url);

    const tokens = {
      access_token: authResponse.token.access_token,
      refresh_token: authResponse.token.refresh_token,
      realmId: realmId,
    };

    // Store tokens in memory (server-side variable)
    setTokens(tokens);

    console.log("✅ Connected to QuickBooks successfully");

    // Serve an HTML page that will redirect
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Connecting to QuickBooks...</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 40px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 20px;
              backdrop-filter: blur(10px);
              box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            }
            .spinner {
              border: 4px solid rgba(255, 255, 255, 0.3);
              border-top: 4px solid white;
              border-radius: 50%;
              width: 50px;
              height: 50px;
              animation: spin 1s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            h1 { margin: 0 0 20px 0; font-size: 24px; }
            p { margin: 10px 0; opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Connected Successfully!</h1>
            <div class="spinner"></div>
            <p>Redirecting you back to the application...</p>
          </div>
          <script>
            setTimeout(() => {
              window.location.href = '${process.env.FRONTEND_URL}?connected=true';
            }, 1500);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Error during OAuth callback:", error);
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Connection Failed</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 40px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Connection Failed</h1>
            <p>Redirecting back...</p>
          </div>
          <script>
            setTimeout(() => {
              window.location.href = '${process.env.FRONTEND_URL}?error=auth_failed';
            }, 2000);
          </script>
        </body>
      </html>
    `);
  }
};

/**
 * Check authentication status
 */
const getAuthStatus = (req, res) => {
  const isConnected = hasTokens();
  const tokens = getTokens();

  res.json({
    connected: isConnected,
    hasTokens: isConnected,
    realmId: isConnected && tokens ? tokens.realmId : null,
  });
};

/**
 * Disconnect/Logout - Clear memory
 */
const disconnect = (req, res) => {
  clearTokens();
  console.log("🔌 Disconnected from QuickBooks");

  res.json({
    success: true,
    message: "Disconnected from QuickBooks",
  });
};

module.exports = {
  getAuthUrl,
  handleCallback,
  getAuthStatus,
  disconnect,
};
