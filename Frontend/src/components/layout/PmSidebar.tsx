import {
  FolderKanban,
  Inbox,
  Send,
  UsersRound,
  GitBranchPlus,
  LayoutDashboard,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const PmSidebar = () => {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
      isActive
        ? "bg-slate-900 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <aside className="w-60 h-full bg-white border-r border-slate-200 flex flex-col shrink-0">

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">

        <div className="mb-2">
          <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Dashboard
          </p>

          <NavLink to="/pm-projects" className={navClass}>
            <FolderKanban size={16} />
            Project Monitoring
          </NavLink>

          <NavLink to="/pm-monitor" className={navClass}>
            <UsersRound size={16} />
            Team Feedbacks
          </NavLink>

          <NavLink to="/feedbacks/received" className={navClass}>
            <Inbox size={16} />
            Received Feedbacks
          </NavLink>

          <NavLink to="/feedbacks/submitted" className={navClass}>
            <Send size={16} />
            Submitted Feedbacks
          </NavLink>
        </div>

        {/* Management section */}
        <div className="pt-4 mt-3 border-t border-slate-100">
          <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Management
          </p>

          <NavLink to="/pm-hierarchy" className={navClass}>
            <GitBranchPlus size={16} />
            Hierarchy
          </NavLink>

          <NavLink to="/pm-project-management" className={navClass}>
            <LayoutDashboard size={16} />
            Project Management
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};

export default PmSidebar;