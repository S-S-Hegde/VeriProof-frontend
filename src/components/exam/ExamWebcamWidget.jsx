import React, { useRef, useEffect } from "react";
import { Video } from "lucide-react";

const ExamWebcamWidget = ({ webcamStream }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (webcamStream && videoRef.current) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  return (
    <div className="glass-card rounded-2xl p-3 text-center shadow-xl border border-slate-800">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Video className="w-3 h-3 text-blue-400" /> Live Proctor
        </span>
        <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ACTIVE</span>
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
            Proctoring Active
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamWebcamWidget;
