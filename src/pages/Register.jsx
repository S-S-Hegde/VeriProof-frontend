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
      <div className="w-full max-w-md bg-black/80 backdrop-blur-2xl border border-orange-500/30 shadow-[0_0_30px_rgba(255,100,0,0.15)] rounded-2xl p-10">
        <h2 className="text-4xl font-serif text-white font-light tracking-wider text-center mb-10 uppercase">
          Join <span className="text-orange-500 italic lowercase normal-case">Us</span>
        </h2>
        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest font-medium text-gray-400 mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-lg focus:outline-none focus:border-orange-500 text-white transition-colors sm:text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-medium text-gray-400 mb-2">
              Email address
            </label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-lg focus:outline-none focus:border-orange-500 text-white transition-colors sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-medium text-gray-400 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-lg focus:outline-none focus:border-orange-500 text-white transition-colors sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-medium text-gray-400 mb-2">
              Role
            </label>
            <select
              className="mt-1 block w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-lg focus:outline-none focus:border-orange-500 text-white transition-colors sm:text-sm [&>option]:bg-black [&>option]:text-white"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student / Candidate</option>
              <option value="recruiter">Recruiter / Employer</option>
            </select>
          </div>
          {role === "student" && (
            <div>
              <label className="block text-xs uppercase tracking-widest font-medium text-gray-400 mb-2">
                GitHub Username
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-lg focus:outline-none focus:border-orange-500 text-white transition-colors sm:text-sm"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full mt-8 bg-orange-600 shadow-[0_0_15px_rgba(255,69,0,0.5)] hover:bg-orange-500 text-white font-bold tracking-widest uppercase py-3 rounded-lg transition-all duration-300"
          >
            Sign up
          </button>
        </form>
      </div>
    </PageTransition>
  );
};

export default Register;
