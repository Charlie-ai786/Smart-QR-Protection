import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, ShieldCheck, Share2 } from "lucide-react";
import { motion } from "framer-motion";

const QRGenerator = () => {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#22d3ee");

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
      className="max-w-md mx-auto p-6 glass-card mt-8"
    >
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="text-cyan-400 w-6 h-6" />
        <h2 className="text-xl font-bold">Safe QR Generator</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Destination URL</label>
          <input
            type="text"
            placeholder="https://example.com"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="glass-input"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Accent Color</label>
          <div className="flex gap-2">
            {["#22d3ee", "#3b82f6", "#a855f7", "#10b981"].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {text && (
          <div className="flex flex-col items-center bg-white p-4 rounded-lg mt-6">
            <QRCodeSVG
              id="generated-qr"
              value={text}
              size={200}
              fgColor={color}
              level="H"
              includeMargin={true}
            />
            <p className="text-gray-500 text-[10px] mt-2 uppercase tracking-widest font-bold">
              Verified by Smart QR
            </p>
          </div>
        )}

        <button
          onClick={downloadQR}
          disabled={!text}
          className="w-full mt-4 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 transition rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Download size={20} />
          Download Safe QR
        </button>
      </div>
    </motion.div>
  );
};

export default QRGenerator;
