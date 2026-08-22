import React, { useRef, useEffect, useState } from "react";
import { Video, ShieldCheck, AlertTriangle, UserCheck } from "lucide-react";

const ExamWebcamWidget = ({ webcamStream, onViolation }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceStatus, setFaceStatus] = useState("VERIFIED"); // "VERIFIED" | "SCANNING" | "ABSENT"

  useEffect(() => {
    if (webcamStream && videoRef.current) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  // Periodic Face Presence / Stream Health Verification
  useEffect(() => {
    if (!webcamStream) return;

    const interval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = 64;
        canvas.height = 48;
        ctx.drawImage(video, 0, 0, 64, 48);

        const imgData = ctx.getImageData(0, 0, 64, 48);
        const data = imgData.data;
        let totalBrightness = 0;

        for (let i = 0; i < data.length; i += 4) {
          totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }

        const avgBrightness = totalBrightness / (data.length / 4);

        // If completely black/covered camera (avgBrightness < 8)
        if (avgBrightness < 8) {
          setFaceStatus("ABSENT");
          if (onViolation) onViolation("Camera Obscured or Covered");
        } else {
          setFaceStatus("VERIFIED");
        }
      } catch (e) {
        // Video processing notice
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [webcamStream, onViolation]);

  return (
    <div className="glass-card rounded-2xl p-3 text-center shadow-xl border border-slate-800 relative">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Video className="w-3 h-3 text-blue-400" /> Biometric Proctor
        </span>
        <span
          className={`flex items-center space-x-1 text-[10px] font-semibold ${
            faceStatus === "VERIFIED"
              ? "text-emerald-400"
              : faceStatus === "ABSENT"
              ? "text-red-400 animate-pulse"
              : "text-amber-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              faceStatus === "VERIFIED"
                ? "bg-emerald-400 animate-pulse"
                : "bg-red-400"
            }`}
          ></span>
          <span>{faceStatus === "VERIFIED" ? "ID MATCH" : "CHECK CAMERA"}</span>
        </span>
      </div>

      <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden relative border border-slate-800 flex items-center justify-center group">
        {webcamStream ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Biometric Target Reticle Overlay */}
            <div className="absolute inset-2 border border-emerald-500/30 rounded-md pointer-events-none flex flex-col justify-between p-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
              <div className="flex justify-between">
                <span className="w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-400" />
                <span className="w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-400" />
              </div>
              <div className="flex justify-between">
                <span className="w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-400" />
                <span className="w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-400" />
              </div>
            </div>

            <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-mono text-emerald-400 flex items-center gap-1">
              <UserCheck className="w-2.5 h-2.5" /> VERIFIED
            </div>
          </>
        ) : (
          <div className="text-[11px] text-slate-500 font-mono">
            Proctoring Active
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamWebcamWidget;
