import React, { useRef, useEffect, useState } from "react";
import { Activity, UserCheck, AlertCircle, ShieldCheck } from "lucide-react";
import api from "../../utils/api";

const defaultBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "https://veriproof-backend.onrender.com" : "http://localhost:5000");

// Convert http:// to ws:// and https:// to wss://
const getWsUrl = (baseUrl) => {
  return baseUrl.replace(/^http(s?):\/\//i, "ws$1://");
};

const ACE_STREAM_URL = `${defaultBaseUrl}/api/stream`;
const ACE_WS_URL = `${getWsUrl(defaultBaseUrl)}/ws/telemetry`;

const ExamWebcamWidget = ({ webcamStream, onViolation, onTelemetryUpdate }) => {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
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
        wsRef.current = ws;

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
              const t = data.data;
              setTelemetry(t);
              if (onTelemetryUpdate) {
                onTelemetryUpdate(t);
              }

              // Update visual HUD status dynamically from live telemetry
              if (t.active_warnings && t.active_warnings.length > 0) {
                const warnMsg = t.active_warnings[0].replace("WARNING: ", "");
                setProctorState({
                  status: warnMsg.toUpperCase().replace(/\s+/g, "_"),
                  message: warnMsg,
                  provider: "ACE Vision Guard",
                  confidence: 0.99,
                });
              } else if (t.phone_detected) {
                setProctorState({
                  status: "PHONE_DETECTED",
                  message: "Mobile phone detected in frame",
                  provider: "YOLO Device Guard",
                  confidence: 0.99,
                });
              } else if ((t.face_count || t.faces_count || 0) > 1) {
                setProctorState({
                  status: "MULTIPLE_FACES",
                  message: "Multiple people detected in view",
                  provider: "Face Landmarker Guard",
                  confidence: 0.99,
                });
              } else if (t.gaze_violation || (t.yaw_dev && Math.abs(t.yaw_dev) > 25)) {
                setProctorState({
                  status: "GAZE_AWAY",
                  message: "Looking away from screen",
                  provider: "Head Pose Guard",
                  confidence: 0.95,
                });
              } else {
                setProctorState({
                  status: "VERIFIED",
                  message: "ACE Vision & Hardware Guard Active",
                  provider: "ACE Engine + NVIDIA NIM",
                  confidence: 0.99,
                });
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
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [onViolation, onTelemetryUpdate]);

  // 2. Client-Side face-api.js Real-time Detection Loop
  useEffect(() => {
    if (!webcamStream || !videoRef.current) return;

    let isMounted = true;
    let detectionInterval;
    let violationStrikeCount = 0; // Debounce counter

    const startDetection = () => {
      detectionInterval = setInterval(async () => {
        if (!isMounted || videoRef.current.readyState < 2) return;
        
        try {
          // Detect faces using TinyFaceDetector
          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          );

          const faceCount = detections.length;
          
          let faceState = "ok";
          let message = "Face Locked & Verified";
          if (faceCount === 0) {
            faceState = "no_face";
            message = "No face detected in camera view";
          } else if (faceCount > 1) {
            faceState = "multiple_faces";
            message = "Multiple people detected in view";
          }

          if (faceState !== "ok") {
            violationStrikeCount++;
            
            // 3 consecutive ticks (~4.5s - 6s) to trigger debounce
            if (violationStrikeCount >= 3) {
              setProctorState({
                status: faceState === "no_face" ? "NO_FACE_DETECTED" : "MULTIPLE_FACES",
                message: message,
                provider: "Local AI (face-api)",
                confidence: 0.95,
              });

              if (onViolation) {
                onViolation(`Local AI Guard: ${message}`);
              }
              
              // Fallback to REST API for violation since WebSocket server is removed
              api.post("/api/exams/record-violation", {
                type: "face_violation",
                reason: message,
                confidence: 0.95
              }).catch(err => console.warn("Failed to record face violation:", err));
            }
          } else {
            violationStrikeCount = 0; // Reset on successful frame
            if (proctorState.status === "NO_FACE_DETECTED" || proctorState.status === "MULTIPLE_FACES") {
               setProctorState({
                 status: "VERIFIED",
                 message: "Face Locked & Verified",
                 provider: "Local AI (face-api)",
                 confidence: 0.99,
               });
            }
          }
        } catch (err) {
          // Ignore detection errors (model not loaded yet, etc)
        }
      }, 2000); // Every 2 seconds
    };

    startDetection();

    return () => {
      isMounted = false;
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, [webcamStream, onViolation, proctorState.status]);

  // 3. Periodic Snapshot Audit Trail
  useEffect(() => {
    if (!webcamStream || !videoRef.current) return;
    
    let isMounted = true;
    let isUploading = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Extract examId from the URL or passed props. Since ExamWebcamWidget might not have it,
    // wait, we can just POST to `/api/exams/proctor-snapshot` and the backend uses req.user._id to find the active exam.
    // The previous code did exactly that.

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
          isAuditSnapshot: true
        });
      } catch (err) {
        // Silently handle transient network failure
      } finally {
        if (isMounted) isUploading = false;
      }
    }, 45000); // Every 45 seconds

    return () => {
      isMounted = false;
      clearInterval(snapshotInterval);
    };
  }, [webcamStream]);

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
