import { Search, Bell, Menu } from "lucide-react";
import { useState, useEffect } from "react";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [firstName, setFirstName] = useState(() => localStorage.getItem('userFirstName') || "Jane");
  const [lastName, setLastName] = useState(() => localStorage.getItem('userLastName') || "Doe");

  useEffect(() => {
    const handleProfileUpdate = () => {
      setFirstName(localStorage.getItem('userFirstName') || "Jane");
      setLastName(localStorage.getItem('userLastName') || "Doe");
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  return (
    <header className="h-16 glass-panel sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 border-b border-zinc-200">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center bg-zinc-100 border border-transparent rounded-full px-4 py-1.5 w-full max-w-[200px] md:w-96 focus-within:bg-white focus-within:border-zinc-300 focus-within:shadow-sm transition-all">
          <Search className="text-zinc-500 w-4 h-4 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Search candidates..." 
            className="bg-transparent border-none outline-none text-sm text-zinc-900 placeholder:text-zinc-500 w-full min-w-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#10b981] rounded-full shadow-[0_0_4px_#10b981]"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-zinc-200 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#10b981] to-[#3b82f6] flex items-center justify-center text-white font-semibold text-sm shadow-sm border border-zinc-100 uppercase">
            {firstName.charAt(0)}{lastName.charAt(0)}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-zinc-900 group-hover:text-[#10b981] transition-colors">{firstName} {lastName}</p>
            <p className="text-xs text-zinc-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
