import { useEffect, useState } from "react";
import { Bell, LogOut, Menu, X, FolderKanban, Inbox, Send, UsersRound } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

// Stores & API
import { useAuthStore } from "../../store/useAuthStore";
import { useUIStore } from "../../store/useUIStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { logoutUser } from "../../api/authApi";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../api/notificationApi";

import { useSignalR } from "../../hooks/useSignalR";
import { usePmLayout } from "../../contexts/PmLayoutContext";

// ROLE NAVIGATION CONFIGURATION
interface NavConfig {
  showWorkspace: boolean;
  workspaceRoute: string;
  showTeamFeedbacks: boolean;
  teamFeedbacksRoute: string;
  showReceived: boolean;
  showSubmitted: boolean;
}

const getNavConfig = (role?: string): NavConfig => {
  const safeRole = role ?? "";

  switch (safeRole) {
    case "Admin":
      return {
        showWorkspace: true,
        workspaceRoute: "/admin/users/create",
        showTeamFeedbacks: false,
        teamFeedbacksRoute: "",
        showReceived: false,
        showSubmitted: false,
      };

    case "Pm":
      // PM uses the sidebar for all navigation — no header nav links needed
      return {
        showWorkspace: false,
        workspaceRoute: "",
        showTeamFeedbacks: false,
        teamFeedbacksRoute: "",
        showReceived: false,
        showSubmitted: false,
      };

    case "Tl":
      return {
        showWorkspace: true,
        workspaceRoute: "/tl",
        showTeamFeedbacks: true,
        teamFeedbacksRoute: "/tl/monitor",
        showReceived: true,
        showSubmitted: true,
      };

    case "SeniorDeveloper":
      return {
        showWorkspace: true,
        workspaceRoute: "/senior",
        showTeamFeedbacks: true,
        teamFeedbacksRoute: "/senior/monitor",
        showReceived: true,
        showSubmitted: true,
      };

    case "JuniorDeveloper":
      return {
        showWorkspace: true,
        workspaceRoute: "/junior",
        showTeamFeedbacks: false,
        teamFeedbacksRoute: "",
        showReceived: true,
        showSubmitted: false,
      };

    default:
      return {
        showWorkspace: false,
        workspaceRoute: "",
        showTeamFeedbacks: false,
        teamFeedbacksRoute: "",
        showReceived: true,
        showSubmitted: true,
      };
  }
};

// HEADER COMPONENT
interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  isLayoutHeader?: boolean;
}

