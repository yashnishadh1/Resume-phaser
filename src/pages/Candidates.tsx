import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Search, Filter, Download, MoreVertical, Eye, Trash, ArrowUpDown } from "lucide-react";
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
import { usePageMetadata } from "@/lib/seo";
import { useToast } from "@/components/ToastProvider";
import apiClient from "@/api/client";
import { isAxiosError } from "axios";

type SortKey = "full_name" | "applied_role" | "experience_years" | "match_score" | "status";
type ColumnKey = "role" | "experience" | "match" | "status";

export default function Candidates() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(() => new URLSearchParams(location.search).get("search") || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: candidates, isLoading, error, refetch, isFetching } = useCandidates(searchTerm);
  const deleteCandidate = useDeleteCandidate();
  const [selectedCandidate, setSelectedCandidate] = useState<import("@/api/useCandidates").Candidate | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({ key: "full_name", direction: "asc" });
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({ role: true, experience: true, match: true, status: true });
  const [actionMenuCandidateId, setActionMenuCandidateId] = useState<number | null>(null);
  const toast = useToast();
  usePageMetadata({ title: "Candidates | HireLens", description: "Search and review candidate profiles in your private HireLens workspace.", path: location.pathname, noIndex: true });

  const availableStatuses = Array.from(
    new Set(
      (candidates || [])
        .map((candidate) => candidate.status?.trim())
        .filter((status): status is string => Boolean(status)),
    ),
  ).sort((a, b) => a.localeCompare(b));
  const filteredCandidates = (candidates || []).filter((candidate) =>
    statusFilter === "all" || (candidate.status || "Pending").toLowerCase() === statusFilter.toLowerCase(),
  );
  const sortedCandidates = [...filteredCandidates].sort((left, right) => {
    const leftValue = sort.key === "full_name" ? left.full_name || "" : sort.key === "applied_role" ? left.applied_role || "" : sort.key === "status" ? left.status || "Pending" : left[sort.key] || 0;
    const rightValue = sort.key === "full_name" ? right.full_name || "" : sort.key === "applied_role" ? right.applied_role || "" : sort.key === "status" ? right.status || "Pending" : right[sort.key] || 0;
    const comparison = typeof leftValue === "number" && typeof rightValue === "number" ? leftValue - rightValue : String(leftValue).localeCompare(String(rightValue), undefined, { sensitivity: "base" });
    return sort.direction === "asc" ? comparison : -comparison;
  });
  const pageCount = Math.max(1, Math.ceil(sortedCandidates.length / pageSize));
  const pageCandidates = sortedCandidates.slice((page - 1) * pageSize, page * pageSize);
  const visibleColumnCount = 1 + Number(visibleColumns.role) + Number(visibleColumns.experience) + Number(visibleColumns.match) + Number(visibleColumns.status);
  const pageSelectionComplete = pageCandidates.length > 0 && pageCandidates.every((candidate) => selectedIds.has(candidate.id));

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        await deleteCandidate.mutateAsync(id);
        toast("Candidate deleted successfully.", "success");
        if (selectedCandidate?.id === id) setSelectedCandidate(null);
      } catch {
        toast("Failed to delete candidate. Please try again.", "error");
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const response = await apiClient.get('/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'candidates.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      toast("Candidate CSV exported successfully.", "success");
    } catch (error: unknown) {
      const detail = isAxiosError(error) ? (error.response?.data as { detail?: unknown } | undefined)?.detail : undefined;
      toast(typeof detail === "string" ? detail : "Failed to export the candidate CSV. Please try again.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSort = (key: SortKey) => {
    setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  };

  const togglePageSelection = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const shouldSelect = !pageSelectionComplete;
      pageCandidates.forEach((candidate) => shouldSelect ? next.add(candidate.id) : next.delete(candidate.id));
      return next;
    });
  };

  const toggleCandidateSelection = (id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length || !window.confirm(`Delete ${ids.length} selected candidate${ids.length === 1 ? "" : "s"}?`)) return;
    setIsBulkDeleting(true);
    const outcomes = await Promise.allSettled(ids.map((id) => deleteCandidate.mutateAsync(id)));
    const removed = ids.filter((_, index) => outcomes[index].status === "fulfilled");
    setSelectedIds((current) => new Set(Array.from(current).filter((id) => !removed.includes(id))));
    toast(removed.length === ids.length ? `${removed.length} candidate${removed.length === 1 ? "" : "s"} deleted successfully.` : `${removed.length} of ${ids.length} candidates were deleted. Retry the remaining selection.`, removed.length === ids.length ? "success" : "error");
    setIsBulkDeleting(false);
  };

  const handleExportSelected = () => {
    const selected = (candidates || []).filter((candidate) => selectedIds.has(candidate.id));
    if (!selected.length) return;
    try {
      const escapeCsv = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
      const rows = [["Name", "Email", "Applied Role", "Experience (years)", "Match Score", "Status"], ...selected.map((candidate) => [candidate.full_name, candidate.email, candidate.applied_role, candidate.experience_years, candidate.match_score, candidate.status])];
      const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
      const url = window.URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "selected-candidates.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      toast(`${selected.length} selected candidates exported successfully.`, "success");
    } catch {
      toast("Could not export the selected candidates. Please try again.", "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-100 mb-2">Candidate Database</h1>
          <p className="text-slate-400">Manage and review parsed candidates.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            aria-expanded={isFilterOpen}
            aria-controls="candidate-filters"
            onClick={() => setIsFilterOpen((open) => !open)}
            className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700"
          >
            <Filter size={16} />
            Filters
          </button>
          <button 
            type="button"
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? <div role="status" aria-label="Exporting candidates" className="size-4 animate-spin rounded-full border-2 border-indigo-300 border-t-transparent" /> : <Download size={16} />}
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3" aria-live="polite">
          <span className="text-sm text-slate-200">{selectedIds.size} candidate{selectedIds.size === 1 ? "" : "s"} selected</span>
          <button type="button" onClick={handleExportSelected} className="min-h-11 rounded-md border border-slate-600 px-3 text-sm text-slate-100 hover:bg-slate-800">Export selected</button>
          <button type="button" onClick={() => void handleBulkDelete()} disabled={isBulkDeleting} className="min-h-11 rounded-md bg-rose-700 px-3 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-50">{isBulkDeleting ? "Deleting…" : "Delete selected"}</button>
          <button type="button" onClick={() => setSelectedIds(new Set())} className="min-h-11 rounded-md px-3 text-sm text-slate-300 hover:bg-slate-800">Clear selection</button>
        </div>
      )}

      <div className="min-w-0 rounded-xl border border-slate-700 bg-slate-900">
        <div className="p-4 border-b border-slate-700 bg-slate-800">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              aria-label="Search candidates"
              type="text" 
              placeholder="Search by name, role, or email..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); setSelectedIds(new Set()); }}
              className="min-h-11 w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-4 text-sm text-slate-100 transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
          {isFilterOpen && (
            <div id="candidate-filters" className="mt-3 flex flex-wrap items-center gap-3">
              <label htmlFor="candidate-status-filter" className="text-sm font-medium text-slate-300">
                Filter by status
              </label>
              <select
                id="candidate-status-filter"
                aria-label="Filter candidates by status"
                value={statusFilter}
                onChange={(event) => { setStatusFilter(event.target.value); setPage(1); setSelectedIds(new Set()); }}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              >
                <option value="all">All statuses</option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
                {!availableStatuses.some((status) => status?.toLowerCase() === "pending") && (
                  <option value="pending">Pending</option>
                )}
              </select>
              <fieldset className="flex flex-wrap items-center gap-3">
                <legend className="sr-only">Visible candidate columns</legend>
                {([['role', 'Applied Role'], ['experience', 'Experience'], ['match', 'Match'], ['status', 'Status']] as const).map(([key, label]) => (
                  <label key={key} className="inline-flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" checked={visibleColumns[key]} onChange={(event) => setVisibleColumns((current) => ({ ...current, [key]: event.target.checked }))} />
                    {label}
                  </label>
                ))}
              </fieldset>
            </div>
          )}
        </div>

        <div className="w-full overflow-x-auto overscroll-x-contain">
        <Table className="min-w-[860px] table-fixed">
          <TableHeader className="bg-slate-900/50">
            <TableRow className="border-slate-700 hover:bg-transparent">
              <TableHead scope="col" className="w-12"><input type="checkbox" aria-label="Select candidates on this page" checked={pageSelectionComplete} onChange={togglePageSelection} disabled={!pageCandidates.length} /></TableHead>
              <TableHead scope="col" className="w-[240px] text-slate-400 font-semibold"><button type="button" onClick={() => handleSort("full_name")} className="inline-flex min-h-11 items-center gap-1">Candidate Info <ArrowUpDown size={14} aria-hidden="true" /><span className="sr-only">Sort by candidate name</span></button></TableHead>
              {visibleColumns.role && <TableHead scope="col" className="w-[180px] text-slate-400 font-semibold"><button type="button" onClick={() => handleSort("applied_role")} className="inline-flex min-h-11 items-center gap-1">Applied Role <ArrowUpDown size={14} aria-hidden="true" /><span className="sr-only">Sort by applied role</span></button></TableHead>}
              {visibleColumns.experience && <TableHead scope="col" className="w-[130px] text-slate-400 font-semibold"><button type="button" onClick={() => handleSort("experience_years")} className="inline-flex min-h-11 items-center gap-1">Experience <ArrowUpDown size={14} aria-hidden="true" /><span className="sr-only">Sort by experience</span></button></TableHead>}
              {visibleColumns.match && <TableHead scope="col" className="w-[130px] text-slate-400 font-semibold"><button type="button" onClick={() => handleSort("match_score")} className="inline-flex min-h-11 items-center gap-1">Match <ArrowUpDown size={14} aria-hidden="true" /><span className="sr-only">Sort by match score</span></button></TableHead>}
              {visibleColumns.status && <TableHead scope="col" className="w-[120px] text-slate-400 font-semibold"><button type="button" onClick={() => handleSort("status")} className="inline-flex min-h-11 items-center gap-1">Status <ArrowUpDown size={14} aria-hidden="true" /><span className="sr-only">Sort by status</span></button></TableHead>}
              <TableHead scope="col" className="w-[60px] text-right text-slate-400 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={visibleColumnCount + 2} className="text-center py-8 text-slate-400">
                  Loading candidates...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={visibleColumnCount + 2} className="text-center py-8 text-rose-300" role="alert">
            <span>Failed to load candidates. </span><button type="button" disabled={isFetching} onClick={() => void refetch()} className="underline decoration-dotted underline-offset-2 disabled:opacity-50">{isFetching ? "Retrying…" : "Try again"}</button>
                </TableCell>
              </TableRow>
            ) : pageCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumnCount + 2} className="text-center py-8 text-slate-400">
                  {candidates?.length ? "No candidates match these filters." : "No candidates found."}
                </TableCell>
              </TableRow>
            ) : (
              pageCandidates.map((candidate) => (
                <TableRow key={candidate.id} className="border-slate-700 hover:bg-slate-800 border-b transition-colors group">
                  <TableCell><input type="checkbox" aria-label={`Select ${candidate.full_name}`} checked={selectedIds.has(candidate.id)} onChange={() => toggleCandidateSelection(candidate.id)} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#4F46E5]/20 text-[#4F46E5] flex items-center justify-center font-bold text-sm">
                        {candidate.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-100">{candidate.full_name}</p>
                        <p className="text-xs text-slate-400">{candidate.email || 'No email'}</p>
                      </div>
                    </div>
                  </TableCell>
                  {visibleColumns.role && <TableCell className="text-slate-100">{candidate.applied_role || 'General'}</TableCell>}
                  {visibleColumns.experience && <TableCell className="text-slate-400">{candidate.experience_years} years</TableCell>}
                  {visibleColumns.match && <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${candidate.match_score >= 90 ? 'bg-[#4F46E5]' : candidate.match_score >= 80 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                          style={{ width: `${candidate.match_score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-100">{candidate.match_score}%</span>
                    </div>
                  </TableCell>}
                  {visibleColumns.status && <TableCell>
                    <Badge variant="outline" className={`border-slate-700 ${
                      (candidate.status || 'Pending').toLowerCase() === 'processing' ? 'text-blue-200 bg-blue-500/15' :
                      (candidate.status || 'Pending').toLowerCase() === 'pending' ? 'text-amber-200 bg-amber-500/15' :
                      (candidate.status || 'Pending').toLowerCase() === 'rejected' ? 'text-rose-200 bg-rose-500/15' :
                      'text-emerald-200 bg-emerald-500/15'
                    }`}>
                      {candidate.status || 'Pending'}
                    </Badge>
                  </TableCell>}
                  <TableCell className="text-right">
                    <div className="relative inline-block">
                      <button
                        type="button"
                        aria-label={`Actions for ${candidate.full_name}`}
                        aria-expanded={actionMenuCandidateId === candidate.id}
                        aria-controls={`candidate-actions-${candidate.id}`}
                        onClick={() => setActionMenuCandidateId((id) => id === candidate.id ? null : candidate.id)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors outline-none text-slate-400"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {actionMenuCandidateId === candidate.id && (
                        <div id={`candidate-actions-${candidate.id}`} role="group" aria-label={`${candidate.full_name} actions`} className="absolute right-0 top-full z-20 min-w-40 rounded-lg border border-slate-700 bg-slate-900 p-1 text-left shadow-lg">
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 focus:bg-slate-800"
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setActionMenuCandidateId(null);
                            }}
                          >
                            <Eye size={14} /> View Profile
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-red-600 hover:bg-slate-800 focus:bg-slate-800 disabled:opacity-50"
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
        <div className="flex flex-col gap-3 border-t border-slate-700 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">{sortedCandidates.length ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, sortedCandidates.length)} of ${sortedCandidates.length} loaded candidates` : "No candidates to display"}</p>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="candidate-page-size" className="text-sm text-slate-300">Rows per page</label>
            <select id="candidate-page-size" aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="min-h-11 rounded border border-slate-700 bg-slate-900 px-2 text-sm text-slate-100">
              {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <button type="button" className="min-h-11 rounded border border-slate-700 px-3 text-sm text-slate-100 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
            <span className="text-sm text-slate-300" aria-live="polite">Page {page} of {pageCount}</span>
            <button type="button" className="min-h-11 rounded border border-slate-700 px-3 text-sm text-slate-100 disabled:opacity-50" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next</button>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-2xl bg-slate-900 border border-slate-700 shadow-2xl p-0 overflow-hidden">
          {selectedCandidate && (
            <>
              <div className="bg-slate-800 border-b border-slate-700 p-6 flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-[#4F46E5]/20 text-[#4F46E5] flex items-center justify-center font-bold text-2xl shrink-0">
                  {selectedCandidate.full_name?.charAt(0) || '?'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 font-display">{selectedCandidate.full_name}</h2>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-slate-400">
                    {selectedCandidate.email && <span>📧 {selectedCandidate.email}</span>}
                    {selectedCandidate.phone && <span>📱 {selectedCandidate.phone}</span>}
                    {selectedCandidate.location && <span>📍 {selectedCandidate.location}</span>}
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-3 border-b border-slate-800 pb-2">Extracted Summary</h3>
                  <div className="bg-slate-800 rounded-lg p-4 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-800">
                    {selectedCandidate.summary || "No summary available."}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-3 border-b border-slate-800 pb-2">Detected Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills?.map((skill, i: number) => (
                      <Badge key={`${skill.name}-${i}`} className="border-none bg-indigo-500/10 px-3 py-1 text-indigo-200 hover:bg-indigo-500/20">
                        {skill.name}
                      </Badge>
                    ))}
                    {!selectedCandidate.skills?.length && (
                      <span className="text-slate-400 text-sm">No specific skills detected.</span>
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
