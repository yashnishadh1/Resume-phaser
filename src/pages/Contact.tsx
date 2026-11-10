import PublicFooter from "@/components/PublicFooter";
import { usePageMetadata } from "@/lib/seo";

export default function Contact() {
  usePageMetadata({ title: "Contact HireLens", description: "Contact the HireLens service operator for support and privacy requests.", path: "/contact" });
  return (
    <div className="flex min-h-screen flex-col bg-[#0B1020] text-slate-200">
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-16 sm:px-8">
        <h1 className="text-3xl font-bold text-white">Contact HireLens</h1>
        <p className="mt-4 leading-7 text-slate-300">For product support or privacy requests, contact the service operator using the business contact details configured for this deployment.</p>
        <p className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">[Support email to be provided by the service operator before public launch]</p>
      </main>
      <PublicFooter />
    </div>
  );
}
