import { Users, FileText, CheckCircle, Clock, UploadCloud, Target, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCandidates } from "@/api/useCandidates";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: candidates, isLoading } = useCandidates();

  const firstName = localStorage.getItem('userFirstName') || "User";

  const avgMatchScore = candidates?.length 
    ? Math.round(candidates.reduce((acc: number, curr: any) => acc + (curr.match_score || 0), 0) / candidates.length) 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-900 mb-2 tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-zinc-500">Here's what's happening with your candidates today.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/upload')}
          className="bg-gradient-to-r from-[#10b981] to-[#3b82f6] hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <UploadCloud className="w-4 h-4" />
          Upload Resumes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-panel hover-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Candidates</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="w-4 h-4 text-[#10b981]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900 tracking-tight">{candidates?.length || 0}</div>
            <p className="text-xs text-[#10b981] mt-1 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span> Real-time data
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel hover-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Resumes Parsed</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-4 h-4 text-[#3b82f6]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900 tracking-tight">{candidates?.length || 0}</div>
            <p className="text-xs text-[#10b981] mt-1 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span> Real-time data
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel hover-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Avg. Match Score</CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Target className="w-4 h-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900 tracking-tight">{avgMatchScore}%</div>
            <p className="text-xs text-[#10b981] mt-1 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span> Based on {candidates?.length || 0} candidates
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel hover-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Processing Time</CardTitle>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="w-4 h-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900 tracking-tight">1.2s</div>
            <p className="text-xs text-[#10b981] mt-1 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span> -0.3s improvement
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Candidates */}
        <Card className="lg:col-span-2 glass-panel">
          <CardHeader className="border-b border-zinc-100 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-display text-zinc-900">Recent Candidates</CardTitle>
              <button className="text-sm text-[#10b981] hover:text-[#059669] transition-colors">View All</button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-100">
              {isLoading ? (
                <div className="p-8 text-center text-zinc-500">Loading candidates...</div>
              ) : candidates?.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">No candidates uploaded yet.</div>
              ) : (
                candidates?.slice(0, 5).map((candidate: any, i: number) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer group" onClick={() => navigate('/dashboard/candidates')}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-100 flex items-center justify-center font-bold text-zinc-700 border border-zinc-200 group-hover:border-[#10b981]/50 transition-colors">
                        {candidate.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900 tracking-tight">{candidate.full_name}</p>
                        <p className="text-sm text-zinc-500">{candidate.email || 'No email'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-[#10b981]">{candidate.skills?.length || 0} Skills</p>
                        <p className="text-xs text-zinc-400">Parsed</p>
                      </div>
                      <Badge variant="outline" className="border-zinc-200 bg-white text-zinc-600">
                        Completed
                      </Badge>
                      <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Required */}
        <Card className="glass-panel">
          <CardHeader className="border-b border-zinc-100 pb-4">
            <CardTitle className="text-lg font-display text-zinc-900">Action Required</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex gap-3">
                <CheckCircle className="text-orange-500 w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-orange-600">Review Match Scores</h4>
                  <p className="text-xs text-zinc-500 mt-1">3 candidates have an exceptionally high match score (&gt;95%) for the Senior Developer role.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3">
                <FileText className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-600">New Resumes Uploaded</h4>
                  <p className="text-xs text-zinc-500 mt-1">24 new resumes were parsed successfully. Ready for review.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
