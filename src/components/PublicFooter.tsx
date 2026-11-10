import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-800 bg-[#0B1020] px-5 py-8 text-slate-300 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/" className="text-lg font-bold tracking-tight text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400">HireLens</Link>
          <p className="mt-1 text-sm text-slate-400">See Your Potential. Land Your Next Opportunity.</p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
          <Link className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400" to="/">Home</Link>
          <Link className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400" to="/dashboard">Dashboard</Link>
          <Link className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400" to="/privacy-policy">Privacy Policy</Link>
          <Link className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400" to="/terms-and-conditions">Terms &amp; Conditions</Link>
          <Link className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400" to="/contact">Contact</Link>
        </nav>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} HireLens. All rights reserved.</p>
      </div>
    </footer>
  );
}
