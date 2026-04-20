/**
 * Global Configuration for SmartQRMobile
 */

// For Production: Replace with your actual deployed backend URL (e.g., https://api.smartqr.com)
// For Development: Use your local IP address
const DEV_URL = "http://10.230.181.82:5000";
const PROD_URL = "https://your-production-url.com"; // <-- Change this for deployment

export const BASE_URL = __DEV__ ? DEV_URL : PROD_URL;

export const API_ENDPOINTS = {
  ANALYZE: `${BASE_URL}/analyze`,
  REPUTATION: `${BASE_URL}/reputation`,
  HISTORY: `${BASE_URL}/history`,
};
