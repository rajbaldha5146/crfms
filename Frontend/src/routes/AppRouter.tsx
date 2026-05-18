import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

// Guards
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";
import RoleBasedLayout from "./RoleBasedLayout";

// Auth
import LoginPage from "../pages/auth/LoginPage";
import ChangePasswordPage from "../pages/auth/ChangePasswordPage";

// Admin
import CreateUserPage from "../pages/admin/CreateUserPage";

// PM (keeps its own separate layout + pages)
import PmDashboardLayout from "../components/layout/PmDashboardLayout";
import PMFeedbackMonitorPage from "../pages/pm/feedback/PMFeedbackMonitorPage";
import PMMonitorPage from "../pages/pm/feedback/PMMonitorPage";
import PMProjectWorkspacePage from "../pages/pm/projects/PMProjectWorkspacePage";
import PMUserFeedbackWorkspacePage from "../pages/pm/feedback/PMUserFeedbackWorkspacePage";
import PMCreateFeedbackPage from "../pages/pm/feedback/PMCreateFeedbackPage";
import PMHierarchyPage from "../pages/pm/hierarchy/PMHierarchyPage";
import PMUserDetailsPage from "../pages/pm/hierarchy/PMUserDetailsPage";
import PMProjectManagementPage from "../pages/pm/project-mgmt/PMProjectManagementPage";
import PMProjectMembersPage from "../pages/pm/project-mgmt/PMProjectMembersPage";

// Team Lead — dedicated pages
import TLDashboardPage from "../pages/tl/TLDashboardPage";
import TLProjectPage from "../pages/tl/TLProjectPage";
import TLUserFeedbackPage from "../pages/tl/TLUserFeedbackPage";
import TLCreateFeedbackPage from "../pages/tl/TLCreateFeedbackPage";
import TLMonitorPage from "../pages/tl/TLMonitorPage";

// Senior Developer — dedicated pages
import SeniorDashboardPage from "../pages/senior/SeniorDashboardPage";
import SeniorProjectPage from "../pages/senior/SeniorProjectPage";
import SeniorUserFeedbackPage from "../pages/senior/SeniorUserFeedbackPage";
import SeniorCreateFeedbackPage from "../pages/senior/SeniorCreateFeedbackPage";
import SeniorMonitorPage from "../pages/senior/SeniorMonitorPage";

// Junior Developer — dedicated pages
import JuniorDashboardPage from "../pages/junior/JuniorDashboardPage";
import JuniorProjectPage from "../pages/junior/JuniorProjectPage";

// Common pages (available to multiple roles)
import ReceivedFeedbacksPage from "../pages/common/ReceivedFeedbacksPage";
import SubmittedFeedbacksPage from "../pages/common/SubmittedFeedbacksPage";
import FeedbackDetailsPage from "../pages/common/FeedbackDetailsPage";

const AppRouter = () => {
  const { initialize, isInitializing, user } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isInitializing) {
    return null;
  }

  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/login" element={<LoginPage />} />

      {/* ── Authenticated: Change Password ── */}
      <Route element={<PrivateRoute />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* ── Smart Redirect based on role ── */}
      <Route element={<PrivateRoute />}>
        <Route
          path="/dashboard"
          element={
            user?.role === "Admin" ? (
              <Navigate to="/admin/users/create" replace />
            ) : user?.role === "Pm" ? (
              <Navigate to="/pm-projects" replace />
            ) : user?.role === "Tl" ? (
              <Navigate to="/tl" replace />
            ) : user?.role === "SeniorDeveloper" ? (
              <Navigate to="/senior" replace />
            ) : user?.role === "JuniorDeveloper" ? (
              <Navigate to="/junior" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

      </Route>

      {/* ── Admin Routes ── */}
      <Route element={<RoleRoute allowedRoles={["Admin"]} />}>
        <Route path="/admin/users/create" element={<CreateUserPage />} />
      </Route>

      {/* ── PM Routes (uses sidebar layout) ── */}
      <Route element={<RoleRoute allowedRoles={["Pm"]} />}>
        <Route element={<PmDashboardLayout />}>
          <Route path="/pm-projects" element={<PMFeedbackMonitorPage />} />
          <Route path="/pm-monitor" element={<PMMonitorPage />} />
          <Route path="/pm-projects/:projectId" element={<PMProjectWorkspacePage />} />
          <Route path="/pm-projects/:projectId/users/:userId" element={<PMUserFeedbackWorkspacePage />} />
          <Route path="/pm-projects/:projectId/create-feedback" element={<PMCreateFeedbackPage />} />
          <Route path="/pm-projects/:projectId/users/:userId/create-feedback" element={<PMCreateFeedbackPage />} />
          <Route path="/pm-hierarchy" element={<PMHierarchyPage />} />
          <Route path="/pm-users/:userId" element={<PMUserDetailsPage />} />
          <Route path="/pm-project-management" element={<PMProjectManagementPage />} />
          <Route path="/pm-project-management/:projectId/members" element={<PMProjectMembersPage />} />
        </Route>
      </Route>

      {/* ── Team Lead Routes ── */}
      <Route element={<RoleRoute allowedRoles={["Tl"]} />}>
        <Route path="/tl" element={<TLDashboardPage />} />
        <Route path="/tl/monitor" element={<TLMonitorPage />} />
        <Route path="/tl/projects/:projectId" element={<TLProjectPage />} />
        <Route path="/tl/projects/:projectId/users/:userId" element={<TLUserFeedbackPage />} />
        <Route path="/tl/projects/:projectId/create-feedback" element={<TLCreateFeedbackPage />} />
        <Route path="/tl/projects/:projectId/users/:userId/create-feedback" element={<TLCreateFeedbackPage />} />
      </Route>

      {/* ── Senior Developer Routes ── */}
      <Route element={<RoleRoute allowedRoles={["SeniorDeveloper"]} />}>
        <Route path="/senior" element={<SeniorDashboardPage />} />
        <Route path="/senior/monitor" element={<SeniorMonitorPage />} />
        <Route path="/senior/projects/:projectId" element={<SeniorProjectPage />} />
        <Route path="/senior/projects/:projectId/users/:userId" element={<SeniorUserFeedbackPage />} />
        <Route path="/senior/projects/:projectId/create-feedback" element={<SeniorCreateFeedbackPage />} />
        <Route path="/senior/projects/:projectId/users/:userId/create-feedback" element={<SeniorCreateFeedbackPage />} />
      </Route>

      {/* ── Junior Developer Routes ── */}
      <Route element={<RoleRoute allowedRoles={["JuniorDeveloper"]} />}>
        <Route path="/junior" element={<JuniorDashboardPage />} />
        <Route path="/junior/projects/:projectId" element={<JuniorProjectPage />} />
      </Route>

      {/* ── Shared Authenticated Routes (all roles) ── */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleBasedLayout />}>
          <Route path="/feedbacks/received" element={<ReceivedFeedbacksPage />} />
          <Route path="/feedbacks/submitted" element={<SubmittedFeedbacksPage />} />
          <Route path="/feedbacks/:feedbackId" element={<FeedbackDetailsPage />} />
        </Route>
      </Route>

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;
