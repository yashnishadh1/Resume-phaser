import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { notify } from "@/lib/notifications";

export default function DashboardLayout() {
  const token = localStorage.getItem("token");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onSessionExpired = () => {
      notify("Session expired. Please log in again.", "error");
      navigate("/login", { replace: true });
    };
    const onAccessDenied = () => navigate("/403", { replace: true });
    window.addEventListener("hirelens:session-expired", onSessionExpired);
    window.addEventListener("hirelens:access-denied", onAccessDenied);
    return () => {
      window.removeEventListener("hirelens:session-expired", onSessionExpired);
      window.removeEventListener("hirelens:access-denied", onAccessDenied);
    };
  }, [navigate]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex">
      {/* Premium subtle background glow for light mode */}
      <div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-0 h-full w-full overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#4F46E5]/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#2563EB]/5 blur-[120px]" />
      </div>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 border-0 bg-slate-950/70 md:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 w-full md:ml-64 flex flex-col relative z-10 min-w-0">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="min-h-[calc(100dvh-4rem)] min-w-0 flex-1 overflow-x-hidden p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
