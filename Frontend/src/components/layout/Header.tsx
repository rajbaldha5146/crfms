import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useUIStore } from "../../store/useUIStore";
import { logoutUser } from "../../api/authApi";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

const Header = ({ title, subtitle, onMenuClick }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { showToast } = useUIStore();

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      showToast("Logged out successfully", "info");
      navigate("/login");
    } catch (err) {
      // Even if API fails, we should clear local state and redirect
      logout();
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm font-medium text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="hidden md:flex items-center bg-slate-100 border border-transparent focus-within:border-slate-300 rounded-xl px-3 py-2 transition-all duration-200 group w-64">
          <Search size={18} className="text-slate-400 group-focus-within:text-slate-600" />
          <input
            type="text"
            placeholder="Search projects..."
            className="bg-transparent outline-none px-2 text-[15px] text-slate-700 placeholder:text-slate-400 w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 border-r border-slate-200 pr-5">
          <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors group">
            <Bell size={20} className="group-hover:scale-110 transition-transform" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white"></span>
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 group cursor-default">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[15px] font-bold text-slate-800 leading-none">
              {user?.name || "User"}
            </span>
            <span className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
              {user?.role || "Member"}
            </span>
          </div>

          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm overflow-hidden transition-transform group-hover:scale-105">
            {user?.name?.charAt(0) || "U"}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all duration-200"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
