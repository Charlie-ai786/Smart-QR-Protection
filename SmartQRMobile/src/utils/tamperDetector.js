/**
 * Tamper / Overlay Detection Module
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

  if (latestData !== previousData) {
    const timeGap = latestTime - previousTime;
    if (timeGap < 2000) {
      result.is_tampered = true;
      result.indicators.push("Rapid QR value change detected (Possible overlay)");
      result.confidence += 0.4;
    }
  }

  if (latestData.length !== previousData.length && (latestTime - previousTime) < 5000) {
    result.indicators.push("Suspicious data length variation");
    result.confidence += 0.2;
  }

  const uniqueValues = new Set(qr_data_history.slice(0, 5)).size;
  if (uniqueValues > 2 && (latestTime - timestamps[Math.min(qr_data_history.length-1, 4)]) < 10000) {
    result.is_tampered = true;
    result.indicators.push("High detection instability");
    result.confidence += 0.3;
  }

  result.confidence = Math.min(1.0, result.confidence);
  if (result.confidence > 0.4) {
    result.is_tampered = true;
  }

  return { tamper: result };
}
