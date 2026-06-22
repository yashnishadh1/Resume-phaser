import { useState } from "react";
import { Target, Search, Zap, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/api/client";
import { useMutation } from "@tanstack/react-query";

export default function JDMatcher() {
  const [jdText, setJdText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{name: string, score: number, matching_skills: string[], missing_skills: string[]}[]>([]);

  const analyzeMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiClient.post('/jd/match', { description: text });
      return response.data;
    },
    onSuccess: (data) => {
      setResults(data);
      setShowResults(true);
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      alert(error.response?.data?.detail || "Failed to analyze Job Description. Please try again.");
    }
  });

  const handleAnalyze = () => {
    if (jdText) {
      analyzeMutation.mutate(jdText);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      {/* Left Pane: JD Input */}
      <div className="w-full lg:w-1/2 flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-900 mb-2">JD Matcher</h1>
          <p className="text-zinc-500">Paste a Job Description to find the best matching candidates.</p>
        </div>

        <Card className="flex-1 bg-white border-zinc-200 flex flex-col">
          <CardHeader>
            <CardTitle className="text-zinc-900 flex items-center gap-2">
              <FileTextIcon className="w-5 h-5 text-[#10b981]" />
              Job Description
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here..."
              className="flex-1 w-full bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-stitch-primary resize-none placeholder:text-zinc-500"
            />
            <Button 
              onClick={handleAnalyze} 
              disabled={!jdText || analyzeMutation.isPending}
              className="w-full bg-[#10b981] hover:bg-white text-stitch-surface-dim font-medium py-6"
            >
              {analyzeMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-stitch-surface-dim border-t-transparent animate-spin" />
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
          {showResults && (
            <h2 className="text-xl font-display font-bold text-zinc-900 flex items-center gap-2">
              <Zap className="text-yellow-400 w-5 h-5" />
              Top Matches Found
            </h2>
          )}
        </div>

        {!showResults ? (
          <Card className="flex-1 bg-zinc-50 border-zinc-200 border-dashed flex items-center justify-center text-center p-8">
            <div className="max-w-xs">
              <div className="w-16 h-16 bg-zinc-50-bright rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">No Results Yet</h3>
              <p className="text-sm text-zinc-500">
                Paste a job description and click "Find Matches" to see the most qualified candidates.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {results.map((result, i) => (
              <Card key={i} className="bg-white border-zinc-200 hover:border-stitch-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-stitch-primary to-blue-500 flex items-center justify-center font-bold text-stitch-surface shadow-lg text-lg">
                        {result.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900 text-lg">{result.name}</h3>
                        <p className="text-sm text-zinc-500">Candidate</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-display font-bold text-[#10b981]">{result.score}%</div>
                      <p className="text-xs text-zinc-500">Match Score</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#10b981]" /> Matched Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.matching_skills?.map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="bg-[#10b981]/10 text-[#10b981] border-transparent hover:bg-[#10b981]/20">
                            {skill}
                          </Badge>
                        ))}
                        {!result.matching_skills?.length && <span className="text-sm text-zinc-500">None detected</span>}
                      </div>
                    </div>
                    {result.missing_skills?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-zinc-500 mb-2 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-400" /> Missing Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.missing_skills.map((skill: string) => (
                            <Badge key={skill} variant="outline" className="border-zinc-200 text-zinc-500">
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
              <div className="text-center py-12 text-zinc-500">No candidates found in database.</div>
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
