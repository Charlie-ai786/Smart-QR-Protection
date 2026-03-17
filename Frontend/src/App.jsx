import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import { 
  ShieldAlert, 
  ShieldCheck, 
  History as HistoryIcon, 
  QrCode, 
  Scan, 
  ExternalLink,
  ChevronRight,
  Info,
  Copy,
  RotateCcw,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QRGenerator from "./components/QRGenerator";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("scanner");
  const [isScanActive, setIsScanActive] = useState(true);

  const isAnalyzingRef = useRef(false);
  const lastUrlRef = useRef("");
  const scannerRef = useRef(null);

  const analyzeURL = async (targetUrl) => {
    const finalUrl = targetUrl || url;
    if (!finalUrl || (isAnalyzingRef.current && targetUrl) || finalUrl === lastUrlRef.current) return;

    try {
      setLoading(true);
      isAnalyzingRef.current = true;
      lastUrlRef.current = finalUrl;

      // Stop scanner immediately on capture
      if (scannerRef.current) {
        setIsScanActive(false);
        await scannerRef.current.clear();
      }

      const response = await axios.post("http://localhost:5000/analyze", { url: finalUrl });
      setResult(response.data);
      fetchHistory();
      
    } catch (error) {
      console.error("Error analyzing URL:", error);
      isAnalyzingRef.current = false;
      lastUrlRef.current = "";
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setUrl("");
    setIsScanActive(true);
    isAnalyzingRef.current = false;
    lastUrlRef.current = "";
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
    let scanner = null;

    if (activeTab === "scanner" && isScanActive) {
      scannerRef.current = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
      scannerRef.current.render(
        (decodedText) => {
          if (decodedText !== lastUrlRef.current && !isAnalyzingRef.current) {
            setUrl(decodedText);
            analyzeURL(decodedText);
          }
        },
        (error) => {}
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [activeTab, isScanActive]);

  const getStatusColor = (status) => {
    if (status === "Dangerous") return "text-red-400";
    if (status === "Suspicious") return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Navbar */}
      <nav className="p-4 flex justify-between items-center border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-cyan-500 p-1.5 rounded-lg">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">SmartQR <span className="text-cyan-400">Pro</span></h1>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => {
              setActiveTab("scanner");
              resetScanner();
            }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'scanner' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Scanner
          </button>
          <button 
            onClick={() => setActiveTab("generator")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'generator' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Generator
          </button>
        </div>
      </nav>

      <main className="p-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Primary Interaction */}
        <section className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "scanner" && isScanActive ? (
              <motion.div 
                key="scanner"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Scan className="text-cyan-400" />
                  <h2 className="text-2xl font-bold">Safe Scanner</h2>
                </div>

                <div 
                  id="qr-reader" 
                  key={`scanner-${activeTab}`} 
                  className="overflow-hidden rounded-xl border border-white/10 mb-6 bg-black/20 min-h-[300px]"
                ></div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Paste a URL to analyze..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="glass-input pr-12"
                  />
                  <button 
                    onClick={() => analyzeURL()}
                    className="absolute right-2 top-1.5 p-1.5 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {loading && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-cyan-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-400 border-t-transparent"></div>
                    <span className="text-sm font-medium">Deep analysis in progress...</span>
                  </div>
                )}
              </motion.div>
            ) : activeTab === "generator" ? (
              <QRGenerator key="generator" />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 text-center py-12"
              >
                <div className="bg-cyan-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="text-cyan-400 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Scan Finished</h2>
                <p className="text-slate-400 text-sm mb-8">Review the security analysis report to the right.</p>
                <button
                  onClick={resetScanner}
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-xl font-bold transition flex items-center gap-2 mx-auto"
                >
                  <RotateCcw size={18} />
                  Scan Another QR
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Display */}
          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`glass-card p-6 border-l-4 ${
                  result.status === 'Dangerous' ? 'border-l-red-500' : 
                  result.status === 'Suspicious' ? 'border-l-yellow-500' : 'border-l-green-500'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`text-2xl font-black ${getStatusColor(result.status)}`}>
                      {result.status.toUpperCase()}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-slate-400 text-sm font-medium truncate max-w-[180px]">{result.url}</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(result.url);
                          alert("URL copied!");
                        }}
                        className="p-1 hover:bg-white/10 rounded transition text-slate-500 hover:text-white"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black">{result.riskScore}%</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Threat Score</div>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-300">
                    <Info size={14} /> Analysis Report
                  </h4>
                  {result.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-400 bg-white/5 p-2 rounded-lg">
                      <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(result.status).replace('text-', 'bg-')}`} />
                      {reason}
                    </div>
                  ))}
                </div>

                {/* AI Security Tips */}
                <div className="mt-8 bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold text-sm">
                    <Zap size={14} /> Security Pro Tips
                  </div>
                  <ul className="text-xs text-slate-400 space-y-2">
                    {result.status === "Safe" ? (
                      <li>• This URL passed our core heuristic filters. Always double check the domain before entering passwords.</li>
                    ) : (
                      <>
                        <li>• <strong>Caution!</strong> Suspicious links often masquerade as login or payment pages.</li>
                        <li>• Never share your credentials or OTP on unverified links.</li>
                        <li>• Use a secondary browser or VPN if you must visit this site.</li>
                      </>
                    )}
                  </ul>
                </div>

                {result.status === 'Safe' && (
                  <a 
                    href={result.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-6 w-full py-3 bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/20 transition rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={18} /> Visit Safe URL
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right Column: Stats & History */}
        <section className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Safe', count: history.filter(h => h.status === 'Safe').length, color: 'text-green-400' },
              { label: 'Risky', count: history.filter(h => h.status !== 'Safe').length, color: 'text-red-400' },
              { label: 'Total', count: history.length, color: 'text-cyan-400' }
            ].map((stat, i) => (
              <div key={i} className="glass-card p-4 text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="glass-card p-6 h-[500px] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <HistoryIcon size={20} className="text-slate-400" />
              <h2 className="text-xl font-bold">Recent Intelligence</h2>
            </div>
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {history.map((scan) => (
                <div key={scan.id} className="group p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all">
                  <p className="text-xs font-medium text-slate-400 truncate mb-1">{scan.url}</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-bold ${getStatusColor(scan.status)}`}>{scan.status}</span>
                    <span className="text-[10px] font-mono text-slate-600 bg-black/20 px-2 py-0.5 rounded-full">
                      Score: {scan.riskScore}
                    </span>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-sm font-medium">
                  <QrCode size={40} className="mb-2 opacity-20" />
                  No scan history yet
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center py-12 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
        © 2026 SmartQR AI Neural Protection System • V2.0.0
      </footer>
    </div>
  );
}

export default App;