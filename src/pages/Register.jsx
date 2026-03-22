import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [githubUsername, setGithubUsername] = useState("");
  const { setUser } = useAuth();
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
      <div className="w-full max-w-md glass-card p-10">
        <h2 className="text-4xl font-serif text-vp-teal font-light tracking-wider text-center mb-10 uppercase">
          Join <span className="text-ibex-rose italic lowercase normal-case">Us</span>
        </h2>
        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest font-medium text-ibex-muted mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-4 py-3 bg-white border border-vp-teal/30 rounded-lg focus:outline-none focus:border-vp-teal text-vp-teal transition-colors sm:text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-medium text-ibex-muted mb-2">
              Email address
            </label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-4 py-3 bg-white border border-vp-teal/30 rounded-lg focus:outline-none focus:border-vp-teal text-vp-teal transition-colors sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-medium text-ibex-muted mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-4 py-3 bg-white border border-vp-teal/30 rounded-lg focus:outline-none focus:border-vp-teal text-vp-teal transition-colors sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-medium text-ibex-muted mb-2">
              Role
            </label>
            <select
              className="mt-1 block w-full px-4 py-3 bg-white border border-vp-teal/30 rounded-lg focus:outline-none focus:border-vp-teal text-vp-teal transition-colors sm:text-sm [&>option]:bg-white [&>option]:text-vp-teal"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student / Candidate</option>
              <option value="recruiter">Recruiter / Employer</option>
            </select>
          </div>
          {role === "student" && (
            <div>
              <label className="block text-xs uppercase tracking-widest font-medium text-ibex-muted mb-2">
                GitHub Username
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-4 py-3 bg-white border border-vp-teal/30 rounded-lg focus:outline-none focus:border-vp-teal text-vp-teal transition-colors sm:text-sm"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
              />
            </div>
          )}
          <button
            type="submit"
            className="ibex-button-primary w-full mt-8"
          >
            Sign up
          </button>
        </form>
      </div>
    </PageTransition>
  );
};

export default Register;
