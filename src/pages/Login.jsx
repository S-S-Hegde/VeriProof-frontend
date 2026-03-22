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
      <div className="w-full max-w-md glass-card p-10">
        <h2 className="text-4xl font-serif text-vp-teal font-light tracking-wider text-center mb-10 uppercase">
          Welcome <span className="text-ibex-rose italic lowercase normal-case">Back</span>
        </h2>
        <form onSubmit={submitHandler} className="space-y-6">
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
          <button
            type="submit"
            className="ibex-button-primary w-full mt-8"
          >
            Sign in
          </button>
        </form>
      </div>
    </PageTransition>
  );
};

export default Login;
