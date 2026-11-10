import { useNavigate } from "react-router-dom";
import { AlertCircle, FileText, Target, UploadCloud, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCandidates } from "@/api/useCandidates";
import { usePageMetadata } from "@/lib/seo";

export default function Dashboard() {
  usePageMetadata({ title: "Dashboard | HireLens", description: "Review candidate activity and resume analysis in your HireLens workspace.", path: "/dashboard", noIndex: true });
  const navigate = useNavigate();
  const { data: candidates, isLoading, isError, refetch, isFetching } = useCandidates();
  const firstName = localStorage.getItem("userFirstName") || "there";
  const averageScore = candidates?.length
    ? Math.round(candidates.reduce((sum, candidate) => sum + (candidate.match_score || 0), 0) / candidates.length)
    : null;
  const parsedCount = candidates?.filter((candidate) => candidate.skills?.length > 0).length ?? 0;

  const metrics = [
    { title: "Total candidates", value: isLoading ? "—" : candidates?.length ?? 0, detail: "In your workspace", icon: Users },
    { title: "Resumes analyzed", value: isLoading ? "—" : parsedCount, detail: "Candidates with extracted skills", icon: FileText },
    { title: "Average match score", value: isLoading ? "—" : averageScore === null ? "—" : `${averageScore}%`, detail: averageScore === null ? "No scores available yet" : "Across current candidates", icon: Target },
  ];

  return (
    <div className="space-y-8 pb-8">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-100">Welcome, {firstName}</h1>
          <p className="text-slate-400">Your current candidate and resume activity.</p>
        </div>
        <button type="button" onClick={() => navigate("/dashboard/upload")} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-md transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300">
          <UploadCloud className="size-4" aria-hidden="true" /> Upload resumes
        </button>
      </header>

      {isError ? (
        <Card className="border-rose-900 bg-slate-900" role="alert">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3 text-rose-200"><AlertCircle aria-hidden="true" /><p>Could not load dashboard data. Check your connection and try again.</p></div>
            <button type="button" disabled={isFetching} onClick={() => void refetch()} className="min-h-11 rounded-lg border border-slate-700 px-4 text-sm font-semibold text-slate-100 hover:bg-slate-800 disabled:opacity-50">{isFetching ? "Refreshing…" : "Retry"}</button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map(({ title, value, detail, icon: Icon }) => (
            <Card key={title} className="border-slate-800 bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
                <Icon className="size-5 text-indigo-300" aria-hidden="true" />
              </CardHeader>
              <CardContent><div className="text-3xl font-bold text-slate-100">{value}</div><p className="mt-1 text-xs text-slate-500">{detail}</p></CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="min-w-0 border-slate-800 bg-slate-900 xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <CardTitle className="text-lg text-slate-100">Recent candidates</CardTitle>
            <button type="button" onClick={() => navigate("/dashboard/candidates")} className="min-h-10 rounded px-2 text-sm font-medium text-indigo-300 hover:text-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300">View all</button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? <p role="status" className="p-8 text-center text-slate-400">Loading candidates…</p> : isError ? <p className="p-8 text-center text-slate-400">Candidate data is unavailable.</p> : !candidates?.length ? (
              <div className="p-8 text-center"><p className="text-slate-300">No candidates yet.</p><button type="button" onClick={() => navigate("/dashboard/upload")} className="mt-3 min-h-11 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500">Upload your first resume</button></div>
            ) : (
              <ul className="divide-y divide-slate-800">
                {candidates.slice(0, 5).map((candidate) => (
                  <li key={candidate.id}>
                    <button type="button" onClick={() => navigate("/dashboard/candidates")} className="flex min-h-[72px] w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-slate-800/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-indigo-300">
                      <span className="flex min-w-0 items-center gap-3">
                        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 font-bold text-slate-200">{candidate.full_name?.charAt(0) || "?"}</span>
                        <span className="min-w-0"><span className="block truncate font-semibold text-slate-100">{candidate.full_name || "Unnamed candidate"}</span><span className="block truncate text-sm text-slate-400">{candidate.email || "No email"}</span></span>
                      </span>
                      <span className="flex shrink-0 items-center gap-3"><span className="hidden text-right text-sm text-slate-400 sm:block">{candidate.skills?.length ?? 0} skills</span><Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300">{candidate.status || "Added"}</Badge></span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="border-b border-slate-800 pb-4"><CardTitle className="text-lg text-slate-100">Next steps</CardTitle></CardHeader>
          <CardContent className="space-y-3 p-5">
            <button type="button" onClick={() => navigate("/dashboard/upload")} className="flex min-h-16 w-full items-center gap-3 rounded-xl border border-slate-700 p-4 text-left hover:border-indigo-500/60 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"><UploadCloud className="size-5 shrink-0 text-indigo-300" aria-hidden="true"/><span><span className="block font-semibold text-slate-100">Add resumes</span><span className="text-xs text-slate-400">Upload candidate documents</span></span></button>
            <button type="button" onClick={() => navigate("/dashboard/jd-matcher")} className="flex min-h-16 w-full items-center gap-3 rounded-xl border border-slate-700 p-4 text-left hover:border-indigo-500/60 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"><Target className="size-5 shrink-0 text-blue-300" aria-hidden="true"/><span><span className="block font-semibold text-slate-100">Match a job</span><span className="text-xs text-slate-400">Compare a description with candidates</span></span></button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
