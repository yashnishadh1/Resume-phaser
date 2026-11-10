import { useState } from "react";
import { Search, Filter, Download, MoreVertical, Eye, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import { useCandidates, useDeleteCandidate } from "@/api/useCandidates";

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: candidates, isLoading, error } = useCandidates(searchTerm);
  const deleteCandidate = useDeleteCandidate();
  const [selectedCandidate, setSelectedCandidate] = useState<import("@/api/useCandidates").Candidate | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [actionMenuCandidateId, setActionMenuCandidateId] = useState<number | null>(null);

  const availableStatuses = Array.from(
    new Set(
      (candidates || [])
        .map((candidate) => candidate.status?.trim())
        .filter((status): status is string => Boolean(status)),
    ),
  ).sort((a, b) => a.localeCompare(b));
  const visibleCandidates = (candidates || []).filter((candidate) =>
    statusFilter === "all" || (candidate.status || "Pending").toLowerCase() === statusFilter.toLowerCase(),
  );

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      deleteCandidate.mutate(id);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const { default: apiClient } = await import('@/api/client');
      const response = await apiClient.get('/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'candidates.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-900 mb-2">Candidate Database</h1>
          <p className="text-zinc-500">Manage and review parsed candidates.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            aria-expanded={isFilterOpen}
            aria-controls="candidate-filters"
            onClick={() => setIsFilterOpen((open) => !open)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-900 font-medium text-sm"
          >
            <Filter size={16} />
            Filters
          </button>
          <button 
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-900 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? <div className="w-4 h-4 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" /> : <Download size={16} />}
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by name, role, or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50-bright border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-stitch-primary focus:ring-1 focus:ring-stitch-primary transition-all text-zinc-900 placeholder:text-zinc-500"
            />
          </div>
          {isFilterOpen && (
            <div id="candidate-filters" className="mt-3 flex flex-wrap items-center gap-3">
              <label htmlFor="candidate-status-filter" className="text-sm font-medium text-zinc-700">
                Filter by status
              </label>
              <select
                id="candidate-status-filter"
                aria-label="Filter candidates by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
              >
                <option value="all">All statuses</option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
                {!availableStatuses.some((status) => status?.toLowerCase() === "pending") && (
                  <option value="pending">Pending</option>
                )}
              </select>
            </div>
          )}
        </div>

        <Table className="min-w-[860px] table-fixed">
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-zinc-200 hover:bg-transparent">
              <TableHead scope="col" className="w-[240px] text-zinc-500 font-semibold">Candidate Info</TableHead>
              <TableHead scope="col" className="w-[180px] text-zinc-500 font-semibold">Applied Role</TableHead>
              <TableHead scope="col" className="w-[130px] text-zinc-500 font-semibold">Experience</TableHead>
              <TableHead scope="col" className="w-[130px] text-zinc-500 font-semibold">Match</TableHead>
              <TableHead scope="col" className="w-[120px] text-zinc-500 font-semibold">Status</TableHead>
              <TableHead scope="col" className="w-[60px] text-right text-zinc-500 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                  Loading candidates...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-red-500">
                  Failed to load candidates.
                </TableCell>
              </TableRow>
            ) : visibleCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                  {candidates?.length ? "No candidates match these filters." : "No candidates found."}
                </TableCell>
              </TableRow>
            ) : (
              visibleCandidates.map((candidate) => (
                <TableRow key={candidate.id} className="border-zinc-200 hover:bg-zinc-50 border-b transition-colors group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#10b981]/20 text-[#10b981] flex items-center justify-center font-bold text-sm">
                        {candidate.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">{candidate.full_name}</p>
                        <p className="text-xs text-zinc-500">{candidate.email || 'No email'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-900">{candidate.applied_role || 'General'}</TableCell>
                  <TableCell className="text-zinc-500">{candidate.experience_years} years</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-zinc-50-bright rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${candidate.match_score >= 90 ? 'bg-[#10b981]' : candidate.match_score >= 80 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                          style={{ width: `${candidate.match_score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-zinc-900">{candidate.match_score}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-zinc-200 ${
                      (candidate.status || 'Pending').toLowerCase() === 'processing' ? 'text-blue-500 bg-blue-50' : 
                      (candidate.status || 'Pending').toLowerCase() === 'pending' ? 'text-yellow-600 bg-yellow-50' : 
                      (candidate.status || 'Pending').toLowerCase() === 'rejected' ? 'text-red-500 bg-red-50' : 
                      'text-green-600 bg-green-50'
                    }`}>
                      {candidate.status || 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="relative inline-block">
                      <button
                        type="button"
                        aria-label={`Actions for ${candidate.full_name}`}
                        aria-expanded={actionMenuCandidateId === candidate.id}
                        aria-controls={`candidate-actions-${candidate.id}`}
                        onClick={() => setActionMenuCandidateId((id) => id === candidate.id ? null : candidate.id)}
                        className="p-2 hover:bg-zinc-50-bright rounded-lg transition-colors outline-none text-zinc-500"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {actionMenuCandidateId === candidate.id && (
                        <div id={`candidate-actions-${candidate.id}`} role="group" aria-label={`${candidate.full_name} actions`} className="absolute right-0 top-full z-20 min-w-40 rounded-lg border border-zinc-200 bg-white p-1 text-left shadow-lg">
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 focus:bg-zinc-100"
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setActionMenuCandidateId(null);
                            }}
                          >
                            <Eye size={14} /> View Profile
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-red-600 hover:bg-zinc-100 focus:bg-zinc-100 disabled:opacity-50"
                            onClick={() => {
                              handleDelete(candidate.id);
                              setActionMenuCandidateId(null);
                            }}
                            disabled={deleteCandidate.isPending}
                          >
                            <Trash size={14} /> {deleteCandidate.isPending ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-2xl bg-white border border-zinc-200 shadow-2xl p-0 overflow-hidden">
          {selectedCandidate && (
            <>
              <div className="bg-zinc-50 border-b border-zinc-200 p-6 flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-[#10b981]/20 text-[#10b981] flex items-center justify-center font-bold text-2xl shrink-0">
                  {selectedCandidate.full_name?.charAt(0) || '?'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 font-display">{selectedCandidate.full_name}</h2>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-zinc-500">
                    {selectedCandidate.email && <span>📧 {selectedCandidate.email}</span>}
                    {selectedCandidate.phone && <span>📱 {selectedCandidate.phone}</span>}
                    {selectedCandidate.location && <span>📍 {selectedCandidate.location}</span>}
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-3 border-b border-zinc-100 pb-2">Extracted Summary</h3>
                  <div className="bg-zinc-50 rounded-lg p-4 text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed border border-zinc-100">
                    {selectedCandidate.summary || "No summary available."}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-3 border-b border-zinc-100 pb-2">Detected Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills?.map((skill: { name: string }, i: number) => (
                      <Badge key={i} className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-none px-3 py-1">
                        {skill.name}
                      </Badge>
                    ))}
                    {!selectedCandidate.skills?.length && (
                      <span className="text-zinc-500 text-sm">No specific skills detected.</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
