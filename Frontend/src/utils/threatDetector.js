/**
 * Threat Detection Module
 * 
 * This module provides functions to analyze QR code data for potential security threats.
 * It uses heuristic-based checks for URLs and non-URL payloads.
 */

/**
 * Analyzes the given QR data for potential threats.
 * @param {string} qr_data - The raw data decoded from a QR code.
 * @returns {object} - An object containing threat analysis results.
 */
export function analyzeThreat(qr_data) {
  // Initialize threat report
  const threat = {
    is_url: false,
    is_malicious: false,
    risk_score: 0,
    reason: []
  };

  if (!qr_data) {
    return { threat };
  }

  // 1. Detect if qr_data is a URL
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
  const ipRegex = /^(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}(\/.*)?$/;
  
  const isUrl = urlRegex.test(qr_data) || ipRegex.test(qr_data);
  threat.is_url = isUrl;

  if (isUrl) {
    analyzeUrlThreat(qr_data, threat);
  } else {
    analyzePayloadThreat(qr_data, threat);
  }

  // Finalize malicious status based on risk score
  // Safe: 0-30, Medium: 31-70, High: 71-100
  threat.is_malicious = threat.risk_score > 70;
  
  // Cap risk score at 100
  threat.risk_score = Math.min(threat.risk_score, 100);

  return { threat };
}

/**
 * Heuristic checks for URL-based threats
 */
function analyzeUrlThreat(url, threat) {
  // Check 1: Insecure Protocol (HTTP vs HTTPS)
  if (url.startsWith("http://")) {
    threat.risk_score += 25;
    threat.reason.push("Insecure protocol: Uses HTTP instead of encrypted HTTPS.");
  }

  // Check 2: Suspicious Keywords
  const suspiciousKeywords = ["login", "verify", "bank", "update", "secure", "account", "signin", "password"];
  const lowerUrl = url.toLowerCase();
  const matchedKeywords = suspiciousKeywords.filter(keyword => lowerUrl.includes(keyword));
  
  if (matchedKeywords.length > 0) {
    threat.risk_score += (matchedKeywords.length * 15);
    threat.reason.push(`Suspicious keywords detected: ${matchedKeywords.join(", ")} (common phishing patterns).`);
  }

  // Check 3: IP-based URL (Attacker infrastructure often uses raw IPs)
  const ipRegex = /^(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}(\/.*)?$/;
  if (ipRegex.test(url)) {
    threat.risk_score += 50;
    threat.reason.push("IP-based URL: Uses a numerical IP address instead of a domain name.");
  }

  // Check 4: URL Length (Obfuscation)
  if (url.length > 100) {
    threat.risk_score += 20;
    threat.reason.push(`Unusually long URL (${url.length} chars), often used to hide malicious domains.`);
  }

  // Check 5: Multiple Subdomains (Subdomain Squatting/Phishing)
  const domainPart = url.replace(/https?:\/\//, "").split("/")[0];
  const subdomainCount = domainPart.split(".").length - 2; // -2 for domain and TLD
  if (subdomainCount > 3) {
    threat.risk_score += 25;
    threat.reason.push(`High number of subdomains (${subdomainCount}), frequently seen in phishing campaigns.`);
  }
}

/**
 * Heuristic checks for non-URL payload threats
 */
function analyzePayloadThreat(data, threat) {
  // Check 1: Random Encoded Strings (Base64-like patterns)
  // Simple check for base64: length multiple of 4, only alphanumeric + / +
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  if (data.length > 20 && base64Regex.test(data)) {
    threat.risk_score += 40;
    threat.reason.push("Suspicious encoding: The payload appears to be Base64 encoded, possibly hiding malicious commands.");
  }

  // Check 2: Command/Instruction injection
  const dangerousCommands = ["sudo", "system", "exec", "eval", "rm -rf", "cmd", "powershell"];
  const lowerData = data.toLowerCase();
  const foundCommands = dangerousCommands.filter(cmd => lowerData.includes(cmd));
  
  if (foundCommands.length > 0) {
    threat.risk_score += 60;
    threat.reason.push(`Potentially dangerous commands detected: ${foundCommands.join(", ")}.`);
  }

  // Check 3: Data length (Buffer overflow or large data exfiltration attempt)
  if (data.length > 500) {
    threat.risk_score += 30;
    threat.reason.push(`Excessively large data payload (${data.length} characters).`);
  }

  // If no threats found, set simple defaults
  if (threat.risk_score === 0) {
    threat.reason.push("Plain text data with no recognizable malicious patterns.");
  }
}
