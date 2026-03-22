import axios from "axios";

/**
 * Threat Detection Module (Async Version with Reputation API)
 */

async function checkURLReputation(url) {
  try {
    // Call the backend reputation endpoint
    const response = await axios.post("http://localhost:5000/reputation", { url });
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
  };

  if (!qr_data) return { threat: result };

  try {
    // 1. Detect if qr_data is a URL
    new URL(qr_data);
    result.is_url = true;

    // 🔥 NEW: Reputation Check (Module 2)
    const reputation = await checkURLReputation(qr_data);

    if (reputation.is_malicious) {
      result.is_malicious = true;
      result.risk_score += 50;
      result.reason.push(`Blacklisted by Reputation Engine (${reputation.threat_type})`);
    }

    // 2. Insecure Protocol Check
    if (!qr_data.startsWith("https")) {
      result.risk_score += 20;
      result.reason.push("Insecure protocol: Uses HTTP instead of HTTPS.");
    }

    // 3. Suspicious Keywords
    const suspiciousKeywords = ["login", "verify", "bank", "update", "secure", "account", "signin", "password"];
    suspiciousKeywords.forEach((word) => {
      if (qr_data.toLowerCase().includes(word)) {
        result.risk_score += 15;
        result.reason.push(`Contains sensitive keyword: ${word}`);
      }
    });

    // 4. IP-based URL
    const ipRegex = /^(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}(\/.*)?$/;
    if (ipRegex.test(qr_data)) {
      result.risk_score += 50;
      result.reason.push("IP-based URL: Uses a numerical IP address.");
    }

    // 5. URL Length
    if (qr_data.length > 100) {
      result.risk_score += 20;
      result.reason.push(`Unusually long URL structure (${qr_data.length} chars).`);
    }

  } catch {
    result.is_url = false;
    // Basic payload analysis for non-URLs
    if (qr_data.length > 500) {
      result.risk_score += 30;
      result.reason.push("Excessively large data payload.");
    }
    const dangerousCommands = ["sudo", "rm -rf", "exec", "eval"];
    dangerousCommands.forEach(cmd => {
      if (qr_data.toLowerCase().includes(cmd)) {
        result.risk_score += 60;
        result.reason.push(`Potentially dangerous command detected: ${cmd}`);
      }
    });
  }

  // Finalize malicious status based on risk score
  result.is_malicious = result.risk_score > 70 || result.is_malicious;
  result.risk_score = Math.min(result.risk_score, 100);

  return { threat: result };
}
