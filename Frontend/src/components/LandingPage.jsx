import React from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  Lock, 
  Search, 
  BarChart3, 
  Cpu, 
  Wallet,
  History,
  Scan,
  ChevronRight
} from "lucide-react";
import "./LandingPage.css";

const LandingPage = ({ onStartScan, onViewHistory }) => {
  const features = [
    {
      title: "AI Threat Detection",
      description: "Neural networks analyze URL patterns and metadata to identify malicious intent in milliseconds.",
      icon: <Cpu className="text-cyan-400" size={24} />,
      gradient: "from-cyan-500/20 to-blue-500/20"
    },
    {
      title: "Payment Verification",
      description: "Deep-link analysis for UPI and banking QRs to prevent unauthorized payment redirects.",
      icon: <Wallet className="text-purple-400" size={24} />,
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      title: "Tamper Detection",
      description: "Heuristics to detect physical overlays, stickers, and digital instabilities during scanning.",
      icon: <ShieldAlert className="text-amber-400" size={24} />,
      gradient: "from-amber-500/20 to-orange-500/20"
    },
    {
      title: "Risk Analysis",
      description: "Real-time risk scoring and visual breakdown of security factors for every scan.",
      icon: <BarChart3 className="text-emerald-400" size={24} />,
      gradient: "from-emerald-500/20 to-teal-500/20"
    }
  ];

  return (
    <div className="landing-container">
      {/* Background Elements */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      
      <main className="landing-content">
        {/* Hero Section */}
        <div className="hero-section">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hero-badge"
          >
            <ShieldCheck size={14} className="text-cyan-400" />
            <span>Next-Gen QR Security</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-title"
          >
            QR Shield <br /> 
            <span className="text-gradient">Smart Security Scanner</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hero-subtitle"
          >
            The world's first AI-powered QR protection suite. <br />
            Detect fraud, analyze risk, and stay safe from sophisticated QR scams in real-time.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-10"
          >
            <button className="premium-btn btn-primary px-10 py-4 !rounded-2xl text-lg group" onClick={onStartScan}>
              <Scan size={22} className="group-hover:rotate-12 transition-transform" />
              <span>Initiate Secure Scan</span>
              <ChevronRight size={18} className="opacity-50 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              className="premium-btn px-10 py-4 !rounded-2xl text-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 transition-all" 
              onClick={onViewHistory}
            >
              <History size={20} />
              <span>Trace History</span>
            </button>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className={`feature-card bg-gradient-to-br ${feature.gradient}`}
            >
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="feature-footer">
                <span>Learn more</span>
                <ChevronRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="trust-footer"
        >
          <div className="trust-item">
            <Zap size={16} className="text-yellow-400" />
            <span>0.2s Analysis</span>
          </div>
          <div className="trust-item">
            <Lock size={16} className="text-cyan-400" />
            <span>End-to-End Privacy</span>
          </div>
          <div className="trust-item">
            <Search size={16} className="text-blue-400" />
            <span>Deep URL Probing</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default LandingPage;
