import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

interface RoleRouteProps {
  allowedRoles: string[];
}

const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();

  // If not logged in, they shouldn't even be here (PrivateRoute handles this, but just in case)
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If their role is in the list of allowed roles, render the component
  if (user.role && allowedRoles.includes(user.role)) {
    return <Outlet />;
  }

  // Otherwise, they are logged in but don't have permission! Redirect to unauthorized or a default page
  // You might want to create a generic "Not Authorized" page at /unauthorized
  return <Navigate to="/dashboard" replace />;
};

export default RoleRoute;