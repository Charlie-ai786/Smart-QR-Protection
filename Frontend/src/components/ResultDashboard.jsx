import React from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Info, 
  CreditCard, 
  AlertTriangle, 
  RotateCcw,
  User,
  Hash,
  IndianRupee,
  CheckCircle2
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

  const { threat, payment, fusion } = results;
  const riskStatus = fusion?.status || "LOW_RISK";
  const riskScore = fusion?.risk_score || 0;
  
  // Map risk levels to classes and icons
  const riskClass = riskStatus === "HIGH_RISK" ? "high" : riskStatus === "MEDIUM_RISK" ? "medium" : "low";
  
  const getRiskIcon = () => {
    if (riskStatus === "HIGH_RISK") return <ShieldAlert className="text-red-400" size={32} />;
    if (riskStatus === "MEDIUM_RISK") return <AlertTriangle className="text-yellow-400" size={32} />;
    return <ShieldCheck className="text-green-400" size={32} />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="result-dashboard"
    >
      {/* 1. Risk Indicator Card */}
      <div className={`risk-card ${riskClass}`}>
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <span className="risk-status-badge">{riskStatus.replace("_", " ")}</span>
            <h2 className="text-3xl font-black text-white">{fusion?.summary || "Scan Analysis"}</h2>
          </div>
          {getRiskIcon()}
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Risk Index</span>
            <span className="text-xl font-black text-white">{riskScore}%</span>
          </div>
          <div className="risk-progress-container">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${riskScore}%` }}
              transition={{ delay: 0.5, duration: 1 }}
              className="risk-progress-bar"
            ></motion.div>
          </div>
        </div>
      </div>

      {/* 2. Action Box */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="action-box text-white"
      >
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Recommended Action</p>
        <h3 className="text-xl font-black tracking-tighter">{fusion?.action || "PROCEED WITH CAUTION"}</h3>
      </motion.div>

      {/* 3. QR Type & Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* QR Type Info */}
        <div className="qr-type-info">
          <div className="flex items-center gap-2 mb-3">
            {payment?.is_payment_qr ? <CreditCard size={16} className="text-cyan-400" /> : <Hash size={16} className="text-slate-400" />}
            <span className="text-xs font-bold text-slate-300">
              {payment?.is_payment_qr ? "UPI Payment Format" : "Standard Data/URL Format"}
            </span>
          </div>
          
          {payment?.is_payment_qr ? (
             <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-500" />
                  <span className="text-sm text-white font-medium truncate">{payment.name || "Anonymous Payee"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-slate-500" />
                  <span className="text-sm text-slate-400 font-mono text-xs">{payment.upi_id}</span>
                </div>
                {payment.amount && (
                  <div className="flex items-center gap-2 pt-1">
                    <IndianRupee size={16} className="text-cyan-400" />
                    <span className="text-lg font-black text-cyan-400">₹{payment.amount}</span>
                  </div>
                )}
             </div>
          ) : (
            <p className="text-sm text-slate-400 italic">This code contains general data or a web link.</p>
          )}
        </div>

        {/* Confidence Meter */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-center gap-3">
          <div className="confidence-section">
             <span>Confidence Meter</span>
             <span>{(fusion?.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="confidence-meter-container">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(fusion?.confidence || 0.5) * 100}%` }}
              transition={{ delay: 0.7, duration: 1 }}
              className="confidence-meter-fill"
            ></motion.div>
          </div>
          <p className="text-[9px] text-slate-500 italic">Based on multi-layer signal reliability.</p>
        </div>
      </div>

      {/* Tamper Protection Section */}
      {fusion?.tamper && (
        <div className={`bg-white/[0.03] border ${fusion.tamper.is_tampered ? 'border-red-500/30 bg-red-500/5' : 'border-white/5'} rounded-2xl p-5 mb-6 transition-colors`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShieldAlert size={18} className={fusion.tamper.is_tampered ? 'text-red-400' : 'text-slate-400'} />
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tamper Protection</h3>
            </div>
            {fusion.tamper.is_tampered && (
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500 text-white animate-pulse">
                SUSPICIOUS
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-500 font-bold uppercase">Stability Score</span>
              <span className={`font-mono font-bold ${fusion.tamper.is_tampered ? 'text-red-400' : 'text-green-400'}`}>
                {Math.round((1 - fusion.tamper.confidence) * 100)}%
              </span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(1 - fusion.tamper.confidence) * 100}%` }}
                className={`h-full ${fusion.tamper.is_tampered ? 'bg-red-500' : 'bg-green-500'}`}
              />
            </div>

            {fusion.tamper.indicators.length > 0 && (
              <ul className="mt-4 space-y-2">
                {fusion.tamper.indicators.map((indicator, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-slate-400 leading-tight">
                    <AlertTriangle size={12} className="text-red-500 shrink-0 mt-0.5" />
                    {indicator}
                  </li>
                ))}
              </ul>
            )}
            
            {!fusion.tamper.is_tampered && (
              <p className="text-[10px] text-slate-500 italic mt-2">
                Scan session appears stable. No physical or digital overlays detected.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Semantic Intent & Risk Hint */}
      {fusion?.context && fusion.context.type !== "UNKNOWN" && (
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Info size={18} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Semantic Analysis</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Detected Intent</p>
              <p className="text-sm text-slate-200 font-medium leading-relaxed">
                {fusion.context.intent}
              </p>
            </div>
            <div className="flex gap-3 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
              <ShieldCheck size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-cyan-400 uppercase mb-1">Safety Advice</p>
                <p className="text-sm text-cyan-50/70 italic">
                  "{fusion.context.risk_hint}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Explanation Section (Heuristic Reasons) */}
      <div className="explanation-section">
        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 mb-1">
           <Info size={12} /> Security Breakdown
        </h4>
        <div className="space-y-2">
          {((fusion?.reasons && fusion.reasons.length > 0) || (results?.reasons && results.reasons.length > 0)) ? (
            (fusion?.reasons || results?.reasons).map((reason, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="reason-item"
              >
                <div className={`mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full ${riskClass === 'high' ? 'bg-red-500' : riskClass === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                <span>{reason}</span>
              </motion.div>
            ))
          ) : (
            <div className="reason-item">
               <CheckCircle2 className="text-green-500" size={16} />
               <span>All core heuristic security checks passed.</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. Scan Another Button */}
      {onReset && (
        <button 
          onClick={onReset}
          className="reset-btn"
        >
          <RotateCcw size={18} />
          Scan Another QR Code
        </button>
      )}
    </motion.div>
  );
};

export default ResultDashboard;
