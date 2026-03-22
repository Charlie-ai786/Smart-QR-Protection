import { analyzeContext } from "./contextAnalyzer";
import { detectTamper } from "./tamperDetector";

/**
 * Risk Fusion Engine Module
 * 
 * This module integrates outputs from multiple security modules (Threat Detection, Payment Verification)
 * to calculate a final risk assessment and provide actionable intelligence.
 */

/**
 * Fuses risk assessments from different modules into a single final report.
 * @param {object} threat - The output from the Threat Detection module.
 * @param {object} payment - The output from the Payment Verification module.
 * @param {Array} history - Array of recent scan history entries.
 * @returns {object} - The final risk fusion report.
 */
export function fuseRisk(threat, payment, history = []) {
  // 1. Initial risk score and triggers from general threat detection
  let score = threat.risk_score || 0;
  const triggers = [...(threat.reason || [])];

  // 2. Aggregate Payment-Specific Risks
  if (payment && payment.is_payment_qr) {
    // Add +20 if payment is suspicious
    if (payment.is_suspicious) {
      score += 20;
      triggers.push(...(payment.reason || []));
    }

    // Amount-based risk escalation
    if (payment.amount) {
      const amt = parseFloat(payment.amount);
      if (!isNaN(amt)) {
        if (amt > 5000) score += 10;
        if (amt > 10000) score += 15;
      }
    }
  }

  // 3. Escalation for definitely malicious items
  if (threat.is_malicious) {
    score += 30;
    triggers.push("Verified malicious payload signature detected");
  }

  // 4. Semantic Context Analysis
  const qr_data = threat.url || "unknown"; 
  const contextAnalysis = analyzeContext(qr_data);

  // 5. Tamper / Overlay Detection
  const qrHistory = (history || []).filter(h => h && h.qr_data).map(h => h.qr_data);
  const timeHistory = (history || []).filter(h => h && h.timestamp).map(h => new Date(h.timestamp).getTime());
  const tamperAnalysis = detectTamper(qrHistory, timeHistory);

  if (tamperAnalysis.tamper.is_tampered) {
    score += (tamperAnalysis.tamper.confidence * 40); 
    triggers.push(...tamperAnalysis.tamper.indicators);
  }

  // 6. Final Cap risk_score at 100
  score = Math.min(100, score);

  // 7. Define Status and Action
  const status = score >= 70 ? "HIGH_RISK" : score >= 30 ? "MEDIUM_RISK" : "LOW_RISK";
  const action = status === "HIGH_RISK" ? "DO NOT PROCEED" : status === "MEDIUM_RISK" ? "PROCEED WITH CAUTION" : "SAFE TO PROCEED";

  // 8. Generate Summary String
  const summary = generateSummary(threat, payment, status);

  // 9. Calculate Confidence Score (0.0 - 1.0)
  const signalCount = triggers.length;
  const baseConfidence = Math.min(0.5 + (signalCount * 0.1), 1.0);
  const fusedConfidence = (baseConfidence + contextAnalysis.context.confidence + (tamperAnalysis.tamper.confidence || 0)) / 3;

  return {
    final: {
      risk_score: Math.round(score),
      status,
      action,
      summary,
      confidence: parseFloat(fusedConfidence.toFixed(2)),
      context: contextAnalysis.context,
      tamper: tamperAnalysis.tamper,
      reasons: triggers
    }
  };
}

/**
 * Generates a human-friendly summary based on fused intelligence
 */
function generateSummary(threat, payment, status) {
  if (status === "HIGH_RISK") {
    if (threat.is_url) return "High-risk phishing URL detected";
    if (payment.is_payment_qr) return "Fraudulent payment request blocked";
    return "Malicious payload detected";
  }

  if (status === "MEDIUM_RISK") {
    if (payment.is_payment_qr) return "Suspicious payment request";
    if (threat.is_url) return "Potentially unsafe URL";
    return "Untrusted data content";
  }

  if (payment && payment.is_payment_qr) return "Verified payment request";
  return "Safe QR code";
}
