import { Link } from "react-router-dom";
import PublicFooter from "@/components/PublicFooter";
import { usePageMetadata } from "@/lib/seo";

export default function NotFound() {
  const authenticated = Boolean(localStorage.getItem("token"));
  usePageMetadata({ title: "Page Not Found | HireLens", description: "The page you requested could not be found.", path: window.location.pathname, noIndex: true });
  return (
    <div className="flex min-h-screen flex-col bg-[#0B1020] text-slate-100">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">404 error</p>
        <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">This page isn’t here</h1>
        <p className="mt-4 max-w-xl leading-7 text-slate-400">The link may be outdated, or the address may have been entered incorrectly.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-500">Back to Home</Link>
          {authenticated && <Link to="/dashboard" className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-100 hover:bg-slate-900">Go to Dashboard</Link>}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
