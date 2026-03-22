/**
 * Payment Verification Module
 * 
 * This module provides functions to detect and validate UPI (Unified Payments Interface) QR codes.
 * It identifies potential fraud and suspicious payment request patterns.
 */

/**
 * Analyzes the given QR data for potential payment-related threats.
 * @param {string} qr_data - The raw data decoded from a QR code.
 * @returns {object} - An object containing payment analysis results.
 */
export function analyzePayment(qr_data) {
  const result = {
    payment: {
      is_payment_qr: false,
      upi_id: "",
      name: "",
      amount: "",
      is_suspicious: false,
      reason: []
    }
  };

  if (!qr_data) return result;

  // 1. Detect if QR contains UPI payment format
  if (!qr_data.startsWith("upi://pay")) {
    return result;
  }

  result.payment.is_payment_qr = true;

  try {
    // 2. Parse Query Parameters
    const url = new URL(qr_data);
    const params = new URLSearchParams(url.search);

    const upiId = params.get("pa") || "";
    const name = params.get("pn") || "";
    const amount = params.get("am") || "";

    result.payment.upi_id = upiId;
    result.payment.name = name;
    result.payment.amount = amount;

    // 3. Validation Rules
    validateUpiId(upiId, result.payment);
    validateName(name, result.payment);
    validateAmount(amount, result.payment);

    // 4. Detect Suspicious Patterns
    detectSuspiciousPatterns(params, upiId, name, result.payment);

  } catch (err) {
    console.error("Invalid payment URL format:", err);
    result.payment.is_suspicious = true;
    result.payment.reason.push("Invalid UPI URI format detected.");
  }

  return result;
}

/**
 * Validates the UPI ID (Virtual Payment Address)
 */
function validateUpiId(upiId, payment) {
  if (!upiId) {
    payment.is_suspicious = true;
    payment.reason.push("UPI ID is missing. This QR might not lead to a valid payment.");
    return;
  }

  // UPI IDs must contain "@" (e.g., example@upi)
  if (!upiId.includes("@")) {
    payment.is_suspicious = true;
    payment.reason.push("Invalid UPI ID format: Missing '@' symbol.");
  }

  // Should not be too short (standard VPA/UPI IDs are usually 8+ chars)
  if (upiId.length < 8) {
    payment.reason.push("The UPI ID is unusually short, which is common for ad-hoc or experimental accounts.");
  }
}

/**
 * Validates the Merchant/Receiver Name
 */
function validateName(name, payment) {
  if (!name) {
    payment.is_suspicious = true;
    payment.reason.push("Receiver name is missing. Payers cannot verify who they are sending money to.");
    return;
  }

  // Detect suspicious names (payment systems usually have professional merchant names)
  const suspiciousKeywordsPerName = ["payment", "user", "admin", "test", "temp", "guest"];
  if (suspiciousKeywordsPerName.some(k => name.toLowerCase().includes(k))) {
    payment.is_suspicious = true;
    payment.reason.push(`Generic/Suspicious name detected: "${name}".`);
  }

  // Should not contain random special characters (mostly alphanumeric and spaces)
  const specialCharsRegex = /[!#\$%\^&\*\(\)_+\=\[\]\{\};':"\|<>\?]/;
  if (specialCharsRegex.test(name)) {
    payment.is_suspicious = true;
    payment.reason.push("Receiver name contains unusual special characters.");
  }
}

/**
 * Validates the Transaction Amount
 */
function validateAmount(amount, payment) {
  if (!amount) {
    // Missing amount is medium risk as the user must enter it manually (risk of typo/social engineering)
    payment.reason.push("No fixed amount specified. Please verify the amount manually before paying.");
    return;
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    payment.is_suspicious = true;
    payment.reason.push(`Invalid amount format: "${amount}".`);
    return;
  }

  // High amount threshold (e.g., 10,000 INR)
  if (numAmount > 10000) {
    payment.is_suspicious = true;
    payment.reason.push(`High value transaction detected (Amount: ${amount}). Exercise extreme caution.`);
  }
}

/**
 * Detects advanced suspicious patterns in the payload
 */
function detectSuspiciousPatterns(params, upiId, name, payment) {
  // Pattern 1: Too many parameters (UPI QRs are usually lean)
  const paramCount = Array.from(params.keys()).length;
  if (paramCount > 6) {
    payment.is_suspicious = true;
    payment.reason.push(`Unusual number of query parameters (${paramCount}). Possibly hiding malicious redirects or tracking.`);
  }

  // Pattern 2: Name/ID Mismatch (e.g., same string for both)
  if (upiId && name && upiId.split("@")[0].toLowerCase() === name.toLowerCase()) {
    payment.reason.push("The name and ID are identical, which is common for automated or bot-generated payment requests.");
  }
}
