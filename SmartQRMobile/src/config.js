/**
 * Global Configuration for SmartQRMobile
 */

// For Android Emulator, localhost is 10.0.2.2
// For iOS Simulator, localhost is 127.0.0.1
// For Physical Devices, use your computer's local IP (e.g., 192.168.1.10)
export const BASE_URL = "http://10.0.2.2:5000";

export const API_ENDPOINTS = {
  ANALYZE: `${BASE_URL}/analyze`,
  REPUTATION: `${BASE_URL}/reputation`,
  HISTORY: `${BASE_URL}/history`,
};
