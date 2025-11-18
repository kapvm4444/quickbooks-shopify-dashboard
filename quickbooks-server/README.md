# QuickBooks API Server

A secure, well-structured Node.js/Express server for QuickBooks Online API integration with HTTP-only cookie-based authentication.

## 📁 Project Structure

```
quickbooks-server/
├── config/
│   └── oauthClient.js           # OAuth client configuration
├── controllers/
│   ├── authController.js        # Authentication logic
│   └── quickbooksController.js  # QuickBooks data operations
├── middlewares/
│   └── auth.js                  # Authentication middleware & token management
├── routers/
│   ├── authRoutes.js            # Auth endpoints
│   ├── quickbooksRoutes.js      # Protected data endpoints
│   └── callbackRoutes.js        # OAuth callback
├── utils/
│   └── tokenManager.js          # Token refresh & API calls helper
├── .env                         # Environment variables
├── server.js                    # Main application entry point
└── package.json
```

## 🔐 Security Features

### HTTP-Only Cookies
- **Access tokens**, **refresh tokens**, and **realmId** are stored in HTTP-only cookies
- Prevents XSS attacks (JavaScript cannot access tokens)
- Cookies are set during the OAuth callback redirect
- Works seamlessly across localhost ports in development
- 60-day expiration (matches QuickBooks refresh token validity)

### Automatic Token Refresh
- Middleware automatically refreshes expired access tokens
- Updates cookies with new tokens seamlessly
- No client-side token management required

## 🔄 Authentication Flow (The Real Deal)

Here's exactly how it works:

```
1. Frontend: User clicks "Connect to QuickBooks"
2. Frontend: Calls GET /api/auth/url
3. Backend: Returns QuickBooks authorization URL
4. Frontend: Redirects user to QuickBooks (window.location.href = authUrl)
5. QuickBooks: User authorizes the app
6. QuickBooks: Redirects to YOUR_BACKEND/callback?code=xxx&realmId=xxx
7. Backend: Exchanges code for tokens
8. Backend: Sets tokens in HTTP-only cookies
9. Backend: Serves HTML page with auto-redirect to frontend
10. Browser: Cookies are now stored and available
11. Frontend: User lands back on your app (with ?connected=true)
12. Frontend: Makes API calls with credentials: 'include'
13. Backend: Reads tokens from cookies automatically
14. ✅ Everything works!
```

**Key Point**: The cookies are set when the browser loads the `/callback` endpoint. The HTML page served by the callback includes the `Set-Cookie` headers, so by the time the browser redirects back to your frontend, the cookies are already stored and will be sent with subsequent API requests.

## 🚀 API Endpoints

### Authentication Routes (`/api/auth`)

#### Get Authorization URL
```http
GET /api/auth/url
```
Returns the QuickBooks authorization URL to redirect users to.

**Response:**
```json
{
  "authUrl": "https://appcenter.intuit.com/connect/oauth2?..."
}
```

#### Check Connection Status
```http
GET /api/auth/status
```
Check if user is connected to QuickBooks.

**Response:**
```json
{
  "connected": true,
  "hasTokens": true,
  "realmId": "123456789"
}
```

#### Disconnect
```http
POST /api/auth/disconnect
```
Clears all authentication cookies (logout).

**Response:**
```json
{
  "success": true,
  "message": "Disconnected from QuickBooks"
}
```

### OAuth Callback Route

#### OAuth Callback
```http
GET /callback?code=xxx&realmId=xxx&state=xxx
```
Handles the OAuth redirect from QuickBooks. Automatically stores tokens in cookies and redirects to frontend.

### QuickBooks Data Routes (`/api/*`)
**All routes require authentication (cookies must be present)**

#### Get Invoices
```http
GET /api/invoices
```

#### Get Customers
```http
GET /api/customers
```

#### Get Sales Receipts
```http
GET /api/salesreceipts
```

#### Get Accounts
```http
GET /api/accounts
```

#### Get Bills
```http
GET /api/bills
```

#### Get Purchases
```http
GET /api/purchases
```

#### Get Items
```http
GET /api/items
```

#### Get Bill Payments
```http
GET /api/billpayments
```

#### Get Company Info
```http
GET /api/company-info
```

## 🌐 Frontend Integration Guide

### Important: CORS Credentials

Since cookies are used, you MUST include credentials in all requests:

#### Using Fetch API:
```javascript
fetch('http://localhost:5000/api/invoices', {
  credentials: 'include', // CRITICAL: This sends cookies!
})
  .then(res => res.json())
  .then(data => console.log(data));
```

#### Using Axios:
```javascript
import axios from 'axios';

// Set globally (recommended)
axios.defaults.withCredentials = true;

// Or per request
axios.get('http://localhost:5000/api/invoices', {
  withCredentials: true
});
```

### Complete Frontend Implementation

