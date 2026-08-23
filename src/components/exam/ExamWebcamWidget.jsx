import React, { useRef, useEffect, useState } from "react";
import { Video, ShieldCheck, AlertTriangle, UserCheck, Activity, Eye, CameraOff, AlertCircle } from "lucide-react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://veriproof-backend.onrender.com";

const ExamWebcamWidget = ({ webcamStream, onViolation }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const prevFrameRef = useRef(null);
  const staticCountRef = useRef(0);
  const shutterCountRef = useRef(0);
  const lastAiCheckRef = useRef(0);
  const isAnalyzingAiRef = useRef(false);

  const [proctorState, setProctorState] = useState({
    status: "VERIFIED", // "VERIFIED" | "SCANNING" | "SHUTTER_COVERED" | "STATIC_PHOTO" | "NO_FACE" | "MULTIPLE_FACES" | "PHONE_SUSPICIOUS"
    message: "Live Stream Verified",
    provider: "NVIDIA NIM",
    confidence: 1.0,
  });

  const [motionScore, setMotionScore] = useState(100);

  useEffect(() => {
    if (webcamStream && videoRef.current) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  // Deep AI Vision Snapshot Dispatcher
  const runAiVisionAnalysis = async (canvas, clientMetrics) => {
    if (isAnalyzingAiRef.current) return;
    const now = Date.now();
    // Throttle AI calls to at least every 15 seconds unless critical trigger
    if (now - lastAiCheckRef.current < 15000 && !clientMetrics.isTriggered) return;

    isAnalyzingAiRef.current = true;
    lastAiCheckRef.current = now;

    try {
      const snapshotCanvas = document.createElement("canvas");
      snapshotCanvas.width = 320;
      snapshotCanvas.height = 240;
      const sCtx = snapshotCanvas.getContext("2d");
      sCtx.drawImage(canvas, 0, 0, 320, 240);
      const imageBase64 = snapshotCanvas.toDataURL("image/jpeg", 0.65);

      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/api/exams/proctor-snapshot`,
        { imageBase64, clientMetrics },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 10000,
        }
      );

      const data = res.data;
      if (data && data.violation) {
        setProctorState({
          status: data.violationType || "VIOLATION",
          message: data.reason || "Visual proctoring anomaly detected",
          provider: data.provider || "NVIDIA Vision",
          confidence: data.confidence || 0.95,
        });

        if (onViolation) {
          onViolation(`[AI Vision] ${data.reason || "Visual integrity violation detected"}`);
        }
      } else {
        setProctorState({
          status: "VERIFIED",
          message: "Candidate Live & Attentive",
          provider: data.provider || "NVIDIA Vision",
          confidence: data.confidence || 0.99,
        });
      }
    } catch (err) {
      // Background vision proctor note
    } finally {
      isAnalyzingAiRef.current = false;
    }
  };

  // Local Fast Optical Analyzer (Runs every 1.5 seconds)
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
            const prevB =
              (prevFrameRef.current[i] +
                prevFrameRef.current[i + 1] +
                prevFrameRef.current[i + 2]) /
              3;
            diffSum += Math.abs(b - prevB);
          }
        }

        const avgBrightness = totalBrightness / (data.length / 4);
        const avgMotionDelta = prevFrameRef.current
          ? diffSum / (data.length / 4)
          : 10;
        prevFrameRef.current = new Uint8ClampedArray(data);

        setMotionScore(Math.min(100, Math.round(avgMotionDelta * 10)));

        // 1. Shutter Closed / Covered Lens (< 10 mean brightness)
        if (avgBrightness < 10) {
          shutterCountRef.current += 1;
          if (shutterCountRef.current >= 2) {
            setProctorState({
              status: "SHUTTER_COVERED",
              message: "Camera Shutter Closed or Covered",
              provider: "Optical Engine",
              confidence: 0.99,
            });
            if (onViolation) onViolation("Camera Shutter Closed or Obscured");
          }
        } else {
          shutterCountRef.current = 0;
        }

        // 2. Static Photo / Frozen Screen Spoofing (< 0.15 delta for 6+ seconds)
        if (avgMotionDelta < 0.15 && avgBrightness >= 10) {
          staticCountRef.current += 1;
          if (staticCountRef.current >= 4) {
            setProctorState({
              status: "STATIC_PHOTO",
              message: "Static Image / Zero Movement Detected",
              provider: "Optical Engine",
              confidence: 0.95,
            });
            if (onViolation) onViolation("Static Picture or Frozen Camera Feed Detected");
            runAiVisionAnalysis(video, { avgBrightness, avgMotionDelta, isTriggered: true });
          }
        } else {
          staticCountRef.current = 0;
        }

        // 3. Periodic AI Vision Check (runs every ~18s in background)
        if (avgBrightness >= 10 && staticCountRef.current < 4) {
          runAiVisionAnalysis(video, { avgBrightness, avgMotionDelta, isTriggered: false });
        }
      } catch (e) {
        // Optical analysis frame note
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [webcamStream, onViolation]);

  const isViolating = proctorState.status !== "VERIFIED" && proctorState.status !== "SCANNING";

  return (
    <div className="glass-card rounded-2xl p-3 text-center shadow-xl border border-slate-800 relative">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Activity className="w-3 h-3 text-cyan-400" /> AI Vision Proctor
        </span>
        <span
          className={`flex items-center space-x-1 text-[10px] font-semibold ${
            !isViolating
              ? "text-emerald-400"
              : "text-red-400 animate-pulse"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              !isViolating
                ? "bg-emerald-400 animate-pulse"
                : "bg-red-400"
            }`}
          ></span>
          <span className="truncate max-w-[110px]">
            {!isViolating ? "ACTIVE PROCTOR" : proctorState.status.replace(/_/g, " ")}
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
              className={`w-full h-full object-cover transition duration-300 ${isViolating ? "brightness-75 contrast-125 border-2 border-red-500" : ""}`}
            />
            {/* Biometric Target Reticle Overlay */}
            <div className={`absolute inset-2 border ${isViolating ? "border-red-500/60" : "border-emerald-500/30"} rounded-md pointer-events-none flex flex-col justify-between p-1.5 opacity-60 group-hover:opacity-100 transition-opacity`}>
              <div className="flex justify-between">
                <span className={`w-2.5 h-2.5 border-t-2 border-l-2 ${isViolating ? "border-red-400" : "border-emerald-400"}`} />
                <span className={`w-2.5 h-2.5 border-t-2 border-r-2 ${isViolating ? "border-red-400" : "border-emerald-400"}`} />
              </div>
              <div className="flex justify-between">
                <span className={`w-2.5 h-2.5 border-b-2 border-l-2 ${isViolating ? "border-red-400" : "border-emerald-400"}`} />
                <span className={`w-2.5 h-2.5 border-b-2 border-r-2 ${isViolating ? "border-red-400" : "border-emerald-400"}`} />
              </div>
            </div>

            <div className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-mono flex items-center gap-1">
              {!isViolating ? (
                <>
                  <UserCheck className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">{proctorState.provider}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
                  <span className="text-rose-400 font-bold">{proctorState.message}</span>
                </>
              )}
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
