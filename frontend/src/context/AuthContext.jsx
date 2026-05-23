import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    accessToken: null,
    username: null,
    role: null,
    userId: null,
    shopId: null,
  });
  const [shops, setShops] = useState([]);
  const [activeShopId, setActiveShopIdState] = useState(null);

  // Load from localStorage on first render
  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      setAuth(parsed);
      const savedActiveShop = localStorage.getItem("activeShopId");
      if (savedActiveShop) {
        setActiveShopIdState(Number(savedActiveShop));
      }
    }
  }, []);

  // Fetch shops when accessToken is available or changes
  useEffect(() => {
    if (auth.accessToken) {
      fetchShops(auth.accessToken).then((loadedShops) => {
        if (loadedShops.length > 0) {
          // If no active shop is selected yet, choose the first one
          // Or if activeShopId is not in the loaded shops, reset it
          const savedActiveShop = localStorage.getItem("activeShopId");
          const activeId = savedActiveShop ? Number(savedActiveShop) : null;
          
          if (activeId && loadedShops.some(s => s.id === activeId)) {
            setActiveShopIdState(activeId);
          } else {
            // Default to user's assigned shop_id (for staff) or the first owned shop (for owner)
            const defaultId = auth.shopId || loadedShops[0].id;
            setActiveShopIdState(defaultId);
            localStorage.setItem("activeShopId", defaultId);
          }
        }
      });
    } else {
      setShops([]);
      setActiveShopIdState(null);
    }
  }, [auth.accessToken, auth.shopId]);

  const setActiveShopId = (id) => {
    setActiveShopIdState(id);
    if (id) {
      localStorage.setItem("activeShopId", id);
    } else {
      localStorage.removeItem("activeShopId");
    }
  };

  const fetchShops = async (token) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/shops`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setShops(data);
        return data;
      }
    } catch (err) {
      console.error("Failed to fetch shops:", err);
    }
    return [];
  };

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

      // Support nested user schema or root level fallback
      const user = data.user || {};
      const newAuth = {
        accessToken: data.access_token,
        username: data.username || user.username || username,
        role: data.role || user.role,
        userId: data.user_id || user.id,
        shopId: data.shop_id || user.shop_id,
      };

      setAuth(newAuth);
      localStorage.setItem("auth", JSON.stringify(newAuth));
      
      // Try to fetch shops immediately to populate activeShopId
      const loaded = await fetchShops(newAuth.accessToken);
      if (loaded.length > 0) {
        const defaultId = newAuth.shopId || loaded[0].id;
        setActiveShopId(defaultId);
      }

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    }
  };

  // ---- Logout ------------------------------------------------
  const logout = () => {
    setAuth({ accessToken: null, username: null, role: null, userId: null, shopId: null });
    setShops([]);
    setActiveShopId(null);
    localStorage.removeItem("auth");
    localStorage.removeItem("activeShopId");
  };

  const isAuthenticated = !!auth.accessToken;

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        isAuthenticated,
        shops,
        activeShopId,
        setActiveShopId,
        fetchShops: () => fetchShops(auth.accessToken),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
