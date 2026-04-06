/**
 * Context-Aware QR Analysis Module
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

  if (data.includes("upi://pay") || KEYWORDS.PAYMENT.some(k => data.includes(k))) {
    type = CONTEXT_TYPES.PAYMENT;
    intent = "Asked to make a payment or transfer funds";
    risk_hint = "Verify receiver and amount before authorizing";
    confidence = data.includes("upi://pay") ? 1.0 : 0.8;
  }
  else if (KEYWORDS.LOGIN.some(k => data.includes(k))) {
    type = CONTEXT_TYPES.LOGIN;
    intent = "Asked to login or verify credentials";
    risk_hint = "Be careful with passwords; ensure domain is authentic";
    confidence = 0.85;
  }
  else if (data.startsWith("http") || KEYWORDS.INFO.some(k => data.includes(k))) {
    type = CONTEXT_TYPES.INFO;
    intent = "Directed to an informational website";
    risk_hint = "Safe to view, but avoid unexpected downloads";
    confidence = 0.7;
  }

  return {
    context: { type, intent, risk_hint, confidence }
  };
}