const Header = ({ title, subtitle, onMenuClick, isLayoutHeader }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ── ALL HOOKS MUST BE CALLED FIRST (Rules of Hooks) ──
  const pmLayout = usePmLayout();
  const { user, logout } = useAuthStore();
  const { showToast } = useUIStore();
  const {
    unreadCount,
    notifications,
    setNotifications,
    setUnreadCount,
    clearNotifications,
    removeNotification,
  } = useNotificationStore();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use explicit prop first, fall back to sidebar context toggle ONLY if in PM layout
  const menuClickHandler = onMenuClick ?? (pmLayout.isPmLayout ? pmLayout.toggle : undefined);

  // Fetch specific navigation mapping using current user's role
  const navConfig = getNavConfig(user?.role);

  useSignalR();

  useEffect(() => {
    if (pmLayout.isPmLayout && !isLayoutHeader) {
      pmLayout.setTitle(title, subtitle);
    }
  }, [title, subtitle, pmLayout.isPmLayout, isLayoutHeader, pmLayout.setTitle]);

  const loadNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Early return AFTER all hooks ──
  if (pmLayout.isPmLayout && !isLayoutHeader) {
    return null; // Avoid duplicate headers in PM Layout
  }


  const handleNotificationClick = async (
    notificationId: number,
    feedbackId?: number | null,
    isRead?: boolean
  ) => {
    try {
      if (!isRead) {
        await markNotificationAsRead(notificationId);
        removeNotification(notificationId);
      }

      setIsNotificationOpen(false);

      if (feedbackId) {
        navigate(`/feedbacks/${feedbackId}`);
      }
    } catch (error) {
      console.error("Error handling notification click", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      clearNotifications();
      showToast("All notifications marked as read", "success");
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      showToast("Logged out successfully", "info");
      navigate("/login");
    } catch {
      logout();
      navigate("/login");
    }
  };

  // Highlight "Project Workspace" nav link for any project/dashboard sub-route
  const isWorkspaceActive =
    navConfig.workspaceRoute !== "" &&
    location.pathname.startsWith(navConfig.workspaceRoute) &&
    !location.pathname.includes("/monitor");

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Close notification panel when clicking outside
  useEffect(() => {
    if (!isNotificationOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const panel = document.getElementById("notif-panel-wrapper");
      if (panel && !panel.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
      isActive
        ? "bg-slate-900 text-white"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
      isActive
        ? "bg-slate-900 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 px-6 h-16 flex items-center justify-between gap-4">
      {/* ── Left: Sidebar Toggle (PM) or Mobile Menu + Title ── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Sidebar toggle — shows for PM layout (via context) or when onMenuClick is passed explicitly */}
        {menuClickHandler && (
          <button
            onClick={menuClickHandler}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Mobile hamburger for non-PM roles (when no sidebar context) */}
        {!menuClickHandler && (
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        )}

        <div className="min-w-0 flex-1 max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px]">
          <h1 className="text-[15px] font-semibold text-slate-900 leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p 
              className="text-[12px] text-slate-400 font-medium mt-0.5 truncate hidden sm:block"
              title={subtitle}
            >
              {subtitle.length > 65 ? `${subtitle.substring(0, 65)}...` : subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ── Center: Desktop Nav Links ── */}
      <nav className="hidden lg:flex items-center gap-1">
        {navConfig.showWorkspace && (
          <NavLink
            to={navConfig.workspaceRoute}
            className={() => navLinkClass({ isActive: isWorkspaceActive })}
          >
            <FolderKanban size={15} />
            <span>Project Monitoring</span>
          </NavLink>
        )}

        {navConfig.showTeamFeedbacks && (
          <NavLink to={navConfig.teamFeedbacksRoute} className={navLinkClass}>
            <UsersRound size={15} />
            <span>Team Feedbacks</span>
          </NavLink>
        )}

        {navConfig.showReceived && (
          <NavLink to="/feedbacks/received" className={navLinkClass}>
            <Inbox size={15} />
            <span>Received Feedbacks</span>
          </NavLink>
        )}

        {navConfig.showSubmitted && (
          <NavLink to="/feedbacks/submitted" className={navLinkClass}>
            <Send size={15} />
            <span>Submitted Feedbacks</span>
          </NavLink>
        )}
      </nav>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div className="relative" id="notif-panel-wrapper">
          <button
            onClick={() => setIsNotificationOpen((prev) => !prev)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-semibold flex items-center justify-center px-1 border-2 border-white leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-95 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-sm:w-[calc(100vw-32px)] max-sm:right-0">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">
                    Notifications
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                  </p>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[12px] cursor-pointer font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-[13px] text-slate-400 font-medium">
                    No notifications
                  </p>
                </div>
              ) : (
                <div className="max-h-90 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() =>
                        handleNotificationClick(
                          notification.id,
                          notification.feedbackId,
                          notification.isRead
                        )
                      }
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-slate-50 ${
                        !notification.isRead ? "bg-blue-50/40" : "bg-white"
                      }`}
                    >
                      <span
                        className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                          !notification.isRead ? "bg-blue-500" : "bg-transparent"
                        }`}
                      />
                      <div className="min-w-0 flex-1 cursor-pointer">
                        <p
                          className={`text-[13px] leading-snug ${
                            !notification.isRead
                              ? "font-semibold text-slate-900"
                              : "font-medium text-slate-600"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" aria-hidden="true" />

        {/* User Chip */}
        <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-lg border border-slate-200 cursor-default">
          <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center text-[12px] font-semibold shrink-0">
            {user?.name?.charAt(0) ?? "U"}
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-[13px] font-medium text-slate-900">
              {user?.name ?? "User"}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
              {user?.role ?? "Member"}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all duration-150"
          aria-label="Logout"
        >
          <LogOut size={17} />
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col lg:hidden animate-in slide-in-from-left duration-250">
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center text-[12px] font-semibold">
                  {user?.name?.charAt(0) ?? "U"}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[13px] font-semibold text-slate-900">
                    {user?.name ?? "User"}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    {user?.role ?? "Member"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Nav Links applying identical variables */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
              {navConfig.showWorkspace && (
                <NavLink
                  to={navConfig.workspaceRoute}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={() =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                      isWorkspaceActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <FolderKanban size={17} />
                  Project Monitoring
                </NavLink>
              )}

              {navConfig.showTeamFeedbacks && (
                <NavLink
                  to={navConfig.teamFeedbacksRoute}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <UsersRound size={15} />
                  <span>Team Feedbacks</span>
                </NavLink>
              )}

              {navConfig.showReceived && (
                <NavLink
                  to="/feedbacks/received"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <Inbox size={17} />
                  Received Feedbacks
                </NavLink>
              )}

              {navConfig.showSubmitted && (
                <NavLink
                  to="/feedbacks/submitted"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <Send size={17} />
                  Submitted Feedbacks
                </NavLink>
              )}
            </nav>

            <div className="px-3 py-4 border-t border-slate-100 shrink-0">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;