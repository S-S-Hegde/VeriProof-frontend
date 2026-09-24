import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../config/firebase";
import { signInWithRedirect, getRedirectResult, onAuthStateChanged } from "firebase/auth";
import api from "../utils/api";
import { persistUserSession } from "../utils/authStorage";
import { CheckCircle2, Loader2, ShieldCheck, ArrowRight } from "lucide-react";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("initializing"); // "initializing" | "authenticating" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");
  const processedRef = useRef(false);

  const role = searchParams.get("role") || "student";
  const inviteCode = searchParams.get("inviteCode") || "";

  const exchangeTokenAndFinish = async (idToken) => {
    if (processedRef.current) return;
    processedRef.current = true;
    setStatus("authenticating");

    let pendingRole = role;
    try {
      const saved = localStorage.getItem("veriproof_auth_pending");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role) pendingRole = parsed.role;
        localStorage.removeItem("veriproof_auth_pending");
      }
    } catch (e) {}

    const AUTH_TIMEOUT = 55000;
    let data = null;

    // Retry loop handling Render backend cold start
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await api.post(
          "/api/users/firebase-auth",
          { role: pendingRole, inviteCode, idToken },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            timeout: AUTH_TIMEOUT,
          }
        );
        data = res.data;
        break;
      } catch (err) {
        const isRetryable =
          !err.response || [502, 503, 504].includes(err.response?.status);
        if (!isRetryable || attempt === 2) throw err;
        await new Promise((r) => setTimeout(r, (attempt + 1) * 3000));
      }
    }

    if (!data) throw new Error("Failed to obtain user session from backend.");

    // Persist session to local storage
    persistUserSession(data);
    setStatus("success");

    // Clean up redirect flags
    sessionStorage.removeItem("vp_auth_redirect_executed");

    // Broadcast to opener window via postMessage
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(
          { type: "VERIPROOF_AUTH_SUCCESS", data },
          window.location.origin
        );
      } catch (e) {
        console.warn("[AuthCallback] postMessage failed:", e);
      }
    }

    // Also broadcast via localStorage storage event (foolproof across tabs/windows on same origin)
    try {
      localStorage.setItem(
        "veriproof_auth_bridge_event",
        JSON.stringify({ timestamp: Date.now(), data })
      );
    } catch (e) {}

    // Autoclose the window smoothly
    setTimeout(() => {
      try {
        window.close();
      } catch (e) {}
      // If window.close was ignored by the browser, navigate directly
      setTimeout(() => {
        const targetPath =
          data.role === "recruiter" ? "/recruiter-dashboard" : "/dashboard";
        navigate(targetPath, { replace: true });
      }, 600);
    }, 800);
  };

  const triggerRedirect = async () => {
    setStatus("authenticating");
    setErrorMessage("");
    try {
      sessionStorage.setItem("vp_auth_redirect_executed", "true");
      localStorage.setItem(
        "veriproof_auth_pending",
        JSON.stringify({ role, inviteCode, timestamp: Date.now() })
      );
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      console.error("[AuthCallback] Redirect Error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to initiate Google OAuth redirect.");
    }
  };

  useEffect(() => {
    if (processedRef.current) return;

    const handleAuth = async () => {
      try {
        setStatus("authenticating");

        // 1. Check if returning from Google OAuth Redirect
        let idToken = null;
        try {
          const redirectResult = await getRedirectResult(auth);
          if (redirectResult && redirectResult.user) {
            idToken = await redirectResult.user.getIdToken(true);
          }
        } catch (e) {
          console.warn("[AuthCallback] getRedirectResult:", e);
        }

        // 2. Check current authenticated user or wait for onAuthStateChanged
        if (!idToken) {
          if (auth.currentUser) {
            idToken = await auth.currentUser.getIdToken(true);
          } else {
            const userFromState = await new Promise((resolve) => {
              let done = false;
              const unsub = onAuthStateChanged(auth, (u) => {
                if (u && !done) {
                  done = true;
                  unsub();
                  resolve(u);
                }
              });
              setTimeout(() => {
                if (!done) {
                  done = true;
                  unsub();
                  resolve(null);
                }
              }, 2000);
            });

            if (userFromState) {
              idToken = await userFromState.getIdToken(true);
            }
          }
        }

        // 3. If token acquired, complete authentication immediately!
        if (idToken) {
          await exchangeTokenAndFinish(idToken);
          return;
        }

        // 4. No token yet: Automatically initiate redirect if not already attempted
        const alreadyAttempted = sessionStorage.getItem("vp_auth_redirect_executed");
        if (!alreadyAttempted) {
          await triggerRedirect();
          return;
        }

        // Redirect returned but session was cleared: Allow user to trigger with 1 click
        sessionStorage.removeItem("vp_auth_redirect_executed");
        setStatus("error");
        setErrorMessage("Please click below to complete your Google Authentication.");
      } catch (err) {
        console.error("[AuthCallback] General Error:", err);
        setStatus("error");
        setErrorMessage(
          err.response?.data?.message ||
            err.message ||
            "Authentication failed. Please click below to authorize."
        );
      }
    };

    handleAuth();
  }, [role, inviteCode, navigate]);

  return (
    <div className="min-h-screen bg-[#070a14] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-[#0c1222]/90 border border-cyan-500/20 backdrop-blur-2xl shadow-2xl text-center">
        {/* Brand Icon */}
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-6 h-6 text-cyan-400" />
        </div>

        {status === "initializing" || status === "authenticating" ? (
          <div className="space-y-4">
            <div className="relative w-12 h-12 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 animate-spin" />
            </div>
            <h2 className="text-lg font-black italic uppercase tracking-wider text-white">
              Authenticating Identity
            </h2>
            <p className="text-xs text-gray-400 font-mono leading-relaxed">
              Connecting with Google OAuth...
            </p>
            <p className="text-[10px] text-gray-500 font-mono">
              This window will close automatically upon completion.
            </p>
          </div>
        ) : status === "success" ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black italic uppercase tracking-wider text-emerald-400">
              Identity Verified
            </h2>
            <p className="text-xs text-gray-300 font-mono">
              Session established successfully. Closing window and redirecting to your terminal...
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    window.close();
                  } catch (e) {}
                  navigate("/dashboard", { replace: true });
                }}
                className="inline-flex items-center gap-2 py-2 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto font-bold text-lg">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-lg font-black italic uppercase tracking-wider text-white">
              Authorize Identity
            </h2>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {errorMessage}
            </p>
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={triggerRedirect}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:brightness-110 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Authorize with Google OAuth</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    window.close();
                  } catch (e) {}
                  navigate("/login", { replace: true });
                }}
                className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium uppercase tracking-wider transition-all border border-white/5 cursor-pointer"
              >
                <span>Cancel / Return to Login</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
