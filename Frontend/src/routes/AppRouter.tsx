import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";
import { useAuthStore } from "../store/useAuthStore";

import AdminDashboard from "../pages/admin/AdminDashboard";

const AppRouter = () => {
  const { initialize, isInitializing } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isInitializing) {
    return null; // Or a loading spinner
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* 1. Protected Routes (Any logged-in user can view) */}
      <Route element={<PrivateRoute />}>
        {/* We'll handle dashboard redirection in the Dashboard component or here */}
        <Route path="/dashboard" element={<Navigate to="/admin-dashboard" replace />} />
      </Route>

      {/* 2. Role-Protected Routes (ONLY Admins can view) */}
      <Route element={<RoleRoute allowedRoles={["Admin"]} />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRouter;
