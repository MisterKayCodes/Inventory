import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import LoadingButton from "../components/LoadingButton.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const doLogin = async (user, pass, setLoad) => {
    setErrorMsg("");
    setLoad(true);
    const result = await login(user, pass);
    setLoad(false);
    if (result.success) {
      navigate("/dashboard/overview");
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doLogin(username, password, setLoading);
  };

  const handleDemo = () => {
    doLogin("demouser", "demo123", setDemoLoading);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="glass p-8 w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary-light mx-auto mb-4 flex items-center justify-center text-2xl">
            📦
          </div>
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="text-xs text-gray-400 mt-1">Stock management made simple</p>
        </div>

        {errorMsg && (
          <p className="text-red-400 mb-4 text-center text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-2">
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            id="login-username"
            type="text"
            placeholder="Username"
            className="w-full p-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-light transition"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <input
            id="login-password"
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-light transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <LoadingButton
            id="login-submit"
            type="submit"
            className="w-full py-3"
            loading={loading}
          >
            Sign In
          </LoadingButton>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-gray-500">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Demo Button */}
        <LoadingButton
          id="login-demo"
          type="button"
          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300"
          style={{ background: "" }}
          loading={demoLoading}
          onClick={handleDemo}
        >
          👀 Try the Demo
        </LoadingButton>
        <p className="text-center text-xs text-gray-500 mt-2">
          No account needed — explore all features instantly
        </p>
      </div>
    </div>
  );
}