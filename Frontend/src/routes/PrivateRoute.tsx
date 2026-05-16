import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "../store/useAuthStore";

const PrivateRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  const location = useLocation();

  // Not authenticated

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Force first login password change

  if (user?.isFirstLogin && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  // Prevent access to change password
  // after first login completed

  if (!user?.isFirstLogin && location.pathname === "/change-password") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;