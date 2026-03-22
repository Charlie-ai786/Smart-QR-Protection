/**
 * Storage Utility for QR Scan History
 */

const STORAGE_KEY = "qr_history";
const MAX_ENTRIES = 50;

/**
 * Saves a scan result to localStorage
 * @param {object} scanData - The full scan object (session_id, qr_data, results, etc.)
 */
export const saveScan = (scanData) => {
  try {
    const history = getHistory();
    
    // Create a new entry with timestamp
    const newEntry = {
      ...scanData,
      timestamp: new Date().toISOString(),
      id: scanData.session_id || Date.now()
    };

    // Add to the beginning of the array
    const updatedHistory = [newEntry, ...history];

    // Limit to MAX_ENTRIES
    const limitedHistory = updatedHistory.slice(0, MAX_ENTRIES);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
    return limitedHistory;
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    return [];
  }
};

/**
 * Retrieves all stored scans from localStorage
 * @returns {Array} - List of scans, latest first
 */
export const getHistory = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return [];
  }
};

/**
 * Clears the entire scan history
 */
export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Formats a timestamp into a human-readable string
 */
export const formatTimestamp = (isoString) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};
