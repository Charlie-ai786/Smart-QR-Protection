import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Search, Cpu } from "lucide-react";

/**
 * Processing Component
 * A high-end loading screen that simulates deep security analysis.
 */
const Processing = () => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const steps = [
    "Scanning QR...",
    "Analyzing threat...",
    "Checking payment...",
    "Running AI model...",
    "Finalizing results..."
  ];

  useEffect(() => {
    const totalDuration = 4000; // 4 seconds
    const intervalTime = totalDuration / steps.length;
    
    const interval = setInterval(() => {
      setStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, intervalTime);

    const progressInterval = setInterval(() => {
      setProgress((p) => (p < 100 ? p + 1 : 100));
    }, totalDuration / 100);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-10 p-8 text-center bg-transparent">
      {/* Central Animated Icon Section */}
      <div className="relative mb-4">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full border-[1px] border-cyan-500/10 border-t-cyan-400 border-r-purple-500 flex items-center justify-center relative z-10 bg-slate-900/40 backdrop-blur-sm"
        >
          <div className="absolute inset-2 rounded-full border-[1px] border-white/5 animate-pulse"></div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Cpu className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" size={48} />
          </motion.div>
        </motion.div>
        
        {/* Advanced Pulsing Effects */}
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.8, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute inset-0 bg-cyan-600 rounded-full blur-[60px] -z-10"
        ></motion.div>
        <motion.div 
          animate={{ opacity: [0.05, 0.2, 0.05], scale: [1.2, 2.2, 1.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          className="absolute inset-0 bg-purple-600 rounded-full blur-[80px] -z-20"
        ></motion.div>
      </div>

      <div className="space-y-6 max-w-md w-full">
        <div className="space-y-2">
          <motion.h2 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-3xl font-black text-white tracking-tighter"
          >
            Analyzing <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">QR Security...</span>
          </motion.h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Quantum Security Protocol v2.0</p>
        </div>
        
        <div className="flex flex-col gap-4 items-center">
          <div className="h-6 flex items-center">
            <motion.p 
              key={step}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              className="text-cyan-200/80 font-mono text-sm tracking-wide"
            >
              {steps[step]}
            </motion.p>
          </div>
          
          <div className="w-full space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold uppercase">
              <span>System Integrity</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
              <motion.div 
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              ></motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 max-w-sm w-full">
        {[
          { icon: Shield, label: "Threat Engine", color: "text-cyan-400" },
          { icon: Lock, label: "Payment Sec", color: "text-blue-400" },
          { icon: Search, label: "Payload Analysis", color: "text-indigo-400" },
          { icon: Cpu, label: "AI Fusion", color: "text-purple-400" }
        ].map((item, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0.2 }}
            animate={{ 
              opacity: i <= step ? 1 : 0.2,
              scale: i <= step ? 1 : 0.95,
              borderColor: i <= step ? "rgba(34,211,238,0.3)" : "rgba(255,255,255,0.05)"
            }}
            className={`flex items-center gap-3 p-3 rounded-xl border bg-white/[0.02] backdrop-blur-md transition-all duration-500`}
          >
            <item.icon size={16} className={i <= step ? item.color : "text-slate-600"} />
            <span className={`text-[11px] font-black uppercase tracking-tight ${i <= step ? "text-slate-200" : "text-slate-600"}`}>
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Processing;
