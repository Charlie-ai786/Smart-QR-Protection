require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { checkURLReputation } = require("./utils/reputation");

const app = express();
app.use(cors());
app.use(express.json());

// ── Database Connection ──────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/smart-qr";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ── Schema ───────────────────────────────────────────────────────────────────
const ScanSchema = new mongoose.Schema({
  url: String,
  is_url: Boolean,
  is_malicious: Boolean,
  risk_score: Number,
  reasons: [String],
  status: String,
  timestamp: { type: Date, default: Date.now }
});
const Scan = mongoose.model("Scan", ScanSchema);


async function analyzeThreat(qr_data) {
  let result = {
    url: qr_data,
    is_url: false,
    is_malicious: false,
    risk_score: 0,
    reasons: [],
  };

  try {
    const urlObj = new URL(qr_data);
    result.is_url = true;

    const reputation = await checkURLReputation(qr_data);
    if (reputation.is_malicious) {
      result.is_malicious = true;
      result.risk_score += 50;
      result.reasons.push(`Blacklisted (${reputation.threat_type})`);
    }

    if (!qr_data.startsWith("https")) {
      result.risk_score += 20;
      result.reasons.push("Uses HTTP (not secure)");
    }

    const riskyTLDs = [".xyz", ".top", ".tk", ".ml", ".ga", ".cf", ".gq", ".bid", ".loan", ".zip"];
    if (riskyTLDs.some(tld => qr_data.toLowerCase().endsWith(tld) || qr_data.toLowerCase().includes(tld + "/"))) {
      result.risk_score += 30;
      result.reasons.push("High-risk top-level domain (TLD) detected");
    }

    const shorteners = ["bit.ly", "t.co", "goo.gl", "tinyurl.com", "is.gd", "buff.ly", "ow.ly"];
    if (shorteners.some(s => qr_data.toLowerCase().includes(s))) {
      result.risk_score += 20;
      result.reasons.push("URL shortener used to hide destination");
    }

    const suspiciousKeywords = ["login", "verify", "pay", "bank", "account", "secure", "update", "signin"];
    suspiciousKeywords.forEach((word) => {
      if (qr_data.toLowerCase().includes(word)) {
        result.risk_score += 15;
        result.reasons.push(`Contains sensitive keyword: ${word}`);
      }
    });

    if (qr_data.length > 70) {
      result.risk_score += 15;
      result.reasons.push("Unusually long URL structure");
    }
    if (qr_data.match(/[0-9]{5,}/)) {
      result.risk_score += 15;
      result.reasons.push("Suspicious numeric string pattern");
    }
    if (qr_data.includes("@")) {
      result.risk_score += 25;
      result.reasons.push("Credential redirect pattern (@ symbol)");
    }

  } catch (err) {
    result.is_url = false;
    if (qr_data.length > 500) {
      result.risk_score += 30;
      result.reasons.push("Excessively large data payload");
    }
  }

  result.risk_score = Math.min(result.risk_score, 100);
  result.is_malicious = result.risk_score > 70;
  result.status = result.risk_score >= 75 ? "Dangerous" : (result.risk_score >= 40 ? "Suspicious" : "Safe");
  
  if (result.reasons.length === 0) {
    result.reasons.push("No immediate threats detected");
  }

  return result;
}

app.post("/analyze", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: "URL required" });

  try {
    const analysis = await analyzeThreat(url);
    const newScan = new Scan(analysis);
    await newScan.save();
    res.json(newScan);
  } catch (err) {
    res.status(500).json({ message: "Analysis failed", error: err.message });
  }
});

app.post("/reputation", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: "URL required" });
  
  try {
    const reputation = await checkURLReputation(url);
    res.json(reputation);
  } catch (err) {
    res.status(500).json({ is_malicious: false, threat_type: "error", error: err.message });
  }
});

app.get("/history", async (req, res) => {
  try {
    const history = await Scan.find().sort({ timestamp: -1 }).limit(50);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));