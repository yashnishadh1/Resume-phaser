import { Link } from "react-router-dom";
import { usePageMetadata } from "@/lib/seo";

export default function ForgotPassword() {
  usePageMetadata({ title: "Account Recovery | HireLens", description: "Information about recovering access to your HireLens account.", path: "/forgot-password", noIndex: true });
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white">Account recovery</h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">Self-service password reset is not configured for this deployment. Contact your workspace administrator to recover access.</p>
      <Link to="/contact" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-500">Contact support</Link>
      <p className="mt-5 text-sm text-slate-400"><Link to="/login" className="text-indigo-300 hover:text-indigo-200">Return to login</Link></p>
    </div>
  );
}
