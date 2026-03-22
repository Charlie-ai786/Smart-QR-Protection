import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  ShieldAlert, 
  ShieldCheck, 
  History as HistoryIcon, 
  QrCode, 
  Scan, 
  ExternalLink,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QRGenerator from "./components/QRGenerator";
import QRScanner from "./components/QRScanner";
import { analyzeThreat } from "./utils/threatDetector";
import { analyzePayment } from "./utils/paymentVerifier";
import { fuseRisk } from "./utils/riskFusionEngine";
import ResultDashboard from "./components/ResultDashboard";
import Scanner from "./components/Scanner";
import Processing from "./components/Processing";
import Result from "./components/Result";
import HistoryDashboard from "./components/HistoryDashboard";
import { saveScan, getHistory } from "./utils/storage";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [appFlow, setAppFlow] = useState("scanner"); // scanner, processing, result
  const [activeTab, setActiveTab] = useState("scanner");

  const isAnalyzingRef = useRef(false);
  const lastUrlRef = useRef("");

  const analyzeURL = async (targetUrl) => {
    const finalUrl = targetUrl || url;
    if (!finalUrl || (isAnalyzingRef.current && targetUrl) || finalUrl === lastUrlRef.current) return;

    try {
      setAppFlow("processing");
      isAnalyzingRef.current = true;
      lastUrlRef.current = finalUrl;

      // Simulate deep analysis delay for UX
      await new Promise(r => setTimeout(r, 1000));

      // 1. Perform Local Security Analysis
      const localAnalysis = analyzeThreat(finalUrl);
      const paymentAnalysis = analyzePayment(finalUrl);
      console.log("Local Analysis:", { localAnalysis, paymentAnalysis });

      // 3. Perform Final Risk Fusion
      const fusedResult = fuseRisk(localAnalysis.threat, paymentAnalysis.payment.is_payment_qr ? paymentAnalysis.payment : null, history);
      console.log("Risk Fusion Result:", fusedResult);

      // 4. Supplement with Backend Analysis
      try {
        const response = await axios.post("http://localhost:5000/analyze", { url: finalUrl }, { timeout: 5000 });
        const scanToSave = {
          ...response.data,
          payment: paymentAnalysis.payment.is_payment_qr ? paymentAnalysis.payment : null,
          fusion: fusedResult.final,
          threat: localAnalysis.threat
        };
        setResult(scanToSave);
        saveScan(scanToSave);
      } catch (backendError) {
        console.warn("Backend analysis failed, using local result:", backendError);
        const localScan = {
          id: Date.now(),
          url: finalUrl,
          threat: localAnalysis.threat,
          payment: paymentAnalysis.payment,
          fusion: fusedResult.final,
          riskScore: fusedResult.final.risk_score,
          status: fusedResult.final.status === "HIGH_RISK" ? "Dangerous" : (fusedResult.final.status === "MEDIUM_RISK" ? "Suspicious" : "Safe"),
          reasons: [...localAnalysis.threat.reason]
        };
        setResult(localScan);
        saveScan(localScan);
      }
      
      setAppFlow("result");
      setHistory(getHistory()); // Immediately update history from local storage
    } catch (error) {
      console.error("Error in analysis flow:", error);
      setAppFlow("scanner");
    } finally {
      isAnalyzingRef.current = false;
      lastUrlRef.current = "";
    }
  };

  const resetScanner = () => {
    setResult(null);
    setUrl("");
    setAppFlow("scanner");
    isAnalyzingRef.current = false;
    lastUrlRef.current = "";
  };


  useEffect(() => {
    // Load local history on mount
    setHistory(getHistory());
  }, [activeTab]);


  const getStatusColor = (status) => {
    switch (status) {
      case "Safe": return "text-green-400";
      case "Dangerous": return "text-red-400";
      case "Suspicious": return "text-yellow-400";
      default: return "text-slate-400";
    }
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
      {/* Main Content Area */}
      <main className="p-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Primary Interaction Flow */}
        <section className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "scanner" ? (
              <div key="scanner-flow">
                {appFlow === "scanner" && (
                  <Scanner 
                    url={url} 
                    setUrl={setUrl} 
                    onScanSuccess={(res) => analyzeURL(res.qr_data)}
                    onAnalyze={analyzeURL}
                  />
                )}
                
                {appFlow === "processing" && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass-card"
                  >
                    <Processing />
                  </motion.div>
                )}

                {appFlow === "result" && result && (
                  <Result 
                    results={result} 
                    onReset={resetScanner} 
                  />
                )}
              </div>
            ) : (
              <QRGenerator key="generator" />
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

          <div className="glass-card p-6 min-h-[500px]">
            <HistoryDashboard 
              history={history} 
              onHistoryChange={setHistory} 
            />
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