import { Outlet, Link } from "react-router-dom";
import PublicFooter from "@/components/PublicFooter";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0B1020] text-slate-100">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute left-[-10%] top-[-20%] size-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[-20%] right-[-10%] size-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl sm:p-8">
        <div className="mb-8 flex flex-col items-center">
          <Link to="/" aria-label="HireLens home" className="mb-4 flex size-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300">
            <svg aria-hidden="true" className="size-7" viewBox="0 0 32 32" fill="none"><circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="3"/><path d="m21 21 7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><circle cx="14" cy="14" r="3" fill="currentColor"/></svg>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">HireLens</h1>
          <p className="mt-1 text-center text-xs text-slate-400">See Your Potential. Land Your Next Opportunity.</p>
        </div>
        <Outlet />
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
