import { useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import InvestigatorHub from "./InvestigatorHub";

const RoleBasedRouter = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate, allowedRoles]);

  if (loading)
    return (
      <div className="text-center pt-20 text-ibex-muted tracking-widest uppercase text-sm">
        Loading...
      </div>
    );

  if (!user) {
    return <Navigate to="/register" replace />;
  }

  if (children) {
    return children;
  }

  return (
    <div className="py-6">
      {user.role === "recruiter" ? <InvestigatorHub /> : <StudentDashboard />}
    </div>
  );
};

export default RoleBasedRouter;
