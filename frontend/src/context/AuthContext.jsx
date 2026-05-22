import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    accessToken: null,
    role: null,
    userId: null,
    shopId: null,
  });

  // Load from localStorage on first render
  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) setAuth(JSON.parse(stored));
  }, []);

  // ---- Login -------------------------------------------------
  const login = async (username, password) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) throw new Error("Invalid username or password");

      const data = await response.json();

      const newAuth = {
        accessToken: data.access_token,
        role: data.role,
        userId: data.user_id,
        shopId: data.shop_id,
      };

      setAuth(newAuth);
      localStorage.setItem("auth", JSON.stringify(newAuth));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    }
  };

  // ---- Logout ------------------------------------------------
  const logout = () => {
    setAuth({ accessToken: null, role: null, userId: null, shopId: null });
    localStorage.removeItem("auth");
  };

  const isAuthenticated = !!auth.accessToken;

  return (
    <AuthContext.Provider
      value={{ ...auth, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
