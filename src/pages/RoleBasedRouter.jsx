import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import InvestigatorHub from "./InvestigatorHub";

/**
 * Route guard + role-based renderer.
 *
 * AuthContext now initializes synchronously from localStorage, so
 * authInitialized is always true on first render. No loading spinner
 * is needed here — if the user is not authenticated, we redirect
 * immediately to /login.
 */
const RoleBasedRouter = ({ children, allowedRoles }) => {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate, allowedRoles]);

  // Show a minimal spinner only while an explicit login call is in-flight
  if (authLoading) {
    return (
      <div className="flex min-h-[65vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 animate-spin" />
          </div>
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 animate-pulse">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;
  if (children) return children;

  return user.role === "recruiter" ? <InvestigatorHub /> : <StudentDashboard />;
};

export default RoleBasedRouter;
