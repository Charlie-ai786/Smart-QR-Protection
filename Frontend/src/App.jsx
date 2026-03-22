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
  Home,
  Zap,
  Bot,
  Activity,
  CheckCircle2,
  AlertOctagon
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
import LandingPage from "./components/LandingPage";
import { saveScan, getHistory } from "./utils/storage";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [appFlow, setAppFlow] = useState("scanner"); // scanner, processing, result
  const [activeTab, setActiveTab] = useState("scanner");
  const [showLanding, setShowLanding] = useState(true);

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
      const localAnalysis = await analyzeThreat(finalUrl);
      const paymentAnalysis = analyzePayment(finalUrl);

      // 3. Perform Final Risk Fusion
      const fusedResult = fuseRisk(localAnalysis.threat, paymentAnalysis.payment.is_payment_qr ? paymentAnalysis.payment : null, history);

      // 4. Supplement with Backend Analysis
      try {
        const response = await axios.post("http://localhost:5000/analyze", { url: finalUrl }, { timeout: 5000 });
        const scanToSave = {
          ...response.data,
          qr_data: finalUrl, // Ensure qr_data is present for history
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
          qr_data: finalUrl, // Ensure qr_data is present for history
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

  if (showLanding) {
    return (
      <LandingPage 
        onStartScan={() => { setActiveTab("scanner"); setShowLanding(false); resetScanner(); }} 
        onViewHistory={() => { setActiveTab("history"); setShowLanding(false); }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Background Decorative Element */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none -mr-48 -mt-48 z-0"></div>
      
      {/* Navbar */}
      <nav className="px-6 py-4 flex justify-between items-center border-b border-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setShowLanding(true)}>
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase">QR<span className="text-cyan-400">Shield</span></h1>
        </div>
        
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setShowLanding(true)}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            title="Home"
          >
            <Home size={18} />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1"></div>
          <button 
            onClick={() => {
              setActiveTab("scanner");
              resetScanner();
            }}
            className={`px-5 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'scanner' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'text-slate-500 hover:text-white'}`}
          >
            Scanner
          </button>
          <button 
            onClick={() => setActiveTab("generator")}
            className={`px-5 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'generator' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'text-slate-500 hover:text-white'}`}
          >
            Generator
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 p-4 lg:p-8 max-w-5xl mx-auto grid lg:grid-cols-[1.1fr,0.9fr] gap-8 items-start">
        {/* Left Column: Primary Interaction Flow */}
        <section className="space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === "scanner" ? (
              <motion.div 
                key="scanner-flow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-white tracking-tight uppercase">Security Scanner</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-500/80 uppercase">Active</span>
                  </div>
                </div>
                
                {appFlow === "scanner" && (
                  <Scanner 
                    url={url} 
                    setUrl={setUrl} 
                    onScanSuccess={(res) => analyzeURL(res.qr_data)}
                    onAnalyze={analyzeURL}
                  />
                )}
                
                {appFlow === "processing" && (
                  <Processing />
                )}

                {appFlow === "result" && result && (
                  <Result 
                    results={result} 
                    onReset={resetScanner} 
                  />
                )}
              </motion.div>
            ) : (
              <QRGenerator key="generator" />
            )}
          </AnimatePresence>
        </section>

        {/* Right Column: Stats & History */}
        <section className="space-y-8">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Verified', count: history.filter(h => h.status === 'Safe').length, color: 'text-emerald-400', icon: <CheckCircle2 size={12} /> },
              { label: 'Threats', count: history.filter(h => h.status !== 'Safe').length, color: 'text-red-400', icon: <AlertOctagon size={12} /> },
              { label: 'Total Logs', count: history.length, color: 'text-cyan-400', icon: <Activity size={12} /> }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="glass-card p-5 text-center flex flex-col items-center gap-2"
              >
                <div className={`p-1.5 rounded-lg bg-white/5 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className={`text-2xl font-black ${stat.color}`}>{stat.count}</div>
                <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="glass-card p-6 min-h-[500px] flex flex-col">
            <header className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <HistoryIcon size={16} className="text-slate-500" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Security History</h3>
              </div>
              <div className="px-2 py-1 bg-white/5 rounded text-[8px] font-black text-slate-500 uppercase">
                Real-time
              </div>
            </header>
            <div className="flex-1">
              <HistoryDashboard 
                history={history} 
                onHistoryChange={setHistory} 
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center py-12 text-slate-700 text-[9px] font-black uppercase tracking-[0.3em]">
        Neural Protection Engine V2.5.0 • © 2026 QRShield Security
      </footer>
    </div>
  );
}

export default App;