import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  Camera,
  Maximize,
  AlertTriangle,
  CheckSquare,
  Clock,
  ArrowRight,
  CameraOff,
  Activity,
  CheckCircle2
} from "lucide-react";

const ACE_STREAM_URL = "http://localhost:8000/api/stream";
const ACE_STATUS_URL = "http://localhost:8000/api/proctor/status";

const ExamInstructions = ({ onStartExam, webcamStream, setWebcamStream }) => {
  const videoRef = useRef(null);
  const [agreed, setAgreed] = useState(false);
  const [camStatus, setCamStatus] = useState("checking"); // 'checking' | 'ace_active' | 'active' | 'error' | 'idle'
  const [aceActive, setAceActive] = useState(false);

  // 1. First check if ACE Hardware Engine is active on localhost:8000
  useEffect(() => {
    let isMounted = true;

    const checkAce = async () => {
      try {
        const res = await fetch(ACE_STATUS_URL, { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAceActive(true);
            setCamStatus("ace_active");
            return;
          }
        }
      } catch (err) {
        // ACE not running, will allow browser camera fallback
      }

      if (isMounted && !aceActive) {
        setCamStatus(webcamStream ? "active" : "idle");
      }
    };

    checkAce();
    const interval = setInterval(checkAce, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [webcamStream, aceActive]);

  // 2. Browser Camera fallback activation
  const enableBrowserCamera = async () => {
    setCamStatus("loading");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setWebcamStream(stream);
      setCamStatus("active");
    } catch (err) {
      console.error("[ExamInstructions] Camera Access Error:", err);
      setCamStatus("error");
    }
  };

  useEffect(() => {
    if (webcamStream && videoRef.current && !aceActive) {
      videoRef.current.srcObject = webcamStream;
      setCamStatus("active");
    }
  }, [webcamStream, aceActive]);

  const isReadyToStart = agreed && (aceActive || Boolean(webcamStream));

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Examination Instructions & Anti-Cheat Setup
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Review proctoring rules and verify your live camera feed before starting the assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card rounded-2xl p-6 space-y-4 shadow-xl border border-slate-800">
          <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-400" /> Examination Specifications
          </h3>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
              <CheckSquare className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">Total Questions</p>
                <p className="font-bold text-white">35 Technical MCQs</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
              <Clock className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs text-slate-400">Duration</p>
                <p className="font-bold text-white">40 Minutes</p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start space-x-3">
              <Activity className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-blue-300">AI Video Proctoring:</strong> Eyes must remain on screen. Looking away for &gt; 5-7s, holding cell phones, secondary screens, or whispering will trigger instant strikes.
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3">
              <Maximize className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-amber-300">Fullscreen Required:</strong> Exam automatically switches to browser fullscreen mode. Exiting fullscreen or switching tabs triggers violation strikes.
              </div>
            </div>

            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-rose-300">Maximum 3 Violations:</strong> Accumulating 3 anti-cheat violations will immediately terminate and auto-submit your exam.
              </div>
            </div>
          </div>
        </div>

        {/* Live Camera Feed Check Card */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-xl border border-slate-800">
          <div className="w-full">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
              <Camera className="w-4 h-4" /> Live Webcam Feed Check
            </h3>

            <div className="relative w-full aspect-video rounded-xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center mb-3">
              {aceActive ? (
                // Hardware Stream from ACE Engine
                <img
                  src={ACE_STREAM_URL}
                  alt="Live ACE Proctor Feed"
                  className="w-full h-full object-cover"
                />
              ) : webcamStream ? (
                // Fallback Browser Video
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-500 text-xs p-4 flex flex-col items-center">
                  <CameraOff className="w-8 h-8 mb-2 opacity-60 text-rose-400" />
                  <span className="font-semibold text-rose-300">
                    {camStatus === "error"
                      ? "Camera blocked or permission denied"
                      : camStatus === "loading"
                      ? "Initializing camera..."
                      : "Webcam Required"}
                  </span>
                </div>
              )}
            </div>

            {aceActive ? (
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 mx-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>ACE AI Camera Active & Ready</span>
              </div>
            ) : (
              <button
                onClick={enableBrowserCamera}
                type="button"
                className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center mx-auto gap-1.5 ${
                  camStatus === "active"
                    ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>
                  {camStatus === "active" ? "Camera Active (Re-test)" : "Enable Camera (Mandatory)"}
                </span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-400 mt-3">
            {aceActive
              ? "Hardware camera guard connected."
              : "Webcam verification is strictly mandatory for anti-cheat proctoring."}
          </p>
        </div>
      </div>

      <div className="mt-6 glass-card rounded-2xl p-6 text-center space-y-4 shadow-xl border border-slate-800">
        <label className="inline-flex items-center space-x-3 cursor-pointer text-sm font-medium text-slate-300">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
          />
          <span>
            I have read, understood, and agree to follow all examination proctoring rules.
          </span>
        </label>

        {!isReadyToStart && (
          <div className="text-xs text-amber-400 font-semibold flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>
              {!agreed
                ? "Please accept the examination rules to proceed."
                : "Webcam feed must be active before starting."}
            </span>
          </div>
        )}

        <div>
          <button
            onClick={onStartExam}
            disabled={!isReadyToStart}
            className={`px-10 py-3.5 rounded-xl font-bold text-base shadow-lg transition inline-flex items-center space-x-2 ${
              isReadyToStart
                ? "bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white cursor-pointer shadow-blue-600/25"
                : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
            }`}
          >
            <span>Start Examination</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamInstructions;
