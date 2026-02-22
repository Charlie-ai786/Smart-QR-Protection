import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const analyzeURL = async (targetUrl) => {
  const finalUrl = targetUrl || url;
  if (!finalUrl) return;

  try {
    setLoading(true);

    const response = await axios.post(
      "http://localhost:5000/analyze",
      { url: finalUrl }
    );

    setResult(response.data);
    fetchHistory();
  } catch (error) {
    console.error("Error analyzing URL:", error);
  } finally {
    setLoading(false);
  }
};

  const fetchHistory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/history");
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  useEffect(() => {
  fetchHistory();

  const scanner = new Html5QrcodeScanner(
    "qr-reader",
    { fps: 5, qrbox: 250 },
    false
  );

  scanner.render(
    (decodedText) => {
      setUrl(decodedText);
      analyzeURL(decodedText);
    },
    (error) => {}
  );

  return () => {
    scanner.clear().catch(() => {});
  };
}, []);

  const getStatusColor = (status) => {
    if (status === "Dangerous") return "text-red-500";
    if (status === "Suspicious") return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black text-white p-6">
      <div className="text-center mb-8">
  <h1 className="text-5xl font-extrabold text-cyan-400">
    Smart QR Code Protection
  </h1>
  <p className="text-gray-400 mt-2">
    Detect malicious QR codes, phishing links & fake payment redirects instantly.
  </p>
</div>
      <div className="max-w-md mx-auto bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg">
        <div id="qr-reader" className="max-w-md mx-auto mb-6"></div>
        <input
          type="text"
          placeholder="Enter QR URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-cyan-500 outline-none"
        />

        <button
  onClick={() => analyzeURL()}
  className="w-full mt-4 py-2 bg-cyan-500 hover:bg-cyan-600 transition rounded font-semibold"
>
  {loading ? "Analyzing..." : "Analyze QR"}
</button>
      </div>

      {result && (
       <div className="flex justify-center my-4">
  <div className="relative w-32 h-32">
    <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
      {result.riskScore}%
    </div>
    <svg className="w-32 h-32 transform -rotate-90">
      <circle
        cx="64"
        cy="64"
        r="54"
        stroke="gray"
        strokeWidth="8"
        fill="none"
      />
      <circle
        cx="64"
        cy="64"
        r="54"
        stroke={
          result.status === "Dangerous"
            ? "red"
            : result.status === "Suspicious"
            ? "yellow"
            : "green"
        }
        strokeWidth="8"
        fill="none"
        strokeDasharray={`${(result.riskScore / 100) * 339} 339`}
      />
    </svg>
  </div>
</div>
      )}

<div className="max-w-md mx-auto mt-8 grid grid-cols-3 gap-4 text-center">
  <div className="bg-gray-800 p-3 rounded">
    <p className="text-green-400 font-bold">
      {history.filter(h => h.status === "Safe").length}
    </p>
    <p className="text-sm">Safe</p>
  </div>
  <div className="bg-gray-800 p-3 rounded">
    <p className="text-yellow-400 font-bold">
      {history.filter(h => h.status === "Suspicious").length}
    </p>
    <p className="text-sm">Suspicious</p>
  </div>
  <div className="bg-gray-800 p-3 rounded">
    <p className="text-red-400 font-bold">
      {history.filter(h => h.status === "Dangerous").length}
    </p>
    <p className="text-sm">Dangerous</p>
  </div>
</div>
      <div className="max-w-md mx-auto mt-8">
        <h3 className="text-xl font-semibold mb-2">Scan History</h3>
        {history.map((scan) => (
          <div key={scan.id} className="bg-gray-800 p-3 mb-2 rounded">
            <p className="text-sm break-all">{scan.url}</p>
            <p className={`font-semibold ${getStatusColor(scan.status)}`}>
              {scan.status}
            </p>
          </div>
        ))}
      </div>
      <div className="text-center text-gray-500 mt-12 text-sm">
  © 2026 Smart QR Threat Detection System | Built with React & Node.js
</div>
    </div>
    
  );
  
}

export default App;