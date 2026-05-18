import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Clock, CheckCircle2, Inbox, ChevronDown, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import {
  getReceivedFeedbacks,
  type ReceivedFeedbackCardDto,
  type DropdownOption,
} from "../../api/feedbackApi";
import Header from "../../components/layout/Header";
import ProjectFeedbackCard from "../../components/project/ProjectFeedbackCard";

type StatusTab = "all" | "open" | "resolved";

const ReceivedFeedbacksPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Active filters from URL ──
  const status     = (searchParams.get("status")     ?? "all")  as StatusTab;
  const projectId  = searchParams.get("projectId")  ? Number(searchParams.get("projectId"))  : undefined;
  const reviewerId = searchParams.get("reviewerId") ? Number(searchParams.get("reviewerId")) : undefined;
  const startDate  = searchParams.get("startDate")  ?? "";
  const endDate    = searchParams.get("endDate")    ?? "";
  const page       = searchParams.get("page")       ? Number(searchParams.get("page"))       : 1;

  // ── State ──
  const [items, setItems]               = useState<ReceivedFeedbackCardDto[]>([]);
  const [openCount, setOpenCount]       = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [totalCount, setTotalCount]     = useState(0);
  const [totalPages, setTotalPages]     = useState(1);
  const [projectOptions, setProjectOptions]   = useState<DropdownOption[]>([]);
  const [reviewerOptions, setReviewerOptions] = useState<DropdownOption[]>([]);
  const [isLoading, setIsLoading]       = useState(false);

  // ── Single API call ──
  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await getReceivedFeedbacks({
        status:     status === "all" ? undefined : status,
        projectId,
        reviewerId,
        startDate:  startDate  || undefined,
        endDate:    endDate    || undefined,
        page,
        pageSize:   10,
      });

      const d = res.data;
      setItems(d?.items            ?? []);
      setOpenCount(d?.openCount     ?? 0);
      setResolvedCount(d?.resolvedCount ?? 0);
      setTotalCount(d?.totalCount   ?? 0);
      setTotalPages(d?.totalPages   ?? 1);
      // Only update dropdowns on first load or when project/reviewer changes
      if (d?.projects?.length)  setProjectOptions(d.projects);
      if (d?.reviewers?.length) setReviewerOptions(d.reviewers);
    } catch (err) {
      console.error("Failed to load feedback inbox", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── URL param helpers ──
  const setParam = (key: string, value: string | undefined) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);
    else p.delete(key);
    p.delete("page"); // reset page on filter change
    setSearchParams(p);
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    setSearchParams(params);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, projectId, reviewerId, startDate, endDate, page]);

  // ── Dynamic summary ──
  // ── Empty state per tab ──
  const emptyTitle =
    status === "open"     ? "No Pending Reviews" :
    status === "resolved" ? "No Resolved Feedback" :
    "No Feedback Yet";
  const emptySubtitle =
    status === "open"     ? "You're all caught up — no open feedback in your inbox." :
    status === "resolved" ? "No feedback has been resolved yet." :
    "No feedback has been shared with you yet.";

  const hasActiveFilters = !!(projectId || reviewerId || startDate || endDate);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Feedback Inbox"
        subtitle="Track feedback shared by teammates, monitor pending reviews, and stay aligned across projects"
      />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Title & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              My Inbox
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review and track the status of feedback shared with you.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setParam("status", undefined)}
              className={`px-4 py-2 text-[13px] font-semibold rounded-lg transition-all ${
                status === "all"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              All
              <span
                className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${
                  status === "all"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {totalCount}
              </span>
            </button>
            <button
              onClick={() => setParam("status", "open")}
              className={`px-4 py-2 text-[13px] font-semibold rounded-lg transition-all flex items-center gap-2 ${
                status === "open"
                  ? "bg-amber-100 text-amber-900 shadow-sm ring-1 ring-amber-200/50"
                  : "text-slate-600 hover:bg-amber-50"
              }`}
            >
              <Clock size={14} className={status === "open" ? "text-amber-600" : ""} />
              Open
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
                  status === "open"
                    ? "bg-amber-200/50 text-amber-900"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {openCount}
              </span>
            </button>
            <button
              onClick={() => setParam("status", "resolved")}
              className={`px-4 py-2 text-[13px] font-semibold rounded-lg transition-all flex items-center gap-2 ${
                status === "resolved"
                  ? "bg-emerald-100 text-emerald-900 shadow-sm ring-1 ring-emerald-200/50"
                  : "text-slate-600 hover:bg-emerald-50"
              }`}
            >
              <CheckCircle2 size={14} className={status === "resolved" ? "text-emerald-600" : ""} />
              Resolved
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
                  status === "resolved"
                    ? "bg-emerald-200/50 text-emerald-900"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {resolvedCount}
              </span>
            </button>
          </div>
        </div>

        {/* ── Advanced Filters ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">

            {/* Project dropdown */}
            {projectOptions.length > 0 && (
              <div className="relative">
                <select
                  value={projectId ?? ""}
                  onChange={(e) => setParam("projectId", e.target.value || undefined)}
                  className="bg-white border border-slate-200 text-slate-700 text-[13px] rounded-xl pl-3 pr-8 py-2 font-medium outline-none appearance-none cursor-pointer hover:bg-slate-50 w-48"
                >
                  <option value="">All Projects</option>
                  {projectOptions.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                  <ChevronDown size={13} className="text-slate-400" />
                </div>
              </div>
            )}

            {/* Reviewer dropdown */}
            {reviewerOptions.length > 0 && (
              <div className="relative">
                <select
                  value={reviewerId ?? ""}
                  onChange={(e) => setParam("reviewerId", e.target.value || undefined)}
                  className="bg-white border border-slate-200 text-slate-700 text-[13px] rounded-xl pl-3 pr-8 py-2 font-medium outline-none appearance-none cursor-pointer hover:bg-slate-50 w-48"
                >
                  <option value="">All Reviewers</option>
                  {reviewerOptions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                  <ChevronDown size={13} className="text-slate-400" />
                </div>
              </div>
            )}

            {/* Date range */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarDays size={13} className="text-slate-400" />
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setParam("startDate", e.target.value || undefined)}
                  className="bg-white border border-slate-200 text-slate-700 text-[13px] rounded-xl pl-9 pr-3 py-2 outline-none focus:border-slate-400"
                />
              </div>
              <span className="text-slate-400 text-[12px]">→</span>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarDays size={13} className="text-slate-400" />
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setParam("endDate", e.target.value || undefined)}
                  className="bg-white border border-slate-200 text-slate-700 text-[13px] rounded-xl pl-9 pr-3 py-2 outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => setSearchParams({ status: status === "all" ? "" : status })}
                className="text-[12px] font-medium text-slate-400 hover:text-rose-500 transition-colors ml-auto"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="spinner-gradient" />
            <p className="text-[13px] text-slate-400 font-medium">Loading your inbox…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 mx-auto flex items-center justify-center mb-5">
              <Inbox size={28} className="text-slate-300" />
            </div>
            <h2 className="text-[18px] font-semibold text-slate-900">{emptyTitle}</h2>
            <p className="text-[13px] text-slate-500 mt-2 max-w-sm mx-auto">{emptySubtitle}</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((feedback) => (
                <ProjectFeedbackCard
                  key={feedback.id}
                  feedback={feedback}
                  onView={() => navigate(`/feedbacks/${feedback.id}`)}
                />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                <p className="text-[13px] text-slate-500">
                  Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
                  <span className="font-semibold text-slate-900">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ReceivedFeedbacksPage;