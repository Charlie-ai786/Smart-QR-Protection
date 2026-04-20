import axios from "axios";
import { BASE_URL } from "../config";

/**
 * Threat Detection Module — Fixed URL detection + expanded heuristics
 */

async function checkURLReputation(url) {
  try {
    const response = await axios.post(`${BASE_URL}/reputation`, { url }, { timeout: 3000 });
    return response.data;
  } catch {
    console.warn("Reputation API unavailable, falling back to heuristics.");
    return { is_malicious: false, threat_type: "unknown" };
  }
}

/**
 * Analyzes the given QR data for potential threats.
 * @param {string} qr_data - The raw data decoded from a QR code.
 */
export async function analyzeThreat(qr_data) {
  let result = {
    is_url: false,
    is_malicious: false,
    risk_score: 0,
    reason: [],
    url: qr_data
  };

  if (!qr_data) return { threat: result };

  // Use native URL parser — far more reliable than any regex
  let parsedUrl = null;
  try {
    parsedUrl = new URL(qr_data.trim());
    result.is_url = true;
  } catch {
    result.is_url = false;
  }

  if (result.is_url && parsedUrl) {
    const hostname = parsedUrl.hostname.toLowerCase();
    const fullUrl = qr_data.toLowerCase();

    // 1. Reputation Check (backend)
    const reputation = await checkURLReputation(qr_data);
    if (reputation.is_malicious) {
      result.is_malicious = true;
      result.risk_score += 50;
      result.reason.push(`Blacklisted by Reputation Engine (${reputation.threat_type})`);
    }

    // 2. Insecure Protocol (HTTP vs HTTPS)
    if (parsedUrl.protocol === 'http:') {
      result.risk_score += 20;
      result.reason.push("Insecure protocol: Uses HTTP instead of HTTPS.");
    }

    // 3. Suspicious Keywords in URL
    const suspiciousKeywords = [
      "login", "verify", "bank", "update", "secure", "account",
      "signin", "password", "gift", "win", "prize", "claim",
      "free", "urgent", "suspend", "alert", "confirm", "validate",
      "credential", "paypal", "wallet", "recover"
    ];
    suspiciousKeywords.forEach(word => {
      if (fullUrl.includes(word)) {
        result.risk_score += 15;
        result.reason.push(`Sensitive keyword detected: "${word}"`);
      }
    });

    // 4. Suspicious TLDs
    const suspiciousTLDs = [
      ".xyz", ".top", ".buzz", ".gq", ".tk", ".ml",
      ".cf", ".click", ".loan", ".bid", ".win", ".zip", ".work", ".rest"
    ];
    if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) {
      result.risk_score += 30;
      result.reason.push("High-risk top-level domain (TLD) detected.");
    }

    // 5. IP-based URL (direct IP access = suspicious)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(hostname)) {
      result.risk_score += 50;
      result.reason.push("IP-based URL: Uses a raw IP address instead of domain name.");
    }

    // 6. Unusually long URL
    if (qr_data.length > 100) {
      result.risk_score += 20;
      result.reason.push(`Unusually long URL structure (${qr_data.length} chars).`);
    }

    // 7. URL Shorteners (hides real destination)
    const shorteners = [
      "bit.ly", "t.co", "goo.gl", "tinyurl.com", "is.gd",
      "buff.ly", "ow.ly", "short.io", "bl.ink", "cutt.ly"
    ];
    if (shorteners.some(s => hostname.includes(s))) {
      result.risk_score += 20;
      result.reason.push("URL shortener detected — real destination is hidden.");
    }

    // 8. @ symbol phishing redirect
    if (qr_data.includes("@")) {
      result.risk_score += 30;
      result.reason.push("Credential redirect pattern (@) detected in URL.");
    }

    // 9. Excessive subdomain nesting
    const domainParts = hostname.split(".");
    if (domainParts.length > 4) {
      result.risk_score += 20;
      result.reason.push(`Excessive subdomain nesting detected (${domainParts.length} levels).`);
    }

    // 10. Numeric strings (encoded session/phishing paths)
    if (/[0-9]{8,}/.test(qr_data)) {
      result.risk_score += 15;
      result.reason.push("Long numeric string pattern detected in URL.");
    }

  } else {
    // Non-URL payload analysis
    if (qr_data.length > 500) {
      result.risk_score += 30;
      result.reason.push("Excessively large data payload.");
    }
    const dangerousPatterns = [
      "sudo", "rm -rf", "<script", "javascript:", "exec(", "eval(", "cmd.exe", "powershell"
    ];
    dangerousPatterns.forEach(cmd => {
      if (qr_data.toLowerCase().includes(cmd.toLowerCase())) {
        result.risk_score += 60;
        result.reason.push(`Dangerous command/script pattern: "${cmd}"`);
      }
    });
  }

  // Finalize
  result.is_malicious = result.risk_score >= 60 || result.is_malicious;
  result.risk_score = Math.min(result.risk_score, 100);

  if (result.risk_score > 0 && result.reason.length === 0) {
    result.reason.push("Heuristic risk detected in payload structure.");
  }

  return { threat: result };
}
