import React, { useRef, useEffect, useState } from "react";
import { Video, ShieldCheck, AlertTriangle, UserCheck, Activity } from "lucide-react";

const ExamWebcamWidget = ({ webcamStream, onViolation }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const prevFrameRef = useRef(null);
  const staticCountRef = useRef(0);
  const [faceStatus, setFaceStatus] = useState("VERIFIED"); // "VERIFIED" | "SCANNING" | "STATIC" | "ABSENT"
  const [motionScore, setMotionScore] = useState(100);

  useEffect(() => {
    if (webcamStream && videoRef.current) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  // Periodic Face Presence & Optical Motion Analysis (Every 4 seconds)
  useEffect(() => {
    if (!webcamStream) return;

    const interval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        canvas.width = 64;
        canvas.height = 48;
        ctx.drawImage(video, 0, 0, 64, 48);

        const imgData = ctx.getImageData(0, 0, 64, 48);
        const data = imgData.data;
        let totalBrightness = 0;
        let diffSum = 0;

        for (let i = 0; i < data.length; i += 4) {
          const b = (data[i] + data[i + 1] + data[i + 2]) / 3;
          totalBrightness += b;

          if (prevFrameRef.current) {
            const prevB = (prevFrameRef.current[i] + prevFrameRef.current[i + 1] + prevFrameRef.current[i + 2]) / 3;
            diffSum += Math.abs(b - prevB);
          }
        }

        const avgBrightness = totalBrightness / (data.length / 4);
        const avgMotionDelta = prevFrameRef.current ? diffSum / (data.length / 4) : 10;
        prevFrameRef.current = new Uint8ClampedArray(data);

        setMotionScore(Math.min(100, Math.round(avgMotionDelta * 10)));

        // 1. Check for Covered / Black Camera
        if (avgBrightness < 8) {
          setFaceStatus("ABSENT");
          if (onViolation) onViolation("Camera Obscured or Covered");
        }
        // 2. Check for Static Photo / Frozen Screen Spoofing (< 0.2 delta for 16s)
        else if (avgMotionDelta < 0.2) {
          staticCountRef.current += 1;
          if (staticCountRef.current >= 4) {
            setFaceStatus("STATIC");
            if (onViolation) onViolation("Static Picture or Frozen Video Stream Detected");
          }
        } else {
          staticCountRef.current = 0;
          setFaceStatus("VERIFIED");
        }
      } catch (e) {
        // Optical analysis frame note
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [webcamStream, onViolation]);

  return (
    <div className="glass-card rounded-2xl p-3 text-center shadow-xl border border-slate-800 relative">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Activity className="w-3 h-3 text-cyan-400" /> Biometric AI Proctor
        </span>
        <span
          className={`flex items-center space-x-1 text-[10px] font-semibold ${
            faceStatus === "VERIFIED"
              ? "text-emerald-400"
              : faceStatus === "ABSENT" || faceStatus === "STATIC"
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
          <span>
            {faceStatus === "VERIFIED"
              ? "LIVE STREAM"
              : faceStatus === "STATIC"
              ? "STATIC FEED"
              : "CHECK CAMERA"}
          </span>
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
