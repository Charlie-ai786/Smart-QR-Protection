import { analyzeContext } from "./contextAnalyzer";
import { detectTamper } from "./tamperDetector";

/**
 * Risk Fusion Engine — Merges local + backend scores for accurate risk assessment
 */

export function fuseRisk(threat, payment, history = [], mlResult = null) {
  let score = threat.risk_score || 0;
  const triggers = [...(threat.reason || [])];

  // ── Backend ML Result Integration ──────────────────────────────────────────
  if (mlResult && typeof mlResult.risk_score === 'number') {
    const serverScore = mlResult.risk_score || 0;

    // Take whichever is higher: local heuristics or server analysis
    score = Math.max(score, serverScore);

    // Merge backend reasons (skip generic "all clear" message)
    if (Array.isArray(mlResult.reasons)) {
      mlResult.reasons.forEach(r => {
        if (
          r !== "No immediate threats detected" &&
          !triggers.some(t => t.toLowerCase() === r.toLowerCase())
        ) {
          triggers.push(r);
        }
      });
    }

    // If server explicitly flags as malicious, enforce minimum dangerous threshold
    if (mlResult.is_malicious) {
      score = Math.max(score, 70);
    }
  }

  // ── Blacklist Boost ─────────────────────────────────────────────────────────
  if (triggers.some(r => r.toLowerCase().includes("blacklisted"))) {
    score = Math.min(100, score + 20);
  }

  // ── Payment Risk Boost ──────────────────────────────────────────────────────
  if (payment && payment.is_payment_qr) {
    if (payment.is_suspicious) {
      score = Math.min(100, score + 20);
      (payment.reason || []).forEach(r => {
        if (!triggers.includes(r)) triggers.push(r);
      });
    }
    if (payment.amount) {
      const amt = parseFloat(payment.amount);
      if (!isNaN(amt)) {
        if (amt > 5000) score = Math.min(100, score + 10);
        if (amt > 10000) score = Math.min(100, score + 15);
      }
    }
  }

  // ── Confirmed Malicious Marker ──────────────────────────────────────────────
  if (threat.is_malicious) {
    score = Math.max(score, 70);
    if (!triggers.some(r => r.includes("malicious"))) {
      triggers.push("Confirmed malicious payload signature detected");
    }
  }

  // ── Context Analysis ────────────────────────────────────────────────────────
  const qr_data = threat.url || "unknown";
  const contextAnalysis = analyzeContext(qr_data);

  // ── Tamper Detection ────────────────────────────────────────────────────────
  const qrHistory = (history || []).filter(h => h && h.qr_data).map(h => h.qr_data);
  const timeHistory = (history || [])
    .filter(h => h && h.timestamp)
    .map(h => new Date(h.timestamp).getTime());
  const tamperAnalysis = detectTamper(qrHistory, timeHistory);

  if (tamperAnalysis.tamper.is_tampered) {
    score = Math.min(100, score + Math.round(tamperAnalysis.tamper.confidence * 40));
    tamperAnalysis.tamper.indicators.forEach(ind => {
      if (!triggers.includes(ind)) triggers.push(ind);
    });
  }

  // ── Final Score ─────────────────────────────────────────────────────────────
  score = Math.min(100, Math.round(score));

  const status = score >= 65 ? "HIGH_RISK" : score >= 25 ? "MEDIUM_RISK" : "LOW_RISK";
  const action =
    status === "HIGH_RISK" ? "DO NOT PROCEED" :
    status === "MEDIUM_RISK" ? "PROCEED WITH CAUTION" :
    "SAFE TO PROCEED";

  const summary = generateSummary(threat, payment, status);

  const signalCount = triggers.length;
  const baseConfidence = Math.min(0.5 + signalCount * 0.1, 1.0);
  const fusedConfidence =
    (baseConfidence + contextAnalysis.context.confidence + (tamperAnalysis.tamper.confidence || 0)) / 3;

  return {
    final: {
      risk_score: score,
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
    if (payment && payment.is_payment_qr) return "Fraudulent payment request blocked";
    return "Malicious payload detected";
  }
  if (status === "MEDIUM_RISK") {
    if (payment && payment.is_payment_qr) return "Suspicious payment request";
    if (threat.is_url) return "Potentially unsafe URL";
    return "Untrusted data content";
  }
  if (payment && payment.is_payment_qr) return "Verified payment request";
  return "Safe QR code";
}
