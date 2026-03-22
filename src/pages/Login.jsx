import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      alert("Invalid email or password");
    }
  };

  return (
    <PageTransition className="flex items-center justify-center pt-20">
      <div className="w-full max-w-md bg-black/80 backdrop-blur-2xl border border-orange-500/30 shadow-[0_0_30px_rgba(255,100,0,0.15)] rounded-2xl p-10">
        <h2 className="text-4xl font-serif text-white font-light tracking-wider text-center mb-10 uppercase">
          Welcome <span className="text-orange-500 italic lowercase normal-case">Back</span>
        </h2>
        <form onSubmit={submitHandler} className="space-y-6">
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
          <button
            type="submit"
            className="w-full mt-8 bg-orange-600 shadow-[0_0_15px_rgba(255,69,0,0.5)] hover:bg-orange-500 text-white font-bold tracking-widest uppercase py-3 rounded-lg transition-all duration-300"
          >
            Sign in
          </button>
        </form>
      </div>
    </PageTransition>
  );
};

export default Login;
