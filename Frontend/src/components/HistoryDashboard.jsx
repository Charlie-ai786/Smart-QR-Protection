import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Search, 
  Trash2, 
  ChevronRight,
  Clock,
  QrCode,
  Zap
} from "lucide-react";
import ResultDashboard from "./ResultDashboard";
import { clearHistory } from "../utils/storage";
import "./HistoryDashboard.css";

const HistoryDashboard = ({ history, onHistoryChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedScan, setSelectedScan] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase();
    if (s === "dangerous" || s === "high_risk" || s === "malicious") {
      return { icon: <AlertOctagon size={14} />, color: "status-alert", label: "DANGEROUS", bg: "bg-red-500/10" };
    }
    if (s === "suspicious" || s === "medium_risk" || s === "warning") {
      return { icon: <AlertTriangle size={14} />, color: "status-warn", label: "SUSPICIOUS", bg: "bg-yellow-500/10" };
    }
    return { icon: <CheckCircle2 size={14} />, color: "status-check", label: "SAFE", bg: "bg-green-500/10" };
  };

  const filteredHistory = (history || []).filter(scan => {
    const data = (scan.qr_data || scan.url || "").toLowerCase();
    const matchesSearch = data.includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || 
                         (filterStatus === "Safe" && scan.status === "Safe") ||
                         (filterStatus === "Suspicious" && scan.status === "Suspicious") ||
                         (filterStatus === "Malicious" && (scan.status === "Dangerous" || scan.status === "Malicious"));
    return matchesSearch && matchesFilter;
  });

  const handleClearHistory = () => {
    clearHistory();
    onHistoryChange([]);
    setConfirmClear(false);
  };

  return (
    <div className="history-dashboard space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search QR content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["All", "Safe", "Suspicious", "Malicious"].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterStatus === status 
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" 
                  : "bg-white/5 text-slate-500 hover:text-slate-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setConfirmClear(true)}
            className="p-2 text-slate-500 hover:text-red-400 transition-colors"
            title="Clear History"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((scan) => {
            const config = getStatusConfig(scan.status);
            return (
              <motion.div
                key={scan.id || scan.timestamp}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedScan(scan)}
                className={`glass-card p-3 cursor-pointer flex items-center justify-between group ${scan.status === 'Dangerous' ? 'border-red-500/20' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                       <span className={`text-[9px] font-black tracking-widest ${config.color}`}>
                         {config.label}
                       </span>
                    </div>
                    <p className="text-xs font-bold text-white truncate max-w-[150px]">
                      {scan.qr_data || scan.url || "Encrypted Data"}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <Clock size={10} />
                      {new Date(scan.timestamp || 0).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
              <QrCode size={20} className="text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm font-medium">No results found.</p>
          </div>
        )}
      </div>

      {/* Scan Detail Modal Overlay */}
      <AnimatePresence>
        {selectedScan && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-sm"
            onClick={() => setSelectedScan(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-[#0f172a] rounded-3xl border border-white/10 p-2 shadow-2xl">
                 <div className="flex justify-end p-2">
                   <button 
                     onClick={() => setSelectedScan(null)}
                     className="p-2 hover:bg-white/5 rounded-xl text-slate-400"
                   >
                     ✕
                   </button>
                 </div>
                 <div className="px-4 pb-4">
                   <ResultDashboard results={selectedScan} onScanAgain={null} />
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {confirmClear && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-sm"
          >
            <div className="glass-card p-8 max-w-xs text-center space-y-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Clear History?</h3>
                <p className="text-sm text-slate-500">This action will permanently delete all scan records.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-bold hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleClearHistory}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoryDashboard;
