import { Link } from "react-router-dom";
import { usePageMetadata } from "@/lib/seo";

export default function Unauthorized() {
  usePageMetadata({ title: "Sign in required | HireLens", description: "Your HireLens session has expired. Log in to continue.", path: "/401", noIndex: true });
  return <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center bg-[#0B1020] px-5 text-center text-slate-100"><p className="text-sm font-semibold text-indigo-300">401 · Sign in required</p><h1 className="mt-3 text-3xl font-bold text-white">Your session has ended</h1><p className="mt-3 text-slate-400">Log in again to continue to your HireLens workspace.</p><Link to="/login" className="mt-7 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-500">Log in</Link></main>;
}
