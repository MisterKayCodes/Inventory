import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

// Context & auth
import { AuthProvider } from "./context/AuthContext.jsx";
import RequireAuth from "./components/RequireAuth.jsx";

// Layout
import DashboardLayout from "./components/DashboardLayout.jsx";

// Pages
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Shops from "./pages/Shops.jsx";
import Inventory from "./pages/Inventory.jsx";
import Verification from "./pages/Verification.jsx";
import Transactions from "./pages/Transactions.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route path="overview" element={<Dashboard />} />
            <Route path="shops" element={<Shops />} />
            <Route path="products" element={<Inventory />} />
            <Route path="verify" element={<Verification />} />
            <Route path="transactions" element={<Transactions />} />
            
            {/* Fallback inside dashboard */}
            <Route path="" element={<Navigate to="overview" replace />} />
          </Route>

          {/* Fallback – direct to login if not authenticated */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
