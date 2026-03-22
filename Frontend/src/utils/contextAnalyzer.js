/**
 * Context-Aware QR Analysis Module
 * 
 * Provides semantic understanding of QR data to determine user intent 
 * and specific risks associated with the context (Payment, Login, etc.).
 */

const CONTEXT_TYPES = {
  PAYMENT: "PAYMENT",
  LOGIN: "LOGIN",
  INFO: "INFO",
  UNKNOWN: "UNKNOWN"
};

const KEYWORDS = {
  PAYMENT: ["pay", "send", "amount", "billing", "invoice", "upi", "checkout"],
  LOGIN: ["login", "verify", "password", "account", "bank", "secure", "signin", "update"],
  INFO: ["menu", "website", "catalog", "social", "contact", "about"]
};

/**
 * Main Analysis Function
 * @param {string} qr_data - The raw decoded string from the QR code
 * @returns {object} - Context object with type, intent, risk_hint, and confidence
 */
export function analyzeContext(qr_data) {
  if (!qr_data) {
    return {
      context: { type: CONTEXT_TYPES.UNKNOWN, intent: "Empty data detected", risk_hint: "No analysis possible", confidence: 0 }
    };
  }

  const data = qr_data.toLowerCase();
  let type = CONTEXT_TYPES.UNKNOWN;
  let intent = "Unknown intent";
  let risk_hint = "No specific hint; proceed with regular caution";
  let confidence = 0.5;

  // 1. Detect PAYMENT Context
  if (data.includes("upi://pay") || KEYWORDS.PAYMENT.some(k => data.includes(k))) {
    type = CONTEXT_TYPES.PAYMENT;
    intent = "User is being asked to make a payment or transfer funds";
    risk_hint = "Verify the receiver's name and amount before authorizing the transaction";
    confidence = data.includes("upi://pay") ? 1.0 : 0.8;
  }
  // 2. Detect LOGIN / PHISHING Context
  else if (KEYWORDS.LOGIN.some(k => data.includes(k))) {
    type = CONTEXT_TYPES.LOGIN;
    intent = "User is being asked to login or verify account credentials";
    risk_hint = "Be extremely careful entering passwords; ensure the domain is authentic";
    confidence = 0.85;
  }
  // 3. Detect INFORMATIONAL Context
  else if (data.startsWith("http") || KEYWORDS.INFO.some(k => data.includes(k))) {
    type = CONTEXT_TYPES.INFO;
    intent = "User is being directed to an informational website or document";
    risk_hint = "Safe to view, but avoid downloading unexpected files";
    confidence = 0.7;
  }

  return {
    context: {
      type,
      intent,
      risk_hint,
      confidence
    }
  };
}

/**
 * Future ML Upgrade Placeholder
 * This architecture can be easily wrapped with an async call to an NLP service.
 */
export async function analyzeContextAI(qr_data) {
  // Logic to call local or cloud-based LLM/NLP model
  return analyzeContext(qr_data);
}
