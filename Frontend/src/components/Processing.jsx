import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Search, Cpu } from "lucide-react";

/**
 * Processing Component
 * A high-end loading screen that simulates deep security analysis.
 */
const Processing = () => {
  const [step, setStep] = useState(0);
  const steps = [
    "Initializing Neural Fingerprinting...",
    "Scanning URL for Phishing Patterns...",
    "Evaluating Payment Protocol Integrity...",
    "Fusing Security Intelligence Signals...",
    "Finalizing Safety Verdict..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 800);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-8 p-8 text-center">
      {/* Central Animated Icon */}
      <div className="relative">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 flex items-center justify-center"
        >
          <Cpu className="text-cyan-400" size={40} />
        </motion.div>
        
        {/* Pulsing Glow */}
        <motion.div 
          animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-cyan-500 rounded-full blur-2xl -z-10"
        ></motion.div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-black text-white tracking-tight">
          Deep Analysis <span className="text-cyan-400">In Progress</span>
        </h2>
        
        <div className="flex flex-col gap-2 items-center">
          <motion.p 
            key={step}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-slate-400 font-medium"
          >
            {steps[step]}
          </motion.p>
          
          <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              animate={{ width: `${(step + 1) * 20}%` }}
              className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
            ></motion.div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 max-w-xs w-full">
        {[
          { icon: Shield, label: "Threat Engine" },
          { icon: Lock, label: "Payment Sec" },
          { icon: Search, label: "Payload" },
          { icon: Cpu, label: "Fusion" }
        ].map((item, i) => (
          <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${i <= step ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/5 border-white/5 text-slate-600"}`}>
            <item.icon size={14} />
            <span className="text-[10px] font-bold uppercase">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Processing;
