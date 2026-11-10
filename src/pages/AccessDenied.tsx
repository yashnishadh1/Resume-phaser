import { Link } from "react-router-dom";
import { usePageMetadata } from "@/lib/seo";

export default function AccessDenied() {
  usePageMetadata({ title: "Access Denied | HireLens", description: "You do not have permission to view this HireLens page.", path: "/403", noIndex: true });
  return <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center bg-[#0B1020] px-5 text-center text-slate-100"><p className="text-sm font-semibold text-indigo-300">403 · Access denied</p><h1 className="mt-3 text-3xl font-bold text-white">You don’t have access to this page</h1><p className="mt-3 text-slate-400">Your account may not have the required permissions.</p><Link to="/dashboard" className="mt-7 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-500">Return to dashboard</Link></main>;
}
