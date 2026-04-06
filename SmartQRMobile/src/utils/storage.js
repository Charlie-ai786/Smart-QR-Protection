import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Utility for QR Scan History (AsyncStorage version)
 */

const STORAGE_KEY = "qr_history";
const MAX_ENTRIES = 50;

/**
 * Saves a scan result to AsyncStorage
 * @param {object} scanData - The full scan object
 */
export const saveScan = async (scanData) => {
  try {
    const history = await getHistory();
    
    const newEntry = {
      ...scanData,
      timestamp: new Date().toISOString(),
      id: scanData.session_id || Date.now().toString()
    };

    const updatedHistory = [newEntry, ...history];
    const limitedHistory = updatedHistory.slice(0, MAX_ENTRIES);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
    return limitedHistory;
  } catch (error) {
    console.error("Error saving to AsyncStorage:", error);
    return [];
  }
};

/**
 * Retrieves all stored scans from AsyncStorage
 */
export const getHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading from AsyncStorage:", error);
    return [];
  }
};

/**
 * Clears the entire scan history
 */
export const clearHistory = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

/**
 * Formats a timestamp into a human-readable string
 */
export const formatTimestamp = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
