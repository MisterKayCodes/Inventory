import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadingButton from "../components/LoadingButton.jsx";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("owner");
  const [shopId, setShopId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const payload = {
      username,
      password,
      role,
      shop_id: role === "staff" ? Number(shopId) : null,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="glass p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center text-primary">
          Create Account
        </h2>

        {errorMsg && <p className="text-error mb-4 text-center bg-error rounded p-2 text-sm">{errorMsg}</p>}
        {success && (
          <p className="text-success mb-4 text-center bg-success rounded p-2 text-sm">
            Registration successful! Redirecting to login...
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Username"
              className="w-full p-2.5 rounded border border-white/10 bg-[#111122]/50 text-white focus:outline-none focus:border-[#5c5cff]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading || success}
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2.5 rounded border border-white/10 bg-[#111122]/50 text-white focus:outline-none focus:border-[#5c5cff]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || success}
            />
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-400 block mb-1">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2.5 rounded border border-white/10 bg-[#111122]/50 text-white focus:outline-none focus:border-[#5c5cff] cursor-pointer"
              disabled={loading || success}
            >
              <option value="owner">Business Owner</option>
              <option value="staff">Shop Staff</option>
            </select>
          </div>

          {role === "staff" && (
            <div className="mb-4 fade-in">
              <input
                type="number"
                placeholder="Shop ID (Provided by Owner)"
                className="w-full p-2.5 rounded border border-white/10 bg-[#111122]/50 text-white focus:outline-none focus:border-[#5c5cff]"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                required={role === "staff"}
                disabled={loading || success}
              />
            </div>
          )}

          <LoadingButton type="submit" className="w-full mt-2" loading={loading} disabled={success}>
            Sign Up
          </LoadingButton>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-light hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
