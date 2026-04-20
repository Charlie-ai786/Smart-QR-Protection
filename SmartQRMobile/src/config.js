/**
 * Global Configuration for SmartQRMobile
 */

// For Android Emulator, localhost is 10.0.2.2
// For iOS Simulator, localhost is 127.0.0.1
// For Physical Devices, use your computer's local IP
// Current machine IP: 10.230.181.82
export const BASE_URL = "http://10.230.181.82:5000";

export const API_ENDPOINTS = {
  ANALYZE: `${BASE_URL}/analyze`,
  REPUTATION: `${BASE_URL}/reputation`,
  HISTORY: `${BASE_URL}/history`,
};
