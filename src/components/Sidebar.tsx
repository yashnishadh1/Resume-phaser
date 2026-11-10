import { Link, useLocation, useNavigate } from "react-router-dom";
import { notify } from "@/lib/notifications";
import apiClient from "@/api/client";
import { 
  LayoutDashboard, 
  Users, 
  UploadCloud, 
  Target, 
  BarChart3, 
  Settings,
  LogOut,
  X
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Candidates", path: "/dashboard/candidates", icon: Users },
  { label: "Resume Upload", path: "/dashboard/upload", icon: UploadCloud },
  { label: "JD Matcher", path: "/dashboard/jd-matcher", icon: Target },
  { label: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", path: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen = false, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    let revoked = !refreshToken;
    if (refreshToken) {
      try {
        await apiClient.post("/auth/logout", { refresh_token: refreshToken });
        revoked = true;
      } catch {
        revoked = false;
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userFirstName");
    localStorage.removeItem("userLastName");
    window.dispatchEvent(new Event("profileUpdated"));
    notify(revoked ? "You have been logged out." : "Signed out on this device. The server session could not be revoked; try again when online.", revoked ? "success" : "error");
    navigate("/login", { replace: true });
  };

  return (
    <aside aria-label="Application sidebar" className={`fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col border-r border-slate-700 bg-slate-900 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#2563EB]">
            <span className="text-lg font-bold leading-none tracking-tighter text-white">H</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-100">HireLens</span>
        </div>
        {setIsOpen && (
          <button type="button" aria-label="Close navigation" onClick={() => setIsOpen(false)} className="min-h-11 min-w-11 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors md:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen?.(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-[#4F46E5]' : ''} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <button type="button" onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-300 hover:bg-slate-800 hover:text-slate-100">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
