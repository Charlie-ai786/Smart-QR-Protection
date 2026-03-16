const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let scanHistory = [];

app.post("/analyze", (req, res) => {
  const { url } = req.body;

  let riskScore = 0;
  let reasons = [];

  if (!url) {
    return res.status(400).json({ message: "URL required" });
  }

  // 1. SSL Check
  if (url.startsWith("http://")) {
    riskScore += 25;
    reasons.push("Non-secure HTTP connection (unencrypted)");
  }

  // 2. Suspicious TLDs
  const riskyTLDs = [".xyz", ".top", ".tk", ".ml", ".ga", ".cf", ".gq", ".bid", ".loan", ".zip"];
  if (riskyTLDs.some(tld => url.toLowerCase().endsWith(tld) || url.toLowerCase().includes(tld + "/"))) {
    riskScore += 30;
    reasons.push("High-risk top-level domain (TLD) detected");
  }

  // 3. URL Shorteners
  const shorteners = ["bit.ly", "t.co", "goo.gl", "tinyurl.com", "is.gd", "buff.ly", "ow.ly"];
  if (shorteners.some(s => url.toLowerCase().includes(s))) {
    riskScore += 20;
    reasons.push("URL shortener used to hide destination");
  }

  // 4. Keywords
  const keywords = ["login", "verify", "payment", "bank", "account", "secure", "update", "signin"];
  if (keywords.some(k => url.toLowerCase().includes(k))) {
    riskScore += 35;
    reasons.push("Sensitive keyword detected in path");
  }

  // 5. Length & Patterns
  if (url.length > 70) {
    riskScore += 15;
    reasons.push("Unusually long URL structure");
  }
  if (url.match(/[0-9]{5,}/)) {
    riskScore += 15;
    reasons.push("Suspicious numeric string pattern");
  }
  if (url.includes("@")) {
    riskScore += 25;
    reasons.push("Credential redirect pattern (@ symbol)");
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  const status =
    riskScore >= 75
      ? "Dangerous"
      : riskScore >= 40
      ? "Suspicious"
      : "Safe";

  const result = {
    id: Date.now(),
    url,
    riskScore,
    status,
    reasons: reasons.length > 0 ? reasons : ["No immediate threats detected"],
  };

  scanHistory.unshift(result);

  res.json(result);
});

app.get("/history", (req, res) => {
  res.json(scanHistory);
});

app.listen(5000, () => console.log("Server running on port 5000"));