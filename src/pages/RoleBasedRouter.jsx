import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import InvestigatorHub from "./InvestigatorHub";

const RoleBasedRouter = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading)
    return (
      <div className="text-center pt-20 text-ibex-muted tracking-widest uppercase text-sm">
        Loading...
      </div>
    );

  if (!user) return null;

  return (
    <div className="py-6">
      {user.role === "recruiter" ? <InvestigatorHub /> : <StudentDashboard />}
    </div>
  );
};

export default RoleBasedRouter;
