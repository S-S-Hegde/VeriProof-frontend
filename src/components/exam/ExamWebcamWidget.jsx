import React, { useRef, useEffect, useState } from "react";
import { Activity, UserCheck, AlertCircle, ShieldCheck } from "lucide-react";
import api from "../../utils/api";

const ACE_STREAM_URL = "http://localhost:8000/api/stream";
const ACE_WS_URL = "ws://localhost:8000/ws/telemetry";

const ExamWebcamWidget = ({ webcamStream, onViolation, onTelemetryUpdate }) => {
  const videoRef = useRef(null);
  const [aceConnected, setAceConnected] = useState(false);
  const [telemetry, setTelemetry] = useState(null);

  const [proctorState, setProctorState] = useState({
    status: "VERIFIED",
    message: "Live Stream Verified",
    provider: "ACE Engine + NVIDIA NIM",
    confidence: 1.0,
  });

  // 1. Connect to ACE High-Strictness Proctor WebSocket
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;

    const connectAce = () => {
      try {
        ws = new WebSocket(ACE_WS_URL);

        ws.onopen = () => {
          setAceConnected(true);
          setProctorState({
            status: "VERIFIED",
            message: "ACE Vision & Hardware Guard Active",
            provider: "ACE Engine + NVIDIA NIM",
            confidence: 0.99,
          });
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.event === "telemetry") {
              setTelemetry(data.data);
              if (onTelemetryUpdate) {
                onTelemetryUpdate(data.data);
              }
            } else if (data.event === "violation") {
              const violType = (data.violation_type || "VIOLATION").toUpperCase();
              const violDetail = data.details || "Security rule triggered";

              setProctorState({
                status: violType,
                message: violDetail,
                provider: data.vlm_verified ? "VLM Guard" : "Local AI",
                confidence: 0.98,
              });

              // Forward violation to parent ExamFlowManager
              if (onViolation) {
                onViolation(violDetail);
              }
            }
          } catch (err) {
            // Ignore raw message parse errors
          }
        };

        ws.onerror = () => {
          setAceConnected(false);
        };

        ws.onclose = () => {
          setAceConnected(false);
          reconnectTimeout = setTimeout(connectAce, 2500);
        };
      } catch (err) {
        setAceConnected(false);
        reconnectTimeout = setTimeout(connectAce, 2500);
      }
    };

    connectAce();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [onViolation, onTelemetryUpdate]);

  // 2. Active In-Browser Optical Snapshot Loop (Runs continuously when in Browser Webcam Mode)
  useEffect(() => {
    if (aceConnected || !webcamStream) return;

    let isMounted = true;
    let isAnalyzing = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const snapshotInterval = setInterval(async () => {
      if (isAnalyzing || !videoRef.current || videoRef.current.readyState < 2) return;
      try {
        isAnalyzing = true;
        const video = videoRef.current;
        canvas.width = 480;
        canvas.height = 270;
        ctx.drawImage(video, 0, 0, 480, 270);
        const base64Data = canvas.toDataURL("image/jpeg", 0.7);

        const { data } = await api.post("/api/exams/proctor-snapshot", {
          image: base64Data,
        });

        if (!isMounted || !data) return;

        if (data.violation) {
          const violType = (data.violationType || data.type || "VIOLATION").toUpperCase();
          const violReason = data.reason || data.details || "Proctoring violation detected";

          setProctorState({
            status: violType,
            message: violReason,
            provider: data.provider || "AI Vision Guard",
            confidence: data.confidence || 0.95,
          });

          // Trigger violation modal & strike counter in ExamFlowManager
          if (onViolation) {
            onViolation(`${violType}: ${violReason}`);
          }
        } else {
          setProctorState({
            status: "VERIFIED",
            message: "Live Stream Verified",
            provider: data.provider || "AI Vision Guard",
            confidence: 0.99,
          });
        }
      } catch (err) {
        // Silently handle transient network snapshot failure
      } finally {
        isAnalyzing = false;
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(snapshotInterval);
    };
  }, [aceConnected, webcamStream, onViolation, onTelemetryUpdate]);

  // Fallback video stream attachment if ACE is not running
  useEffect(() => {
    if (!aceConnected && webcamStream && videoRef.current) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream, aceConnected]);

  const isViolating = proctorState.status !== "VERIFIED" && proctorState.status !== "SCANNING";

  return (
    <div className="glass-card rounded-2xl p-3 text-center shadow-xl border border-slate-800 relative">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Activity className="w-3 h-3 text-cyan-400" />
          {aceConnected ? "ACE AI Proctor (Active)" : "AI Vision Proctor"}
        </span>
        <span
          className={`flex items-center space-x-1 text-[10px] font-semibold ${
            !isViolating ? "text-emerald-400" : "text-red-400 animate-pulse"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              !isViolating ? "bg-emerald-400 animate-pulse" : "bg-red-400"
            }`}
          ></span>
          <span className="truncate max-w-[130px]">
            {!isViolating ? "EXAM SECURE" : proctorState.status.replace(/_/g, " ")}
          </span>
        </span>
      </div>

      <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden relative border border-slate-800 flex items-center justify-center group">
        {aceConnected ? (
          // ACE High-Strictness Hardware Video Feed with YOLO HUD
          <img
            src={ACE_STREAM_URL}
            alt="Live ACE Proctor Stream"
            className={`w-full h-full object-cover transition duration-300 ${
              isViolating ? "brightness-75 contrast-125 border-2 border-red-500" : ""
            }`}
          />
        ) : webcamStream ? (
          // Fallback browser webcam stream
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition duration-300 ${
              isViolating ? "brightness-75 contrast-125 border-2 border-red-500" : ""
            }`}
          />
        ) : (
          <div className="text-[11px] text-slate-500 font-mono">
            Proctoring Active
          </div>
        )}

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
      </div>

      {telemetry && (
        <div className="mt-2 grid grid-cols-3 gap-1 text-[9px] font-mono text-slate-400 bg-slate-900/60 p-1.5 rounded">
          <div>Faces: <b className={telemetry.face_count === 1 ? "text-emerald-400" : "text-red-400"}>{telemetry.face_count}</b></div>
          <div>Gaze: <b className={telemetry.gaze_violation ? "text-red-400" : "text-emerald-400"}>{telemetry.gaze_violation ? "OFF" : "OK"}</b></div>
          <div>Yaw: <b className="text-slate-200">{Math.round(telemetry.yaw_dev || 0)}°</b></div>
        </div>
      )}
    </div>
  );
};

export default ExamWebcamWidget;
