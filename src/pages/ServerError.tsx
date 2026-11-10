import { Link } from "react-router-dom";
import { usePageMetadata } from "@/lib/seo";

export default function ServerError() {
  usePageMetadata({ title: "Service Error | HireLens", description: "HireLens could not complete this request. Try again in a moment.", path: "/500", noIndex: true });
  return <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center bg-[#0B1020] px-5 text-center text-slate-100"><p className="text-sm font-semibold text-indigo-300">500 · Service error</p><h1 className="mt-3 text-3xl font-bold text-white">Something went wrong</h1><p className="mt-3 text-slate-400">We couldn’t complete that request. Please try again shortly.</p><Link to="/" className="mt-7 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-500">Back to Home</Link></main>;
}
