import { Search, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/api/client";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(() => localStorage.getItem('userFirstName') || "Account");
  const [lastName, setLastName] = useState(() => localStorage.getItem('userLastName') || "");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get("/auth/me");
        if (response.data?.full_name) {
          const fn = response.data.full_name;
          const first = fn.split(' ')[0];
          const last = fn.split(' ').slice(1).join(' ') || " ";
          
          localStorage.setItem("userFirstName", first);
          localStorage.setItem("userLastName", last);
          setFirstName(first);
          setLastName(last.trim());
        }
      } catch {
        // The API client reports network and authorization errors through the global notification system.
      }
    };
    
    if (localStorage.getItem('token')) {
      fetchUser();
    }

    const handleProfileUpdate = () => {
      setFirstName(localStorage.getItem('userFirstName') || "Account");
      setLastName(localStorage.getItem('userLastName') || "");
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const search = searchTerm.trim();
    navigate(search ? `/dashboard/candidates?search=${encodeURIComponent(search)}` : "/dashboard/candidates");
  };

  return (
    <header className="h-16 glass-panel sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 border-b border-slate-700">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button 
          type="button"
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="min-h-11 min-w-11 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 md:hidden"
        >
          <Menu size={20} />
        </button>
        <form role="search" onSubmit={handleSearch} className="flex w-full max-w-[200px] items-center rounded-full border border-transparent bg-slate-800 px-4 py-1.5 transition-all focus-within:border-slate-600 focus-within:bg-slate-900 focus-within:shadow-sm md:w-96">
          <Search className="text-slate-400 w-4 h-4 mr-2 shrink-0" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search candidates"
            placeholder="Search candidates..." 
            className="bg-transparent border-none outline-none text-sm text-slate-100 placeholder:text-slate-400 w-full min-w-0"
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        <button type="button" onClick={() => navigate("/dashboard/settings")} aria-label={`Open profile settings for ${firstName} ${lastName}`} className="group flex min-h-11 items-center gap-3 border-l border-slate-700 pl-4 text-left">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#2563EB] flex items-center justify-center text-white font-semibold text-sm shadow-sm border border-slate-800 uppercase">
            {firstName.charAt(0)}{lastName.charAt(0)}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-100 group-hover:text-[#4F46E5] transition-colors">{firstName} {lastName}</p>
            <p className="text-xs text-slate-400">Account settings</p>
          </div>
        </button>
      </div>
    </header>
  );
}
