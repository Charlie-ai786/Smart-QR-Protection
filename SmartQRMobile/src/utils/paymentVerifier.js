/**
 * Payment Verification Module
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
    // Parsing UPI URL manually since URLSearchParams might behave differently or needs polyfill in RN
    const queryString = qr_data.split('?')[1] || '';
    const params = {};
    queryString.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) params[key] = decodeURIComponent(value || '');
    });

    const upiId = params["pa"] || "";
    const name = params["pn"] || "";
    const amount = params["am"] || "";

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

function validateUpiId(upiId, payment) {
  if (!upiId) {
    payment.is_suspicious = true;
    payment.reason.push("UPI ID is missing.");
    return;
  }
  if (!upiId.includes("@")) {
    payment.is_suspicious = true;
    payment.reason.push("Invalid UPI ID: Missing '@' symbol.");
  }
  if (upiId.length < 8) {
    payment.reason.push("The UPI ID is unusually short.");
  }
}

function validateName(name, payment) {
  if (!name) {
    payment.is_suspicious = true;
    payment.reason.push("Receiver name is missing.");
    return;
  }
  const suspiciousKeywordsPerName = ["payment", "user", "admin", "test", "temp", "guest"];
  if (suspiciousKeywordsPerName.some(k => name.toLowerCase().includes(k))) {
    payment.is_suspicious = true;
    payment.reason.push(`Generic/Suspicious name detected: "${name}".`);
  }
  const specialCharsRegex = /[!#$^&*()_+={}[\];'":|<>?]/;
  if (specialCharsRegex.test(name)) {
    payment.is_suspicious = true;
    payment.reason.push("Receiver name contains unusual special characters.");
  }
}

function validateAmount(amount, payment) {
  if (!amount) {
    payment.reason.push("No fixed amount specified.");
    return;
  }
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    payment.is_suspicious = true;
    payment.reason.push(`Invalid amount format: "${amount}".`);
    return;
  }
  if (numAmount > 10000) {
    payment.is_suspicious = true;
    payment.reason.push(`High value transaction detected (Amount: ${amount}).`);
  }
}

function detectSuspiciousPatterns(params, upiId, name, payment) {
  const paramCount = Object.keys(params).length;
  if (paramCount > 6) {
    payment.is_suspicious = true;
    payment.reason.push(`Unusual number of query parameters (${paramCount}).`);
  }
  if (upiId && name && upiId.split("@")[0].toLowerCase() === name.toLowerCase()) {
    payment.reason.push("The name and ID are identical.");
  }
}
