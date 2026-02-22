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

  if (url.includes("http://")) {
  riskScore += 10;
  reasons.push("Non-secure HTTP connection detected");
}

if (url.match(/[0-9]{5,}/)) {
  riskScore += 10;
  reasons.push("Random numeric pattern in URL");
}

  if (!url) {
    return res.status(400).json({ message: "URL required" });
  }

  if (url.includes("login") || url.includes("verify") || url.includes("payment")) {
    riskScore += 40;
    reasons.push("Suspicious keyword detected");
  }

  if (url.length > 60) {
    riskScore += 20;
    reasons.push("Unusually long URL structure");
  }

  if (url.includes("@")) {
    riskScore += 20;
    reasons.push("Possible redirect pattern");
  }

  if (riskScore === 0) {
    reasons.push("No suspicious patterns detected");
  }

  const status =
    riskScore > 60
      ? "Dangerous"
      : riskScore > 30
      ? "Suspicious"
      : "Safe";

  const result = {
    id: Date.now(),
    url,
    riskScore,
    status,
    reasons,
  };

  scanHistory.unshift(result);

  res.json(result);
});

app.get("/history", (req, res) => {
  res.json(scanHistory);
});

app.listen(5000, () => console.log("Server running on port 5000"));