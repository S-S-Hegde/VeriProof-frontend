import React, { useRef, useEffect } from "react";
import { ShieldCheck, UserCheck } from "lucide-react";
import api from "../../utils/api";

/**
 * ExamWebcamWidget
 * Lightweight client-side telemetric webcam monitor.
 * Displays local candidate video stream and takes periodic identity snapshots
 * for server-authoritative audit verification.
 */
const ExamWebcamWidget = ({ webcamStream }) => {
  const videoRef = useRef(null);

  // Attach local media stream to video element
  useEffect(() => {
    if (webcamStream && videoRef.current) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  // Periodic Identity Snapshot Audit Trail (Every 45 seconds)
  useEffect(() => {
    if (!webcamStream || !videoRef.current) return;

    let isMounted = true;
    let isUploading = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const snapshotInterval = setInterval(async () => {
      if (isUploading || !videoRef.current || videoRef.current.readyState < 2) return;
      try {
        isUploading = true;
        const video = videoRef.current;
        canvas.width = 480;
        canvas.height = 270;
        ctx.drawImage(video, 0, 0, 480, 270);
        const base64Data = canvas.toDataURL("image/jpeg", 0.6);

        await api.post("/api/exams/proctor-snapshot", {
          imageBase64: base64Data,
          image: base64Data,
          isAuditSnapshot: true,
        });
      } catch (err) {
        // Silently handle transient network failure
      } finally {
        if (isMounted) isUploading = false;
      }
    }, 45000);

    return () => {
      isMounted = false;
      clearInterval(snapshotInterval);
    };
  }, [webcamStream]);

  return (
    <div className="glass-card rounded-2xl p-3 text-center shadow-xl border border-slate-800 relative">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          Proctor Telemetry Monitor
        </span>
        <span className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="truncate max-w-[130px]">ACTIVE</span>
        </span>
      </div>

      <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden relative border border-slate-800 flex items-center justify-center">
        {webcamStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-[11px] text-slate-500 font-mono">
            Identity Camera Initializing...
          </div>
        )}

        <div className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-mono flex items-center gap-1">
          <UserCheck className="w-2.5 h-2.5 text-emerald-400" />
          <span className="text-emerald-400 font-bold">Client Telemetry Guard</span>
        </div>
      </div>
    </div>
  );
};

export default ExamWebcamWidget;
