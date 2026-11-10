import { Link } from "react-router-dom";
import { ArrowRight, FileSearch, ScanSearch, Target } from "lucide-react";
import PublicFooter from "@/components/PublicFooter";
import { usePageMetadata } from "@/lib/seo";

const description = "Analyze resumes, evaluate ATS compatibility, identify skill gaps, and match job opportunities with HireLens AI.";

export default function Landing() {
  usePageMetadata({ title: "HireLens — AI Resume Analyzer & Job Matching", description, path: "/" });
  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="text-xl font-bold tracking-tight text-white">HireLens</Link>
        <nav aria-label="Main navigation" className="flex items-center gap-3">
          <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white">Log in</Link>
          <Link to="/signup" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Get started</Link>
        </nav>
      </header>
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.15fr_.85fr] lg:pb-28 lg:pt-24">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-sm font-medium text-indigo-200">AI-powered career intelligence</p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">See Your Potential.<br /><span className="text-indigo-300">Land Your Next Opportunity.</span></h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Turn resumes and job descriptions into clear, useful insights. Review extracted experience, compare skills, and make better informed matches.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-500">Create your account <ArrowRight size={18} aria-hidden="true" /></Link>
              <Link to="/login" className="inline-flex min-h-11 items-center rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-100 hover:bg-slate-900">Sign in</Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: FileSearch, title: "Resume analysis", copy: "Extract candidate details from PDF and DOCX resumes." },
              { icon: ScanSearch, title: "ATS insights", copy: "Review parsed skills and match scores with context." },
              { icon: Target, title: "Job matching", copy: "Compare job descriptions with candidate experience." },
            ].map(({ icon: Icon, title, copy }) => (
              <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl sm:last:col-span-2">
                <Icon className="size-6 text-indigo-300" aria-hidden="true" />
                <h2 className="mt-4 font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
