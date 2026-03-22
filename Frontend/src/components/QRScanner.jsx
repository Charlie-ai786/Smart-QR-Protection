import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { RotateCcw, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./QRScanner.css";

/**
 * QRScanner Component
 * A modular QR code scanner that uses the device camera to scan and decode QR codes in real-time.
 */
const QRScanner = ({ onScanSuccess, onScanAgain }) => {
  // State for decoded QR data and session management
  const [scanResult, setScanResult] = useState({
    session_id: null,
    qr_data: null
  });
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs for the scanner instance and the DOM element
  const scannerRef = useRef(null);
  const regionRef = useRef(null);

  /**
   * Generates a unique session ID based on timestamp and random string
   */
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  /**
   * Initializes the QR scanner
   */
  const startScanner = async () => {
    try {
      setError(null);
      setIsScanning(true);
      setScanResult({ session_id: null, qr_data: null });

      // Create new instance if it doesn't exist
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader-target");
      } else if (scannerRef.current.isScanning) {
        // If somehow it's still scanning, stop it first
        await scannerRef.current.stop().catch(() => {});
      }

      const config = {
        fps: 15, // Frames per second for scanning
        qrbox: { width: 250, height: 250 }, // The scanning area
        aspectRatio: 1.0
      };

      // Start the camera
      await scannerRef.current.start(
        { facingMode: "environment" }, // Use rear camera by default
        config,
        (decodedText) => {
          // Success callback: QR code detected
          handleSuccess(decodedText);
        },
        (errorMessage) => {
          // Error callback: Scanning error (ignored for real-time performance)
        }
      );
    } catch (err) {
      console.error("Scanner startup failed:", err);
      // Handle camera permission denied or other hardware errors
      if (err.toString().includes("NotAllowedError")) {
        setError("Camera permission denied. Please allow access to use the scanner.");
      } else {
        setError("Failed to access camera. Make sure no other app is using it.");
      }
      setIsScanning(false);
    }
  };

  /**
   * Processes successful scan results
   */
  const handleSuccess = async (decodedText) => {
    const sessionId = generateSessionId();
    const result = {
      session_id: sessionId,
      qr_data: decodedText
    };

    setScanResult(result);
    setIsScanning(false);

    // Stop the camera automatically
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.warn("Error stopping scanner:", e);
      }
    }

    // Pass data to parent if callback provided
    if (onScanSuccess) {
      onScanSuccess(result);
    }
  };

  /**
   * Restarts the scanner for a new session
   */
  const handleScanAgain = () => {
    if (onScanAgain) onScanAgain();
    startScanner();
  };

  // Effect to handle initialization and cleanup
  useEffect(() => {
    startScanner();

    // Cleanup on unmount
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="qr-scanner-container">

      <div className="scanner-video-wrapper">
        <div id="qr-reader-target"></div>
        
        {/* Scan Overlay UI - Only visible when scanning */}
        <AnimatePresence>
          {isScanning && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="scan-animation-overlay"
            >
              <div className="scan-line"></div>
              <div className="scan-corner top-left"></div>
              <div className="scan-corner top-right"></div>
              <div className="scan-corner bottom-left"></div>
              <div className="scan-corner bottom-right"></div>
              <div className="absolute inset-x-0 bottom-10 text-center">
                <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-cyan-500/20 backdrop-blur-md">
                  Scanning for QR Code...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading/Error State Backdrop */}
        {!isScanning && !scanResult.qr_data && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Error Handling Message */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="error-message"
        >
          <ShieldAlert className="shrink-0" size={20} />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Scan Result Card */}
      <AnimatePresence>
        {scanResult.qr_data && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="scanner-result-box"
          >
            <div className="result-header">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-400" size={18} />
                <span className="text-sm font-bold text-slate-300">Scan Successful</span>
              </div>
              <span className="session-id-tag">{scanResult.session_id}</span>
            </div>

            <div className="qr-data-content">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Decoded Data</p>
              <div className="font-mono text-cyan-400 break-all">
                {scanResult.qr_data}
              </div>
            </div>

            <button 
              onClick={handleScanAgain}
              className="scan-again-btn"
            >
              <RotateCcw size={18} />
              Scan Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-[10px] text-slate-500 text-center italic">
        Position the QR code within the frame for automatic detection.
      </div>
    </div>
  );
};

export default QRScanner;
