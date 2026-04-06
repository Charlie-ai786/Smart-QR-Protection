import { analyzeContext } from "./contextAnalyzer";
import { detectTamper } from "./tamperDetector";

/**
 * Risk Fusion Engine Module
 */

export function fuseRisk(threat, payment, history = []) {
  let score = threat.risk_score || 0;
  const triggers = [...(threat.reason || [])];
  
  if (triggers.some(r => r.includes("Blacklisted"))) {
    score += 30;
  }

  if (payment && payment.is_payment_qr) {
    if (payment.is_suspicious) {
      score += 20;
      triggers.push(...(payment.reason || []));
    }
    if (payment.amount) {
      const amt = parseFloat(payment.amount);
      if (!isNaN(amt)) {
        if (amt > 5000) score += 10;
        if (amt > 10000) score += 15;
      }
    }
  }

  if (threat.is_malicious) {
    score += 30;
    triggers.push("Verified malicious payload signature detected");
  }

  const qr_data = threat.url || "unknown"; 
  const contextAnalysis = analyzeContext(qr_data);

  const qrHistory = (history || []).filter(h => h && h.qr_data).map(h => h.qr_data);
  const timeHistory = (history || []).filter(h => h && h.timestamp).map(h => new Date(h.timestamp).getTime());
  const tamperAnalysis = detectTamper(qrHistory, timeHistory);

  if (tamperAnalysis.tamper.is_tampered) {
    score += (tamperAnalysis.tamper.confidence * 40); 
    triggers.push(...tamperAnalysis.tamper.indicators);
  }

  score = Math.min(100, score);

  const status = score >= 65 ? "HIGH_RISK" : score >= 25 ? "MEDIUM_RISK" : "LOW_RISK";
  const action = status === "HIGH_RISK" ? "DO NOT PROCEED" : status === "MEDIUM_RISK" ? "PROCEED WITH CAUTION" : "SAFE TO PROCEED";

  const summary = generateSummary(threat, payment, status);

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
