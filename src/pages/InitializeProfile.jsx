import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ChevronLeft } from "lucide-react";
import api from "../utils/api";
import { persistUserSession } from "../utils/authStorage";
import RecruiterCompanyOnboardingModal from "../components/RecruiterCompanyOnboardingModal";
import RoleSelectionDeck from "../components/auth/RoleSelectionDeck";
import AuthShell from "../components/auth/AuthShell";
import IdentityGatewayCard from "../components/auth/IdentityGatewayCard";

const Register = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [githubUsername, setGithubUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  const { user, setUser, loginWithGoogle } = useAuth();
  useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qEmail = params.get("email");
    const qRole = params.get("role");
    if (qEmail) {
      setEmail(qEmail);
      if (qRole) setRole(qRole);
      setStep(2);
    }
  }, [location]);

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
    setError("");
    setStep(2);
  };

  const handleBackNavigation = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setGithubUsername("");
    setError("");
    setStep(1);
  };

  const handleGoogleRegister = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const data = await loginWithGoogle(role);
      if (!data) {
        // OAuth redirect was initiated or waiting
        return;
      }
      setUser(data);
      persistUserSession(data);

      if (
        data.role === "recruiter" &&
        data.recruiterVerificationStatus &&
        data.recruiterVerificationStatus !== "COMPANY_EMAIL_VERIFIED"
      ) {
        setShowCompanyModal(true);
        return;
      }

      navigate(data.role === "recruiter" ? "/recruiter-dashboard" : "/dashboard");
    } catch (err) {
      console.error("[Google Registration Error]:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Google registration failed. Please check your credentials or try email sign up."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const submitHandler = async (e) => {
    if (e) e.preventDefault();

    // Read directly from form DOM elements in case browser autofill didn't trigger React onChange
    let submittedName = name;
    let submittedEmail = email;
    let submittedPassword = password;
    let submittedConfirmPassword = confirmPassword;
    let submittedGithub = githubUsername;

    if (e?.target && e.target instanceof HTMLFormElement) {
      const fd = new FormData(e.target);
      submittedName = fd.get("name") ?? name;
      submittedEmail = fd.get("email") ?? email;
      submittedPassword = fd.get("password") ?? password;
      submittedConfirmPassword = fd.get("confirmPassword") ?? confirmPassword;
      submittedGithub = fd.get("username") ?? githubUsername;
    }

    submittedName = String(submittedName || "").trim();
    submittedEmail = String(submittedEmail || "").trim().toLowerCase();
    submittedPassword = String(submittedPassword || "");
    submittedConfirmPassword = String(submittedConfirmPassword || "");
    submittedGithub = String(submittedGithub || "").trim();

    if (!submittedEmail || !submittedPassword) {
      setError("Please provide an email address and password.");
      return;
    }

    if (submittedPassword !== submittedConfirmPassword) {
      setError("Passwords do not match. Please ensure both fields are identical.");
      return;
    }

    if (submittedPassword.length < 6) {
      setError("Password must be at least 6 characters in length.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/users", {
        name: submittedName || "Candidate",
        email: submittedEmail,
        password: submittedPassword,
        role,
        githubUsername: role === "student" ? submittedGithub : "",
      });
      setUser(data);
      persistUserSession(data);
      if (
        data.role === "recruiter" &&
        data.recruiterVerificationStatus &&
        data.recruiterVerificationStatus !== "COMPANY_EMAIL_VERIFIED"
      ) {
        setShowCompanyModal(true);
        return;
      }
      navigate(data.role === "recruiter" ? "/recruiter-dashboard" : "/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh]">
      <RecruiterCompanyOnboardingModal
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        onVerified={() => {
          navigate("/recruiter-dashboard");
        }}
      />

      {step === 1 ? (
        <div className="py-8 px-4">
          <RoleSelectionDeck onSelectRole={handleRoleSelection} />
        </div>
      ) : (
        <AuthShell role={role} mode="register" step={step}>
          <div className="w-full max-w-md mx-auto">
            <button
              type="button"
              onClick={handleBackNavigation}
              className="flex items-center gap-2 mb-6 text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Role Selection
            </button>

            <IdentityGatewayCard
              role={role}
              setRole={setRole}
              onGoogleAuth={handleGoogleRegister}
              googleLoading={googleLoading}
              onPasswordAuth={submitHandler}
              passwordLoading={loading}
              error={error}
              mode="register"
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              githubUsername={githubUsername}
              setGithubUsername={setGithubUsername}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          </div>
        </AuthShell>
      )}
    </div>
  );
};

export default Register;
