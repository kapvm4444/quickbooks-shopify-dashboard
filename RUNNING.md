# Running the Projects

This document explains how to run the two projects in this repository:

- `quickbooks-server` — the backend API server that handles QuickBooks OAuth and API calls.
- `shopify-dashboard` — the React frontend (Vite) dashboard.

Quick overview

- Start the backend (QuickBooks API server) with the `start` npm script.
- Start the frontend (React dashboard) with the `dev` npm script.
- Open the frontend in your browser, go to the Expenses tab, and follow the QuickBooks "Connect" flow.

Prerequisites

- Node.js (LTS recommended, e.g. Node 18+)
- npm (bundled with Node)
- Internet access to complete QuickBooks OAuth

1) Start the backend (QuickBooks API server)

Open a terminal (Windows cmd.exe) and run:

```cmd
cd quickbooks-server
npm install
npm start
```

Notes:
- The `start` script runs the API server (see `quickbooks-server/package.json`).
- Before attempting OAuth, ensure the backend is running and reachable from your browser. The backend handles the OAuth callback and token storage.
- If your QuickBooks app credentials are required, check `quickbooks-server/config/oauthClient.js` and/or environment variables used by the server. Provide your QuickBooks client ID/secret and redirect URI there if needed.

2) Start the frontend (React / Vite dashboard)

In a new terminal window, run:

```cmd
cd shopify-dashboard
npm install
npm run dev
```

Notes:
- The `dev` script starts the Vite dev server (see `shopify-dashboard/package.json`).
- Vite will print the local server URL (commonly http://localhost:5173) — open that URL in your browser.

3) Connect QuickBooks from the dashboard

- Open the frontend URL printed by the Vite server in your browser.
- Navigate to the Expenses tab in the UI.
- The UI will prompt you to connect QuickBooks; click the Connect button.
- The frontend initiates the OAuth flow with the backend. Complete the QuickBooks OAuth flow in the popup or redirect.
- After successful authorization, the frontend will be able to call backend endpoints that interact with QuickBooks.

Troubleshooting

- Backend logs: watch the backend terminal for errors during OAuth or API calls.
- CORS / network: ensure the frontend URL is allowed by any CORS rules the backend configures. If the frontend cannot reach the backend, check ports, firewall, or proxy settings.
- Redirect URI: QuickBooks requires the redirect URI registered in your QuickBooks app settings to match the backend callback URL. If the OAuth flow fails, verify the redirect URI and the values configured in `quickbooks-server/config/oauthClient.js`.
- Environment variables: if the server expects secrets from environment variables rather than the config file, set them before running (e.g., via a `.env` file or your OS environment).

Useful commands summary (Windows cmd.exe)

```cmd
:: Backend
cd quickbooks-server
npm install
npm start

:: Frontend (new terminal)
cd shopify-dashboard
npm install
npm run dev
```

If you want, I can also add a short `docker-compose` or script to run both apps together, or document the exact QuickBooks environment variables expected by the server—tell me which you prefer.