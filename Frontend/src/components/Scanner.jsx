import React from "react";
import { motion } from "framer-motion";
import { Scan, ChevronRight } from "lucide-react";
import QRScanner from "./QRScanner";

/**
 * Scanner View Component
 * Wraps the QR Scanner and Manual URL Input field.
 */
const Scanner = ({ url, setUrl, onScanSuccess, onAnalyze, loading }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Scan className="text-cyan-400" />
        <h2 className="text-2xl font-bold">Safe Scanner</h2>
      </div>

      <QRScanner 
        onScanSuccess={onScanSuccess} 
      />

      <div className="relative mt-6">
        <input
          type="text"
          placeholder="Paste a URL to analyze..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="glass-input pr-12"
        />
        <button 
          onClick={() => onAnalyze()}
          disabled={loading}
          className="absolute right-2 top-1.5 p-1.5 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition disabled:opacity-50"
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
  );
};

export default Scanner;
