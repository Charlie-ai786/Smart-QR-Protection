/**
 * Tamper / Overlay Detection Module
 * 
 * Heuristics-based detection of physical tampering (stickers/overlays)
 * or digital instabilities that suggest a malicious QR environment.
 */

/**
 * Main Detection Function
 * @param {Array} qr_data_history - Array of recent raw QR data strings
 * @param {Array} timestamps - Array of timestamps (ms) for the scans
 * @returns {object} - Tamper report with indicators and confidence
 */
export function detectTamper(qr_data_history, timestamps) {
  const result = {
    is_tampered: false,
    confidence: 0,
    indicators: []
  };

  if (!qr_data_history || qr_data_history.length < 2) {
    return { tamper: result };
  }

  const latestData = qr_data_history[0];
  const previousData = qr_data_history[1];
  const latestTime = timestamps[0];
  const previousTime = timestamps[1];

  // 1. Scan Consistency Check
  // If the same physical QR is scanned twice, it should have the same data.
  // We check if the data changed between very rapid successive scans.
  if (latestData !== previousData) {
    const timeGap = latestTime - previousTime;
    
    // 2. Rapid Change (Overlay) Detection
    // Different data detected within a very short window (e.g., < 2s)
    if (timeGap < 2000) {
      result.is_tampered = true;
      result.indicators.push("Rapid QR value change detected (Possible digital overlay)");
      result.confidence += 0.4;
    } else {
      // Data changed but over a longer period - could be just scanning different codes
      // But we still flag it if it happens precisely at the same location (not detectable here)
    }
  }

  // 3. Length Variation
  // Even if the content is different, a malicious script might swap codes with different sizes
  if (latestData.length !== previousData.length && (latestTime - previousTime) < 5000) {
    result.indicators.push("Suspicious data length variation across attempts");
    result.confidence += 0.2;
  }

  // 4. Stability Check
  // If the history has many unique values in a short time, it's highly unstable
  const uniqueValues = new Set(qr_data_history.slice(0, 5)).size;
  if (uniqueValues > 2 && (latestTime - timestamps[Math.min(qr_data_history.length-1, 4)]) < 10000) {
    result.is_tampered = true;
    result.indicators.push("High detection instability (Possible physical tampering/distortion)");
    result.confidence += 0.3;
  }

  // Cap confidence
  result.confidence = Math.min(1.0, result.confidence);
  
  // High confidence threshold for auto-flagging
  if (result.confidence > 0.4) {
    result.is_tampered = true;
  }

  return { tamper: result };
}

/**
 * Visual Heuristic (Simulated)
 * In a real mobile app, we would check for sticker edges or blur.
 */
export function detectVisualAnomalies(imageData) {
  // Placeholder for future computer vision integration
  return { suspicious: false, reason: null };
}