```javascript
const API_BASE = 'http://localhost:5000';

// Step 1: Connect to QuickBooks
async function connectToQuickBooks() {
  try {
    // Get auth URL from backend
    const response = await fetch(`${API_BASE}/api/auth/url`, {
      credentials: 'include'
    });
    const { authUrl } = await response.json();
    
    // Redirect user to QuickBooks
    // Backend will handle the callback and set cookies automatically
    window.location.href = authUrl;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Step 2: Handle return from QuickBooks
// When user comes back, check URL params
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  
  if (params.get('connected') === 'true') {
    console.log('✅ Successfully connected!');
    // Cookies are already set - you can now make API calls
    fetchInvoices();
  }
  
  if (params.get('error')) {
    console.error('❌ Connection failed:', params.get('error'));
  }
}, []);

// Step 3: Make authenticated API calls
async function fetchInvoices() {
  try {
    const response = await fetch(`${API_BASE}/api/invoices`, {
      credentials: 'include' // Sends cookies automatically
    });
    
    if (response.status === 401) {
      console.log('Not authenticated - need to connect first');
      return;
    }
    
    const invoices = await response.json();
    console.log('Invoices:', invoices);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Step 4: Check if already connected
async function checkConnection() {
  const response = await fetch(`${API_BASE}/api/auth/status`, {
    credentials: 'include'
  });
  const { connected } = await response.json();
  return connected;
}

// Step 5: Disconnect
async function disconnect() {
  await fetch(`${API_BASE}/api/auth/disconnect`, {
    method: 'POST',
    credentials: 'include'
  });
  console.log('Disconnected');
}
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000';

export function useQuickBooks() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/status`, {
        credentials: 'include'
      });
      const { connected } = await response.json();
      setConnected(connected);
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const connect = async () => {
    const response = await fetch(`${API_BASE}/api/auth/url`, {
      credentials: 'include'
    });
    const { authUrl } = await response.json();
    window.location.href = authUrl;
  };

  const disconnect = async () => {
    await fetch(`${API_BASE}/api/auth/disconnect`, {
      method: 'POST',
      credentials: 'include'
    });
    setConnected(false);
  };

  const fetchData = async (endpoint) => {
    const response = await fetch(`${API_BASE}/api/${endpoint}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  };

  return {
    connected,
    loading,
    connect,
    disconnect,
    fetchData
  };
}
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# QuickBooks OAuth Credentials
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REDIRECT_URI=http://localhost:5000/callback
ENVIRONMENT=sandbox

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## 🏃 Running the Server

```bash
# Development
npm start

# Or with nodemon
npm run dev
```

## 🛡️ Security Best Practices Implemented

1. ✅ **HTTP-Only Cookies** - Tokens cannot be accessed by JavaScript
2. ✅ **CORS with Credentials** - Proper cross-origin cookie handling
3. ✅ **SameSite Cookie Attribute** - CSRF protection
4. ✅ **Secure Flag in Production** - HTTPS-only cookies
5. ✅ **Automatic Token Refresh** - No manual token management needed
6. ✅ **Middleware Protection** - Routes are protected by auth middleware
7. ✅ **Environment Variables** - Sensitive data not in code

## 📝 Notes for Production

When deploying to production:

1. Set `NODE_ENV=production` in your environment
2. Use HTTPS for both frontend and backend
3. Update `FRONTEND_URL` to your production domain
4. Update `REDIRECT_URI` to your production callback URL
5. Set `ENVIRONMENT=production` to use QuickBooks production API
6. Consider implementing rate limiting
7. Add request logging
8. Implement proper error tracking (e.g., Sentry)

## 🔄 Token Management Flow

```
1. User clicks "Connect to QuickBooks"
2. Frontend fetches /api/auth/url
3. User is redirected to QuickBooks
4. User authorizes the app
5. QuickBooks redirects to /callback
6. Server exchanges code for tokens
7. Server stores tokens in HTTP-only cookies
8. User is redirected back to frontend
9. Frontend makes API calls with credentials: 'include'
10. Server automatically refreshes expired tokens
11. New tokens are updated in cookies automatically
```

## 🆘 Troubleshooting

### Cookies not being sent with requests?
- ✅ MUST use `credentials: 'include'` in fetch or `withCredentials: true` in axios
- ✅ Check CORS origin matches your frontend URL exactly
- ✅ Verify `FRONTEND_URL` in `.env` is correct

### 401 Unauthorized errors?
- User needs to connect to QuickBooks first
- Check browser DevTools → Application → Cookies to see if they're set
- Cookies may have expired (60 days)

### Cookies not visible in browser?
- HTTP-only cookies won't show in `document.cookie` (this is correct!)
- Check browser DevTools → Application → Cookies → http://localhost:5000
- You should see: `access_token`, `refresh_token`, `realmId`

### CORS errors?
- Ensure `credentials: 'include'` is set on frontend requests
- Verify backend CORS origin configuration matches frontend URL
- Check that both frontend and backend URLs in `.env` are correct

## 🎯 The Magic Explained

**You don't need to change your frontend flow at all!** Here's why it works:

1. **OAuth Callback Sets Cookies**: When `/callback` is hit, cookies are set in the response headers
2. **Browser Stores Them**: The browser automatically stores these cookies
3. **Auto-Redirect**: The HTML page redirects user back to your frontend
4. **Cookies Travel**: When frontend makes requests with `credentials: 'include'`, cookies go along
5. **Backend Reads Them**: Your middleware extracts tokens from cookies automatically

**No token passing needed. No localStorage. No manual management. Just works! 🎉**
