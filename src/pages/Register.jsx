import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import { useTheme } from "../context/ThemeContext";
import { UserPlus, Mail, Lock, Github, UserCircle, Target, ShieldCheck, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { persistUserSession } from "../utils/authStorage";

const Register = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [githubUsername, setGithubUsername] = useState("");
  const { setUser } = useAuth();
  useTheme();
  const navigate = useNavigate();

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/api/users", {
        name,
        email,
        password,
        role,
        githubUsername,
      });
      setUser(data);
      persistUserSession(data);
      navigate("/dashboard");
    } catch {
      alert("Error registering");
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl relative">
        
        {/* Step 1: The Choice */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col md:flex-row gap-6 md:gap-0 w-full"
            >
              <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 bg-[var(--color-bg)] border border-[var(--color-border)] hover:bg-[var(--color-text)] transition-colors group cursor-pointer min-h-[350px] md:min-h-[500px]" onClick={() => handleRoleSelection("student")}>
                <Target className="w-16 h-16 md:w-20 md:h-20 mb-6 text-[var(--color-text)] group-hover:text-[var(--color-bg)] transition-colors opacity-40 group-hover:opacity-100" />
                <h2 className="text-3xl lg:text-5xl font-black italic uppercase tracking-tighter text-[var(--color-text)] group-hover:text-[var(--color-bg)] transition-colors text-center leading-none">
                  CANDIDATE
                </h2>
                <p className="mt-4 md:mt-6 text-xs md:text-sm font-mono tracking-widest text-[var(--color-text)] group-hover:text-[var(--color-bg)] transition-colors opacity-60 text-center max-w-[250px]">
                  Submit your architectural evidence.
                </p>
                <div className="mt-8 md:mt-10 px-6 py-2 border border-current text-[var(--color-text)] group-hover:text-[var(--color-bg)] text-[10px] md:text-xs font-bold uppercase tracking-widest">
                   Select Origin
                </div>
              </div>

              <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 bg-[var(--color-accent)] border border-[var(--color-accent)] hover:opacity-95 transition-all group cursor-pointer min-h-[350px] md:min-h-[500px]" onClick={() => handleRoleSelection("recruiter")}>
                <ShieldCheck className="w-16 h-16 md:w-20 md:h-20 mb-6 text-[var(--color-bg)] opacity-60 group-hover:opacity-100 transition-opacity" />
                <h2 className="text-3xl lg:text-5xl font-black italic uppercase tracking-tighter text-[var(--color-bg)] text-center leading-none">
                  INVESTIGATOR
                </h2>
                <p className="mt-4 md:mt-6 text-xs md:text-sm font-mono tracking-widest text-[var(--color-bg)] opacity-80 text-center max-w-[250px]">
                  Audit portfolios and source truth.
                </p>
                <div className="mt-8 md:mt-10 px-6 py-2 bg-[var(--color-bg)] text-[var(--color-accent)] text-[10px] md:text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                   Grant Access
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: The Form */}
          {step === 2 && (
            <motion.div 
              key="step-2"
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-xl mx-auto glass-card p-8 md:p-12 relative overflow-hidden"
            >
              <button 
                onClick={() => setStep(1)} 
                className="absolute top-6 left-6 flex items-center gap-2 text-xs font-mono uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-[var(--color-accent)] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Retreat
              </button>

              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent)] opacity-5 blur-3xl -mr-12 -mt-12" />
              
              <div className="text-center mb-12 mt-4">
                <p className="text-sm font-mono tracking-[0.4em] uppercase opacity-40 mb-3 hover:text-[var(--color-accent)] transition-colors cursor-default">
                  {role === "student" ? "CANDIDATE_PROTOCOL" : "INVESTIGATOR_PROTOCOL"}
                </p>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                  Join the <span className="opacity-40">Archive</span>
                </h2>
                <div className="h-[2px] w-12 bg-[var(--color-accent)] mx-auto mt-6 opacity-30" />
              </div>

              <form onSubmit={submitHandler} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm uppercase tracking-[0.2em] font-bold opacity-50 mb-2 flex items-center gap-2">
                      <UserCircle className="w-3 h-3" /> Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={role === "student" ? "John_Doe" : "Sarah_Connor"}
                      className="w-full px-4 py-3 bg-[var(--color-bg)]/50 border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] transition-all font-mono text-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm uppercase tracking-[0.2em] font-bold opacity-50 mb-2 flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="identity@protocol.com"
                      className="w-full px-4 py-3 bg-[var(--color-bg)]/50 border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] transition-all font-mono text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm uppercase tracking-[0.2em] font-bold opacity-50 mb-2 flex items-center gap-2">
                      <Lock className="w-3 h-3" /> Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-[var(--color-bg)]/50 border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] transition-all font-mono text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {role === "student" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="pt-2 overflow-hidden"
                    >
                      <label className="block text-sm uppercase tracking-[0.2em] font-bold opacity-50 mb-2 flex items-center gap-2">
                        <Github className="w-3 h-3" /> GitHub Username
                      </label>
                      <input
                        type="text"
                        placeholder="github_handle"
                        className="w-full px-4 py-3 bg-[var(--color-bg)]/50 border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] transition-all font-mono text-sm"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-[var(--color-accent)] text-[var(--color-bg)] font-bold tracking-[0.3em] uppercase py-4 hover:opacity-90 transition-all shadow-[0_0_25px_var(--color-accent)]/20 flex items-center justify-center gap-3 group"
                  >
                    Initialize_Profile <UserPlus className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="mt-6 text-center text-sm uppercase tracking-widest opacity-40">
                    Already have credentials? <Link to="/login" className="text-[var(--color-accent)] border-b border-[var(--color-accent)] pb-0.5 hover:opacity-70 transition-all">Sign_In</Link>
                  </p>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Register;
