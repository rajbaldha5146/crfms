import { Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import PmDashboardLayout from "../components/layout/PmDashboardLayout";

/**
 * For shared routes like /feedbacks/received.
 * If the user is a PM, wrap the page in the PmDashboardLayout so they get the sidebar.
 * For other roles, just render the page normally (it will use the top Header inside the page).
 */
const RoleBasedLayout = () => {
  const { user } = useAuthStore();

  if (user?.role === "Pm") {
    return <PmDashboardLayout />;
  }

  return <Outlet />;
};

export default RoleBasedLayout;
