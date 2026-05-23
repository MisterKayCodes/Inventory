import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { accessToken, role, activeShopId, username, shops } = useAuth();
  
  // State
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Re-route Staff users to the Inventory page
  if (role !== "owner") {
    return <Navigate to="/dashboard/products" replace />;
  }

  useEffect(() => {
    if (activeShopId) {
      fetchMetrics();
    }
  }, [activeShopId]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/dashboard/overview`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard metrics");
      }
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back, {username || "Owner"}! 👋</h1>
        <p className="text-sm text-gray-400">Here's how your business is doing today.</p>
      </div>

      {shops.length === 0 ? (
        <div className="glass p-12 mt-8 text-center border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center space-y-6">
          <div className="text-6xl">🏪</div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to your new dashboard!</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Before you can add products or record sales, you need to set up your first shop location.
            </p>
          </div>
          <Link
            to="/dashboard/shops"
            className="btn px-8 py-4 text-lg font-bold shadow-[0_0_20px_rgba(92,92,255,0.3)] hover:-translate-y-1 transition-transform"
          >
            Step 1: Create Your First Shop
          </Link>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading your business summary...</div>
          ) : error ? (
            <div className="glass p-6 border border-red-500/20 text-center">
              <p className="text-error">{error}</p>
              <button onClick={fetchMetrics} className="btn mt-4 text-xs">
                Retry Loading
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sales Card */}
              <div className="glass p-6 flex flex-col justify-between hover-lift">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Total Sales</span>
                  <h2 className="text-4xl font-extrabold text-white mt-2 mb-1">
                    {metrics ? metrics.total_sales_count : 0}
                  </h2>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-400">
                  Successful sales recorded
                </div>
              </div>

              {/* Revenue Card */}
              <div className="glass p-6 flex flex-col justify-between hover-lift">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Total Earnings</span>
                  <h2 className="text-4xl font-extrabold text-primary-light mt-2 mb-1">
                    {metrics
                      ? metrics.total_revenue.toLocaleString("en-NG", {
                          style: "currency",
                          currency: "NGN",
                          maximumFractionDigits: 0,
                        })
                      : "₦0"}
                  </h2>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-400">
                  Total money from all sales
                </div>
              </div>

              {/* Stock Errors Card */}
              <div className="glass p-6 flex flex-col justify-between hover-lift">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Stock Errors</span>
                  <h2 className="text-4xl font-extrabold text-red-400 mt-2 mb-1">
                    {metrics ? metrics.total_errors : 0}
                  </h2>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-400">
                  Items with wrong serial numbers
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions Panel */}
          <div className="glass p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/dashboard/products"
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-center font-medium block"
              >
                📦 View My Products
              </Link>
              <Link
                to="/dashboard/verify"
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-center font-medium block"
              >
                🔍 Check a Serial Number
              </Link>
              <Link
                to="/dashboard/shops"
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-center font-medium block"
              >
                🏪 Manage Shops
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
