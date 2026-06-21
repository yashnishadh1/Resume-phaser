import { Link, useLocation, useNavigate } from "react-router-dom";
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

  return (
    <aside className={`w-64 h-screen border-r border-zinc-200 bg-white flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#10b981] to-[#3b82f6] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none tracking-tighter">R</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-zinc-900">Resume<span className="text-[#10b981]">.ai</span></span>
        </div>
        {setIsOpen && (
          <button onClick={() => setIsOpen(false)} className="md:hidden text-zinc-500 hover:text-zinc-900 transition-colors">
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? 'bg-zinc-50 text-zinc-900 shadow-sm border border-zinc-200' 
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-[#10b981]' : ''} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-zinc-100">
        <button onClick={() => navigate('/login')} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all duration-300">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
