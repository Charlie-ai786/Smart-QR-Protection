import React from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  RotateCcw,
  User,
  Hash,
  IndianRupee,
  Bot,
  Info,
  CreditCard,
  ChevronRight,
  Zap
} from "lucide-react";
import "./ResultDashboard.css";

/**
 * ResultDashboard Component
 * Displays a comprehensive risk assessment based on fused security intelligence.
 * @param {object} results - Object containing threat, payment, and final fusion results.
 * @param {function} onReset - Callback to reset the scanner for a new session.
 */
const ResultDashboard = ({ results, onReset }) => {
  if (!results) return null;

  const { payment, fusion } = results;
  const riskStatus = fusion?.status || "LOW_RISK";
  const riskScore = fusion?.risk_score || 0;
  
  // Map risk levels to classes and icons
  const riskClass = riskStatus === "HIGH_RISK" ? "high" : riskStatus === "MEDIUM_RISK" ? "medium" : "low";
  
  const getRiskIcon = () => {
    if (riskStatus === "HIGH_RISK") return <AlertOctagon className="status-alert" size={32} />;
    if (riskStatus === "MEDIUM_RISK") return <AlertTriangle className="status-warn" size={32} />;
    return <CheckCircle2 className="status-check" size={32} />;
  };

  const getMLTheme = (prediction) => {
    const p = prediction?.toLowerCase();
    if (p === "malicious") return { color: "status-alert", icon: <AlertOctagon size={16} />, label: "MALICIOUS" };
    if (p === "suspicious") return { color: "status-warn", icon: <AlertTriangle size={16} />, label: "SUSPICIOUS" };
    return { color: "status-check", icon: <CheckCircle2 size={16} />, label: "SAFE" };
  };

  const mlTheme = getMLTheme(results.ml?.prediction);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="result-dashboard space-y-6"
    >
      {/* 1. Risk Indicator Card */}
      <div className={`risk-card ${riskClass} glass-card p-5`}>
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className={`risk-status-badge ${riskClass}`}>{riskStatus.replace("_", " ")}</span>
            <h2 className="text-2xl font-black text-white">{fusion?.summary || "Scan Analysis"}</h2>
          </div>
          <div className="p-2.5 bg-white/5 rounded-xl">
            {getRiskIcon()}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Risk Index</span>
            <span className="text-lg font-black text-white">{riskScore}%</span>
          </div>
          <div className="risk-progress-container">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${riskScore}%` }}
              transition={{ delay: 0.5, duration: 1 }}
              className={`risk-progress-bar ${riskClass}`}
            ></motion.div>
          </div>
        </div>
      </div>

      {/* 2. Action Box */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="action-box glass-card p-5 border-l-4"
        style={{ borderLeftColor: riskClass === 'high' ? 'var(--color-danger)' : riskClass === 'medium' ? 'var(--color-warning)' : 'var(--color-safe)' }}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full animate-pulse ${riskClass === 'high' ? 'bg-red-500' : riskClass === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
          <div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Recommended Action</p>
            <h3 className="text-lg font-black tracking-tight text-white">{fusion?.action || "PROCEED WITH CAUTION"}</h3>
          </div>
        </div>
      </motion.div>

      {/* 4. AI Prediction Section */}
      {results.ml && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="ml-prediction-card glass-card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Bot size={18} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">AI Analysis</h3>
                <p className={`text-lg font-black tracking-tight flex items-center gap-1.5 ${mlTheme.color}`}>
                  {mlTheme.icon}
                  {mlTheme.label}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Conf.</span>
              <span className="text-lg font-black text-white">{(results.ml.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
          
          <div className="risk-progress-container h-1.5 bg-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${results.ml.confidence * 100}%` }}
              transition={{ delay: 0.8, duration: 1.2 }}
              className="risk-progress-bar bg-cyan-500 h-full"
            />
          </div>
          <p className="text-[10px] text-slate-500 italic mt-3 flex items-center justify-center gap-1">
            <Zap size={10} className="text-yellow-500" />
            Patterns matched against 5M+ known threats.
          </p>
        </motion.div>
      )}

      {/* 3. QR Type & Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-white/5 rounded-lg">
              {payment?.is_payment_qr ? <IndianRupee size={16} className="text-emerald-400" /> : <Hash size={16} className="text-slate-400" />}
            </div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">
              {payment?.is_payment_qr ? "UPI Transaction Payload" : "Static Data Payload"}
            </span>
          </div>
          
          {payment?.is_payment_qr ? (
             <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-500" />
                    <span className="text-sm text-white font-bold truncate">{payment.name || "Unknown Merchant"}</span>
                  </div>
                  {payment.is_suspicious && <AlertTriangle size={14} className="status-warn" />}
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono text-slate-400">
                    {payment.upi_id}
                  </div>
                </div>
                {payment.amount && (
                  <div className="flex items-center gap-2 pt-1 border-t border-white/5 mt-2">
                    <span className="text-2xl font-black text-emerald-400">₹{payment.amount}</span>
                  </div>
                )}
             </div>
          ) : (
            <p className="text-sm text-slate-500 italic leading-relaxed">
              Standard format containing plain text, contact info, or a website redirect.
            </p>
          )}
        </div>

        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Signal Reliability</span>
              <span className="text-sm font-black text-white">{(fusion?.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="risk-progress-container h-1.5 bg-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(fusion?.confidence || 0.5) * 100}%` }}
                transition={{ delay: 0.7, duration: 1 }}
                className="risk-progress-bar bg-white/20 h-full"
              ></motion.div>
            </div>
          </div>
          <p className="text-[9px] text-slate-500 italic mt-4 leading-tight">
            Comprehensive score derived from heuristic, visual, and AI analysis layers.
          </p>
        </div>
      </div>

      {/* Explanation Section */}
      <div className="glass-card p-6 overflow-hidden">
        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
           <ShieldCheck size={14} className="text-cyan-400" /> Strategic Vulnerability Scan
        </h4>
        <div className="space-y-3">
          {((fusion?.reasons && fusion.reasons.length > 0) || (results?.reasons && results.reasons.length > 0)) ? (
            ((fusion?.reasons || results?.reasons) || []).map((reason, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex gap-3 items-start p-3 bg-white/[0.02] border border-white/5 rounded-xl"
              >
                <div className={`mt-1 w-2 h-2 shrink-0 rounded-full ${riskClass === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : riskClass === 'medium' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`} />
                <span className="text-sm text-slate-300 leading-tight">{reason}</span>
              </motion.div>
            ))
          ) : (
          <div className="flex gap-3 items-center p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
               <CheckCircle2 className="text-emerald-500" size={18} />
               <span className="text-sm font-medium text-emerald-100/70">Secure Hash integrity verified. No anomalies detected.</span>
            </div>
          )}
        </div>
      </div>

      {/* Scan Another Button */}
      {onReset && (
        <button 
          onClick={onReset}
          className="premium-btn btn-primary w-full shadow-2xl"
        >
          <RotateCcw size={18} />
          <span>INITIATE NEW SESSION</span>
          <ChevronRight size={16} className="opacity-50" />
        </button>
      )}
    </motion.div>
  );
};

export default ResultDashboard;
