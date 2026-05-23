import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function DashboardLayout() {
  const { username, role, shops, activeShopId, setActiveShopId, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Filter links based on user roles
  const menuItems = [
    { name: "Overview",      path: "/dashboard/overview",      roles: ["owner"] },
    { name: "Manage Shops",  path: "/dashboard/shops",         roles: ["owner"] },
    { name: "My Products",   path: "/dashboard/products",      roles: ["owner", "staff"] },
    { name: "Check Serial",  path: "/dashboard/verify",        roles: ["owner", "staff"] },
    { name: "Sales History", path: "/dashboard/transactions",  roles: ["owner"] },
  ].filter((item) => item.roles.includes(role));

  const activeShop = shops.find((s) => s.id === activeShopId);

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-6">
      <div>
        {/* Header / Brand */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-wide text-primary-light">
            Inventory
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{role} Portal</p>
        </div>

        {/* User Card */}
        <div className="glass p-4 mb-6 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5c5cff] to-[#8a8aff] flex items-center justify-center font-bold text-white uppercase">
              {username ? username[0] : "U"}
            </div>
            <div>
              <p className="font-semibold text-sm truncate max-w-[150px]">{username || "User"}</p>
              <p className="text-xs text-gray-400 capitalize">{role}</p>
            </div>
          </div>

          {/* Shop Selector */}
          {shops.length > 0 && (
            <div className="mt-3">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Active Shop</label>
              <select
                value={activeShopId || ""}
                onChange={(e) => setActiveShopId(Number(e.target.value))}
                className="w-full bg-[#111122]/80 text-white text-xs border border-white/10 rounded p-2 focus:outline-none cursor-pointer"
              >
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border ${
                isActive(item.path)
                  ? "bg-primary border-white/20 text-white font-semibold"
                  : "bg-transparent border-transparent text-white font-normal"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
      >
        Sign Out
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden text-white">
      {/* Desktop Sidebar (Glassmorphic) */}
      <aside className="hidden md:block w-72 h-full border-r border-white/10 bg-secondary/45 backdrop-blur-md">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar / Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 h-full border-r border-white/10 md:hidden transition-transform duration-300 ease-in-out bg-secondary/95 backdrop-blur-xl ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#191032]/60 backdrop-blur-md">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-white hover:text-gray-300 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-lg text-primary-light">
            {activeShop ? activeShop.name : "Inventory"}
          </span>
          <div className="w-6 h-6" /> {/* Spacer */}
        </header>

        {/* Content body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
