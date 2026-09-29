import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import InvestigatorHub from "./InvestigatorHub";

/**
 * Route guard + role-based renderer.
 *
 * CRITICAL: we MUST wait for `authInitialized` before making any
 * routing decisions. If we check `user` before the AuthContext has
 * finished its own startup work we will bounce authenticated users
 * back to /login on every page load.
 */
const RoleBasedRouter = ({ children, allowedRoles }) => {
  const { user, authLoading, authInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Do not act until AuthContext has finished initialising
    if (!authInitialized) return;
    // Do not act while a login call is in-flight
    if (authLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, authInitialized, navigate, allowedRoles]);

  // Show nothing (not even a loader) until we know auth state
  if (!authInitialized || authLoading) {
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
