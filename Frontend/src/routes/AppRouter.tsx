import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

// Guards
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";

// Pages
import LoginPage from "../pages/auth/LoginPage";
// import AdminDashboard from "../pages/admin/AdminDashboard";
import PMFeedbackMonitorPage from "../pages/pm/feedback/PMFeedbackMonitorPage";
import PMProjectWorkspacePage from "../pages/pm/projects/PMProjectWorkspacePage";
import PMUserFeedbackWorkspacePage from "../pages/pm/feedback/PMUserFeedbackWorkspacePage";
import PMCreateFeedbackPage from "../pages/pm/feedback/PMCreateFeedbackPage";
import ReceivedFeedbacksPage from "../pages/common/ReceivedFeedbacksPage";
import SubmittedFeedbacksPage from "../pages/common/SubmittedFeedbacksPage";

// Workspace module (TL + SeniorDeveloper only)
import WorkspaceDashboardPage from "../modules/workspace/pages/WorkspaceDashboardPage";
import WorkspaceProjectPage from "../modules/workspace/pages/WorkspaceProjectPage";
import WorkspaceUserFeedbackPage from "../modules/workspace/pages/Workspaceuserfeedbackpage";
import WorkspaceMonitorPage from "../modules/workspace/pages/WorkspaceMonitorPage";
import FeedbackDetailsPage from "../pages/common/FeedbackDetailsPage";
import CreateFeedbackPage from "../modules/workspace/pages/CreateFeedbackPage";
import PMMonitorPage from "../pages/pm/feedback/PMMonitorPage";

// Junior Developer pages (completely separate flow)
import JuniorDashboardPage from "../pages/junior/JuniorDashboardPage";
import JuniorProjectPage from "../pages/junior/JuniorProjectPage";
import ChangePasswordPage from "../pages/auth/ChangePasswordPage";
import CreateUserPage from "../pages/admin/CreateUserPage";
import PmDashboardLayout from "../components/layout/PmDashboardLayout";
import PMHierarchyPage from "../pages/pm/hierarchy/PMHierarchyPage";
import PMUserDetailsPage from "../pages/pm/hierarchy/PMUserDetailsPage";
import PMProjectManagementPage from "../pages/pm/project-mgmt/PMProjectManagementPage";
import PMProjectMembersPage from "../pages/pm/project-mgmt/PMProjectMembersPage";

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
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      <Route element={<PrivateRoute />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* Protected Dashboard Redirect */}
      <Route element={<PrivateRoute />}>
        <Route
          path="/dashboard"
          element={
            user?.role === "Admin" ? (
              <Navigate to="/admin/users/create" replace />
            ) : user?.role === "Pm" ? (
              <Navigate to="/pm-projects" replace />
            ) : user?.role === "Tl" ? (
              <Navigate to="/workspace" replace />
            ) : user?.role === "SeniorDeveloper" ? (
              <Navigate to="/workspace" replace />
            ) : user?.role === "JuniorDeveloper" ? (
              <Navigate to="/junior" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Shared routes available to all authenticated roles */}
        <Route path="/feedbacks/received" element={<ReceivedFeedbacksPage />} />
        <Route
          path="/feedbacks/submitted"
          element={<SubmittedFeedbacksPage />}
        />
        <Route
          path="/feedbacks/:feedbackId"
          element={<FeedbackDetailsPage />}
        />
      </Route>

      {/* Admin Routes */}
      <Route element={<RoleRoute allowedRoles={["Admin"]} />}>
        {/* <Route path="/admin-dashboard" element={<AdminDashboard />} /> */}
        <Route path="/admin/users/create" element={<CreateUserPage />} />
      </Route>

      {/* PM Routes */}

      <Route element={<RoleRoute allowedRoles={["Pm"]} />}>
        <Route element={<PmDashboardLayout />}>
          <Route path="/pm-projects" element={<PMFeedbackMonitorPage />} />

          <Route path="/pm-monitor" element={<PMMonitorPage />} />

          <Route
            path="/pm-projects/:projectId"
            element={<PMProjectWorkspacePage />}
          />

          <Route
            path="/pm-projects/:projectId/users/:userId"
            element={<PMUserFeedbackWorkspacePage />}
          />

          <Route
            path="/pm-projects/:projectId/create-feedback"
            element={<PMCreateFeedbackPage />}
          />

          <Route
            path="/pm-projects/:projectId/users/:userId/create-feedback"
            element={<PMCreateFeedbackPage />}
          />
          <Route
            path="/feedbacks/received"
            element={<ReceivedFeedbacksPage />}
          />

          <Route
            path="/feedbacks/submitted"
            element={<SubmittedFeedbacksPage />}
          />

          <Route
            path="/feedbacks/:feedbackId"
            element={<FeedbackDetailsPage />}
          />

          <Route path="/pm-hierarchy" element={<PMHierarchyPage />} />

          <Route path="/pm-users/:userId" element={<PMUserDetailsPage />} />

          <Route
            path="/pm-project-management"
            element={<PMProjectManagementPage />}
          />

          <Route
            path="/pm-project-management/:projectId/members"
            element={<PMProjectMembersPage />}
          />
        </Route>
      </Route>

      {/* TL + SeniorDeveloper Routes — uses workspace module */}
      <Route element={<RoleRoute allowedRoles={["SeniorDeveloper", "Tl"]} />}>
        <Route path="/workspace" element={<WorkspaceDashboardPage />} />
        <Route path="/workspace/monitor" element={<WorkspaceMonitorPage />} />
        <Route
          path="/workspace/projects/:projectId"
          element={<WorkspaceProjectPage />}
        />
        <Route
          path="/workspace/projects/:projectId/users/:userId"
          element={<WorkspaceUserFeedbackPage />}
        />
        <Route
          path="/workspace/projects/:projectId/create-feedback"
          element={<CreateFeedbackPage />}
        />
        <Route
          path="/workspace/projects/:projectId/users/:userId/create-feedback"
          element={<CreateFeedbackPage />}
        />
      </Route>

      {/* Junior Developer Routes — separate dedicated flow */}
      <Route element={<RoleRoute allowedRoles={["JuniorDeveloper"]} />}>
        <Route path="/junior" element={<JuniorDashboardPage />} />
        <Route
          path="/junior/projects/:projectId"
          element={<JuniorProjectPage />}
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;
