import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import { useTheme } from "../context/ThemeContext";
import { UserPlus, Mail, Lock, Github, UserCircle } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [githubUsername, setGithubUsername] = useState("");
  const { setUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/users", {
        name,
        email,
        password,
        role,
        githubUsername,
      });
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/dashboard");
    } catch (error) {
      alert("Error registering");
    }
  };

  return (
    <PageTransition className="flex items-center justify-center pt-10 pb-20">
      <div className="w-full max-w-lg glass-card p-12 relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent)] opacity-5 blur-3xl -mr-12 -mt-12" />
        
        <div className="text-center mb-12">
          <p className="text-[10px] font-mono tracking-[0.4em] uppercase opacity-40 mb-3">Enlistment_Protocol</p>
          <h2 className="text-4xl h1">
            Join the <span className="opacity-40 italic">Archive</span>
          </h2>
          <div className="h-[2px] w-12 bg-[var(--color-accent)] mx-auto mt-6 opacity-30" />
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold opacity-50 mb-2 flex items-center gap-2">
                <UserCircle className="w-3 h-3" /> Full Name
              </label>
              <input
                type="text"
                required
                placeholder="John_Doe"
                className="w-full px-4 py-3 bg-[var(--color-bg)]/50 border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] transition-all font-mono text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold opacity-50 mb-2 flex items-center gap-2">
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

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold opacity-50 mb-2 flex items-center gap-2">
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

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold opacity-50 mb-2">
                System Role
              </label>
              <select
                className="w-full px-4 py-3 bg-[var(--color-bg)]/50 border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] transition-all font-mono text-sm appearance-none cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Candidate</option>
                <option value="recruiter">Investigator</option>
              </select>
            </div>
          </div>

          {role === "student" && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-500">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold opacity-50 mb-2 flex items-center gap-2">
                <Github className="w-3 h-3" /> GitHub Username
              </label>
              <input
                type="text"
                placeholder="github_handle"
                className="w-full px-4 py-3 bg-[var(--color-bg)]/50 border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] transition-all font-mono text-sm"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
              />
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-[var(--color-accent)] text-[var(--color-bg)] font-bold tracking-[0.3em] uppercase py-4 hover:opacity-90 transition-all shadow-[0_0_25px_var(--color-accent)]/20 flex items-center justify-center gap-3 group"
            >
              Initialize_Profile <UserPlus className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-6 text-center text-[10px] uppercase tracking-widest opacity-40">
              Already have credentials? <Link to="/login" className="text-[var(--color-accent)] border-b border-[var(--color-accent)] pb-0.5 hover:opacity-70 transition-all">Sign_In</Link>
            </p>
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default Register;
