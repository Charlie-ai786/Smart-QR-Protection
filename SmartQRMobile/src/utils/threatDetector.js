import axios from "axios";
import { BASE_URL } from "../config";


/**
 * Threat Detection Module (Async Version with Reputation API)
 */

async function checkURLReputation(url) {
  try {
    // Call the backend reputation endpoint
    const response = await axios.post(`${BASE_URL}/reputation`, { url });
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

  try {
    // 1. Detect if qr_data is a URL
    if (qr_data.match(/^(https?:\/\/|www\.)[\w.-]+(\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/i)) {
      result.is_url = true;
    } else {
       throw new Error("Not a URL");
    }

    // 2. Reputation Check
    const reputation = await checkURLReputation(qr_data);

    if (reputation.is_malicious) {
      result.is_malicious = true;
      result.risk_score += 50;
      result.reason.push(`Blacklisted by Reputation Engine (${reputation.threat_type})`);
    }

    // 3. Insecure Protocol Check
    if (!qr_data.startsWith("https")) {
      result.risk_score += 20;
      result.reason.push("Insecure protocol: Uses HTTP instead of HTTPS.");
    }

    // 4. Suspicious Keywords
    const suspiciousKeywords = ["login", "verify", "bank", "update", "secure", "account", "signin", "password", "gift", "win", "prize", "claim"];
    suspiciousKeywords.forEach((word) => {
      if (qr_data.toLowerCase().includes(word)) {
        result.risk_score += 15;
        result.reason.push(`Contains sensitive keyword: ${word}`);
      }
    });

    // 4b. Suspicious TLDs
    const suspiciousTLDs = [".xyz", ".top", ".buzz", ".gq", ".tk", ".ml", ".cf"];
    if (suspiciousTLDs.some(tld => qr_data.toLowerCase().endsWith(tld) || qr_data.toLowerCase().includes(tld + "/"))) {
      result.risk_score += 25;
      result.reason.push("Suspicious top-level domain (TLD) detected.");
    }

    // 5. IP-based URL
    const ipRegex = /^(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}(\/.*)?$/;
    if (ipRegex.test(qr_data)) {
      result.risk_score += 50;
      result.reason.push("IP-based URL: Uses a numerical IP address.");
    }

    // 6. URL Length
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
  // Lowered threshold to 50 for MEDIUM and 75 for HIGH in fusion
  result.is_malicious = result.risk_score >= 60 || result.is_malicious;
  result.risk_score = Math.min(result.risk_score, 100);

  // Add a generic reason if risk is high but no reason given (unexpected)
  if (result.risk_score > 0 && result.reason.length === 0) {
    result.reason.push("Heuristic risk detected in payload structure.");
  }

  return { threat: result };
}
