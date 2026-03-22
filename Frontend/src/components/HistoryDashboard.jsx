import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, 
  History as HistoryIcon, 
  Clock, 
  ChevronRight, 
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  QrCode
} from "lucide-react";
import { getHistory, clearHistory, formatTimestamp } from "../utils/storage";
import ResultDashboard from "./ResultDashboard";
import "./HistoryDashboard.css";

/**
 * HistoryDashboard Component
 * Manages the display and deletion of scan history.
 */
const HistoryDashboard = ({ history: historyProp, onHistoryChange }) => {
  const [selectedScan, setSelectedScan] = useState(null);
  const history = historyProp || [];

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to permanently delete all scan history?")) {
      clearHistory();
      if (onHistoryChange) onHistoryChange([]);
    }
  };

  const getStatusIcon = (status) => {
    if (status === "Safe") return <ShieldCheck size={14} className="text-green-400" />;
    if (status === "Dangerous") return <ShieldAlert size={14} className="text-red-400" />;
    return <AlertTriangle size={14} className="text-yellow-400" />;
  };

  return (
    <div className="history-dashboard">
      <div className="history-header">
        <div className="flex items-center gap-3">
          <HistoryIcon size={20} className="text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Security History</h2>
          <span className="text-[10px] bg-white/5 text-slate-500 px-2 py-0.5 rounded-full font-bold">
            {history.length} SCANS
          </span>
        </div>
        
        {history.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="clear-btn"
          >
            <Trash2 size={14} />
            Clear
          </button>
        )}
      </div>

      <div className="history-list custom-scrollbar">
        {history.map((scan, index) => (
          <motion.div
            key={scan.id || index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedScan(scan)}
            className="history-item"
          >
            <div className="item-main">
              <p className="item-qr-data">{scan.qr_data}</p>
              <div className="item-meta">
                <div className="flex items-center gap-1">
                  {getStatusIcon(scan.status)}
                  <span className={`status-badge ${scan.status}`}>{scan.status}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={10} />
                  <span>{formatTimestamp(scan.timestamp)}</span>
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-700" />
          </motion.div>
        ))}

        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-3">
            <QrCode size={48} className="opacity-10" />
            <p className="text-sm font-medium">No security logs found</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedScan && (
          <div className="detail-modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="detail-modal-content custom-scrollbar"
            >
              <button 
                onClick={() => setSelectedScan(null)}
                className="close-modal-btn"
              >
                <X size={24} />
              </button>
              
              <div className="mt-4">
                <ResultDashboard 
                  results={selectedScan} 
                  onReset={() => setSelectedScan(null)} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoryDashboard;
