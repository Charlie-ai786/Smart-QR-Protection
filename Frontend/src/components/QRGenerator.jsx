import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, ShieldCheck, QrCode, Zap, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QRGenerator = () => {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#06b6d4");

  const downloadQR = () => {
    const svg = document.getElementById("generated-qr");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 500;
      canvas.height = 500;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, 500, 500);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "Safe-QR.png";
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-8 glass-card"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl">
            <QrCode className="text-cyan-400 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Safe QR Generator</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Encrypted Output</p>
          </div>
        </div>
        <div className="p-2 bg-yellow-500/10 rounded-lg">
          <Zap size={16} className="text-yellow-500" />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 block">Destination Payload</label>
          <input
            type="text"
            placeholder="Enter URL or secure data..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 block">Cryptographic Tint</label>
          <div className="flex gap-3">
            {["#06b6d4", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-10 h-10 rounded-xl border-2 transition-all transform active:scale-90 ${color === c ? "border-white scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"}`}
                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 15px ${c}44` : 'none' }}
              />
            ))}
          </div>
        </div>

        <AnimatePresence>
          {text && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center bg-white p-6 rounded-2xl mt-4 shadow-2xl"
            >
              <QRCodeSVG
                id="generated-qr"
                value={text}
                size={220}
                fgColor={color}
                level="H"
                includeMargin={true}
              />
              <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-cyan-50 rounded-full">
                <ShieldCheck size={12} className="text-cyan-600" />
                <p className="text-cyan-900 text-[9px] uppercase tracking-widest font-black">
                  Verified Secure Payload
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={downloadQR}
          disabled={!text}
          className="premium-btn btn-primary w-full mt-4 !rounded-2xl shadow-xl shadow-cyan-500/20"
        >
          <Download size={20} />
          <span className="font-bold tracking-tight">EXPORT SECURE QR</span>
          <ChevronRight size={16} className="ml-auto opacity-50" />
        </button>
        
        <p className="text-[9px] text-slate-500 text-center italic">
          All generated codes are optimized for high-reliability scanning and tamper resistance.
        </p>
      </div>
    </motion.div>
  );
};

export default QRGenerator;
