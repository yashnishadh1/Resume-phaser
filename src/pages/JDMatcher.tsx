import { useState } from "react";
import { Target, Search, Zap, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/api/client";
import { useMutation } from "@tanstack/react-query";
import { usePageMetadata } from "@/lib/seo";
import { isAxiosError } from "axios";
import { useToast } from "@/components/ToastProvider";

export default function JDMatcher() {
  usePageMetadata({ title: "Job matching | HireLens", description: "Compare job descriptions against candidates in your private HireLens workspace.", path: "/dashboard/jd-matcher", noIndex: true });
  const [jdText, setJdText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{candidate_id: number, name: string, score: number, matching_skills: string[], missing_skills: string[], recommendations: string[]}[]>([]);
  const toast = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiClient.post('/jd/match', { description: text });
      return response.data;
    },
    onSuccess: (data) => {
      setResults(data);
      setShowResults(true);
      toast("Job matching analysis completed.", "success");
    },
    onError: (error: unknown) => {
      const detail = isAxiosError(error) ? (error.response?.data as { detail?: unknown } | undefined)?.detail : undefined;
      toast(typeof detail === "string" ? detail : isAxiosError(error) && !error.response ? "Unable to connect to the server. Check your connection and try again." : "Failed to analyze the job description. Please try again.", "error");
    }
  });

  const handleAnalyze = () => {
    const description = jdText.trim();
    if (!description) {
      toast("Enter a job description before searching.", "error");
      return;
    }
    analyzeMutation.mutate(description);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      {/* Left Pane: JD Input */}
      <div className="w-full lg:w-1/2 flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-100 mb-2">JD Matcher</h1>
          <p className="text-slate-400">Paste a Job Description to find the best matching candidates.</p>
        </div>

        <Card className="flex-1 bg-slate-900 border-slate-700 flex flex-col">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <FileTextIcon className="w-5 h-5 text-[#4F46E5]" />
              Job Description
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <label htmlFor="job-description" className="sr-only">Job description</label>
            <textarea
              id="job-description"
              required
              maxLength={20000}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here..."
              className="min-h-48 w-full flex-1 resize-y rounded-lg border border-slate-700 bg-slate-800 p-4 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <Button 
              onClick={handleAnalyze} 
              disabled={!jdText.trim() || analyzeMutation.isPending}
              className="min-h-12 w-full bg-indigo-600 py-6 font-medium text-white hover:bg-indigo-500"
            >
              {analyzeMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Analyzing Database...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Find Matches
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Pane: Results */}
      <div className="w-full lg:w-1/2 flex flex-col space-y-4">
        <div className="h-[72px] flex items-end pb-2">
          {showResults && !analyzeMutation.isPending && (
            <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
              <Zap className="text-yellow-400 w-5 h-5" />
              Top Matches Found
            </h2>
          )}
        </div>

        {analyzeMutation.isPending ? (
          <Card className="flex-1 border-slate-700 bg-slate-800 p-8 text-center" role="status"><CardContent className="flex h-full min-h-48 flex-col items-center justify-center gap-3 text-slate-300"><span aria-hidden="true" className="size-8 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent"/>Analyzing candidate matches…</CardContent></Card>
        ) : !showResults ? (
          <Card className="flex-1 bg-slate-800 border-slate-700 border-dashed flex items-center justify-center text-center p-8">
            <div className="max-w-xs">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">No Results Yet</h3>
              <p className="text-sm text-slate-400">
                Paste a job description and click "Find Matches" to see the most qualified candidates.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {results.map((result) => (
              <Card key={result.candidate_id} className="bg-slate-900 border-slate-700 hover:border-indigo-400/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-lg font-bold text-white shadow-lg">
                        {result.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-lg">{result.name}</h3>
                        <p className="text-sm text-slate-400">Candidate</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-display font-bold text-[#4F46E5]">{result.score}%</div>
                      <p className="text-xs text-slate-400">Match Score</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#4F46E5]" /> Matched Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.matching_skills?.map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="bg-[#4F46E5]/10 text-[#4F46E5] border-transparent hover:bg-[#4F46E5]/20">
                            {skill}
                          </Badge>
                        ))}
                        {!result.matching_skills?.length && <span className="text-sm text-slate-400">None detected</span>}
                      </div>
                    </div>
                    {result.missing_skills?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-400" /> Missing Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.missing_skills.map((skill: string) => (
                            <Badge key={skill} variant="outline" className="border-slate-700 text-slate-400">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {results.length === 0 && (
              <div className="text-center py-12 text-slate-400">No candidates found in database.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  )
}
