import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Shops() {
  const { accessToken, role, shops, activeShopId, setActiveShopId, fetchShops } = useAuth();
  
  // Shop State
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Staff State
  const [staffUsername, setStaffUsername] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffShopId, setStaffShopId] = useState("");
  const [staffError, setStaffError] = useState("");
  const [staffSuccess, setStaffSuccess] = useState("");
  const [staffLoading, setStaffLoading] = useState(false);

  // Access control
  if (role !== "owner") {
    return (
      <div className="glass p-8 max-w-lg mx-auto text-center mt-10">
        <h2 className="text-xl font-bold text-error mb-2">Access Denied</h2>
        <p className="text-sm text-gray-400">Only business owners can access shop management.</p>
      </div>
    );
  }

  const handleShopSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/shops`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name, location }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create shop");
      }

      setSuccessMsg(`Shop "${name}" successfully registered!`);
      setName("");
      setLocation("");
      
      // Re-fetch list of shops so they appear in dropdown/list
      await fetchShops();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setStaffError("");
    setStaffSuccess("");
    setStaffLoading(true);

    if (!staffShopId && !activeShopId) {
      setStaffError("You must select a shop for the staff member.");
      setStaffLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: staffUsername,
          password: staffPassword,
          role: "staff",
          shop_id: Number(staffShopId) || activeShopId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create staff account");
      }

      setStaffSuccess(`Staff account "${staffUsername}" created successfully! Hand them these details to log in.`);
      setStaffUsername("");
      setStaffPassword("");
    } catch (err) {
      console.error(err);
      setStaffError(err.message);
    } finally {
      setStaffLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Manage Shops</h1>
        <p className="text-sm text-gray-400">
          Add new shops and create accounts for your staff members so they can log in.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Forms */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Add Shop Form */}
          <div className="glass p-6">
            <h2 className="text-lg font-semibold mb-4 text-primary-light">
              Add New Shop
            </h2>

            {errorMsg && <p className="text-red-400 mb-4 text-xs bg-red-500/10 border border-red-500/20 rounded p-2">{errorMsg}</p>}
            {successMsg && <p className="text-emerald-400 mb-4 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded p-2">{successMsg}</p>}

            <form onSubmit={handleShopSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Shop Name</label>
                <input
                  type="text"
                  placeholder="e.g. downtown branch"
                  className="w-full p-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary-light"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Location / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Block A, Suite 5"
                  className="w-full p-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary-light"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn w-full mt-2" disabled={loading}>
                {loading ? "Adding..." : "Add Shop"}
              </button>
            </form>
          </div>

          {/* Add Staff Form */}
          <div className="glass p-6">
            <h2 className="text-lg font-semibold mb-1 text-emerald-400">
              Add Staff Member
            </h2>
            <p className="text-xs text-gray-400 mb-4">Create a login for your employee.</p>

            {staffError && <p className="text-red-400 mb-4 text-xs bg-red-500/10 border border-red-500/20 rounded p-2">{staffError}</p>}
            {staffSuccess && <p className="text-emerald-400 mb-4 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded p-2">{staffSuccess}</p>}

            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Staff Username</label>
                <input
                  type="text"
                  placeholder="e.g. john_doe"
                  className="w-full p-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-emerald-500"
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  required
                  disabled={staffLoading}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Temporary Password</label>
                <input
                  type="text"
                  placeholder="e.g. secret123"
                  className="w-full p-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-emerald-500"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  required
                  disabled={staffLoading}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Assign to Shop</label>
                <select
                  value={staffShopId || activeShopId || ""}
                  onChange={(e) => setStaffShopId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-white/10 bg-[#111122] text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  required
                  disabled={staffLoading || shops.length === 0}
                >
                  <option value="" disabled>Select a shop...</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>{shop.name}</option>
                  ))}
                </select>
                {shops.length === 0 && (
                  <p className="text-[10px] text-red-400 mt-1">You must create a shop first.</p>
                )}
              </div>

              <button 
                type="submit" 
                className="w-full mt-2 py-3 px-4 rounded-lg font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition disabled:opacity-50" 
                disabled={staffLoading || shops.length === 0}
              >
                {staffLoading ? "Creating..." : "Create Staff Account"}
              </button>
            </form>
          </div>

        </div>

        {/* Existing Shops List */}
        <div className="lg:col-span-2">
          <div className="glass p-6 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Your Shops ({shops.length})</h2>

            {shops.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-lg">
                <p className="text-gray-400 mb-2">No shops registered yet.</p>
                <p className="text-xs text-gray-500">Create your first shop using the form to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shops.map((shop) => {
                  const isCurrentActive = shop.id === activeShopId;
                  return (
                    <div
                      key={shop.id}
                      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                        isCurrentActive
                          ? "border-primary-light bg-primary-light/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                      onClick={() => setActiveShopId(shop.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="font-semibold text-base truncate max-w-[70%]">{shop.name}</h3>
                      </div>
                      <p className="text-xs text-gray-400 mb-4">{shop.location}</p>
                      <div className="flex justify-between items-center text-xs border-t border-white/10 pt-3">
                        <span
                          className={`font-semibold ${isCurrentActive ? "text-primary-light" : "text-gray-500"}`}
                        >
                          {isCurrentActive ? "✓ Active Shop" : "Click to select"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
