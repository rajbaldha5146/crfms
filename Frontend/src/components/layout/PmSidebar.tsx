import {
  FolderKanban,
  Inbox,
  Send,
  UsersRound,
  LogOut,
  UserPlus,
  GitBranchPlus,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/useAuthStore";

import { logoutUser } from "../../api/authApi";

const PmSidebar = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logoutUser();

      logout();

      navigate("/login");
    } catch {
      logout();

      navigate("/login");
    }
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `
        flex
        items-center
        gap-3
        px-4
        py-3
        rounded-xl
        text-sm
        font-medium
        transition-all
  
        ${
          isActive
            ? `
            bg-slate-900
            text-white
          `
            : `
            text-slate-600
            hover:bg-slate-100
            hover:text-slate-900
          `
        }
      `;

  return (
    <aside
      className="
        w-72
        h-screen
        bg-white
        border-r
        border-slate-200
        flex
        flex-col
        shrink-0
      "
    >
      {/* Top */}

      <div
        className="
          h-16
          px-6
          border-b
          border-slate-100
          flex
          items-center
        "
      >
        <div>
          <h1
            className="
              text-lg
              font-bold
              text-slate-900
            "
          >
            Feedback System
          </h1>

          <p
            className="
              text-xs
              text-slate-400
              font-medium
              mt-0.5
            "
          >
            Enterprise Workspace
          </p>
        </div>
      </div>

      {/* User */}

      <div
        className="
          px-4
          py-5
          border-b
          border-slate-100
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              w-11
              h-11
              rounded-xl
              bg-slate-900
              text-white
              flex
              items-center
              justify-center
              text-sm
              font-bold
            "
          >
            {user?.name?.charAt(0)}
          </div>

          <div>
            <p
              className="
                text-sm
                font-semibold
                text-slate-900
              "
            >
              {user?.name}
            </p>

            <p
              className="
                text-xs
                text-slate-400
                font-medium
              "
            >
              {user?.role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}

      <nav
        className="
          flex-1
          overflow-y-auto
          p-4
          space-y-1
        "
      >
        <NavLink to="/pm-projects" className={navClass}>
          <FolderKanban size={18} />
          Project Workspace
        </NavLink>

        <NavLink to="/pm-monitor" className={navClass}>
          <UsersRound size={18} />
          Team Feedbacks
        </NavLink>

        <NavLink to="/feedbacks/received" className={navClass}>
          <Inbox size={18} />
          Received Feedbacks
        </NavLink>

        <NavLink to="/feedbacks/submitted" className={navClass}>
          <Send size={18} />
          Submitted Feedbacks
        </NavLink>

        {/* Future */}

        <div
          className="
            pt-5
            mt-5
            border-t
            border-slate-100
          "
        >
          <p
            className="
              px-4
              mb-2
              text-[11px]
              font-bold
              uppercase
              tracking-wider
              text-slate-400
            "
          >
            Management
          </p>

          <NavLink to="/pm-hierarchy" className={navClass}>
            <GitBranchPlus size={18} />
            Hierarchy
          </NavLink>

          <NavLink to="/pm-users" className={navClass}>
            <UserPlus size={18} />
            Team Members
          </NavLink>

          <NavLink to="/pm-project-management" className={navClass}>
            <FolderKanban size={18} />
            Team Members
          </NavLink>
        </div>
      </nav>

      {/* Footer */}

      <div
        className="
          p-4
          border-t
          border-slate-100
        "
      >
        <button
          onClick={handleLogout}
          className="
              w-full
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-xl
              text-sm
              font-medium
              text-rose-600
              hover:bg-rose-50
              transition-all
            "
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default PmSidebar;