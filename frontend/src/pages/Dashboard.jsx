import React from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { role, shopId } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#111122] to-[#191032]">
      <div className="glass p-8 max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--color-primary)" }}>
          Owner Dashboard
        </h1>
        <p className="mb-2">Role: {role}</p>
        <p className="mb-2">Shop ID: {shopId}</p>
        <p className="text-muted">(Dashboard UI coming soon…)</p>
      </div>
    </div>
  );
}
