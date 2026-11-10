import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from "recharts";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCandidates } from "@/api/useCandidates";
import { usePageMetadata } from "@/lib/seo";

export default function Analytics() {
  usePageMetadata({ title: "Analytics | HireLens", description: "Review candidate and resume analytics in your private HireLens workspace.", path: "/dashboard/analytics", noIndex: true });
  const { data: candidates, isLoading, isError, refetch, isFetching } = useCandidates();
  const { growth, skills } = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - (5 - index), 1));
    const growthData = months.map((month) => ({ name: month.toLocaleDateString(undefined, { month: "short" }), candidates: 0 }));
    const counts = new Map<string, number>();
    for (const candidate of candidates || []) {
      const createdAt = candidate.created_at ? new Date(candidate.created_at) : null;
      if (createdAt && !Number.isNaN(createdAt.valueOf())) {
        const index = months.findIndex((month, monthIndex) => createdAt >= month && createdAt < (months[monthIndex + 1] || new Date(now.getFullYear(), now.getMonth() + 1, 1)));
        if (index >= 0) growthData[index].candidates += 1;
      }
      for (const skill of candidate.skills || []) {
        if (skill.name) counts.set(skill.name, (counts.get(skill.name) || 0) + 1);
      }
    }
    const skillData = Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
    return { growth: growthData, skills: skillData };
  }, [candidates]);

  return (
    <div className="space-y-6 pb-8">
      <header><h1 className="mb-2 text-3xl font-bold text-slate-100">Analytics</h1><p className="text-slate-400">Explore trends from candidates in your workspace.</p></header>
      {isError ? (
        <Card className="border-rose-900 bg-slate-900" role="alert"><CardContent className="flex flex-wrap items-center justify-between gap-4 p-5"><span className="flex items-center gap-2 text-rose-200"><AlertCircle aria-hidden="true"/>Analytics could not load. Check your connection and retry.</span><button type="button" disabled={isFetching} onClick={() => void refetch()} className="min-h-11 rounded-lg border border-slate-700 px-4 text-sm font-semibold text-slate-100 hover:bg-slate-800 disabled:opacity-50">{isFetching ? "Refreshing…" : "Retry"}</button></CardContent></Card>
      ) : isLoading ? <p role="status" className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">Loading analytics…</p> : !candidates?.length ? <p className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">Analytics will appear after resumes have been analyzed.</p> : (
        <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="min-w-0 border-slate-800 bg-slate-900"><CardHeader><CardTitle className="text-slate-100">Candidates added by month</CardTitle></CardHeader><CardContent><div className="h-[280px] w-full min-w-0"><ResponsiveContainer width="100%" height="100%"><AreaChart data={growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#252a38" vertical={false}/><XAxis dataKey="name" stroke="#94a3b8" fontSize={12}/><YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12}/><Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#fff" }}/><Area type="monotone" dataKey="candidates" name="Candidates" stroke="#818cf8" fill="#4f46e5" fillOpacity={0.2}/></AreaChart></ResponsiveContainer></div></CardContent></Card>
          <Card className="min-w-0 border-slate-800 bg-slate-900"><CardHeader><CardTitle className="text-slate-100">Most common extracted skills</CardTitle></CardHeader><CardContent>{skills.length ? <div className="h-[280px] w-full min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={skills} layout="vertical" margin={{ top: 5, right: 12, left: 4, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#252a38" horizontal={false}/><XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={12}/><YAxis dataKey="name" type="category" width={86} stroke="#cbd5e1" fontSize={12}/><Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#fff" }}/><Bar dataKey="count" name="Candidates" fill="#6366f1" radius={[0, 4, 4, 0]}/></BarChart></ResponsiveContainer></div> : <p className="py-8 text-center text-slate-400">No extracted skill data yet.</p>}</CardContent></Card>
        </div>
      )}
    </div>
  );
}
