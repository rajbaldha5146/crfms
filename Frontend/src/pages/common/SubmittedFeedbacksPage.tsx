import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Clock, CheckCircle2, FileText, Send, FilterX } from "lucide-react";
import type { SubmittedFeedbackCardDto } from "../../types/feedback";
import { getSubmittedFeedbacks, type DropdownOption } from "../../api/feedbackApi";
import Header from "../../components/layout/Header";
import ProjectFeedbackCard from "../../components/project/ProjectFeedbackCard";

const SubmittedFeedbacksPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const statusTab = searchParams.get("status") ?? "all";
  const projectParam = searchParams.get("projectId");
  const revieweeParam = searchParams.get("revieweeId");

  const [feedbacks, setFeedbacks] = useState<SubmittedFeedbackCardDto[]>([]);
  const [projects, setProjects] = useState<DropdownOption[]>([]);
  const [reviewees, setReviewees] = useState<DropdownOption[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Load Feedbacks
  const loadFeedbacks = async () => {
    try {
      setIsLoading(true);

      const response = await getSubmittedFeedbacks({
        status: statusTab === "all" ? undefined : statusTab,
        projectId: projectParam ? Number(projectParam) : undefined,
        revieweeId: revieweeParam ? Number(revieweeParam) : undefined,
        page: 1,
        pageSize: 100,
      });

      const d = response.data;
      setFeedbacks(d?.items ?? []);
      setOpenCount(d?.openCount ?? 0);
      setResolvedCount(d?.resolvedCount ?? 0);
      setTotalCount(d?.totalCount ?? 0);
      setProjects(d?.projects ?? []);
      setReviewees(d?.reviewees ?? []);
    } catch (err) {
      console.error("Failed to load submitted feedbacks", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Change Tabs
  const handleTabChange = (value: "all" | "open" | "resolved") => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "all") newParams.delete("status");
    else newParams.set("status", value);
    setSearchParams(newParams);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("projectId");
    newParams.delete("revieweeId");
    setSearchParams(newParams);
  };

  // Initial Load
  useEffect(() => {
    loadFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusTab, projectParam, revieweeParam]);

  const hasActiveFilters = projectParam || revieweeParam;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title="Submitted Feedbacks"
        subtitle="Track feedbacks you have given to others"
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col">
        {/* Title & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              My Submissions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review and track the status of feedback you've shared.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            <button
              onClick={() => handleTabChange("all")}
              className={`px-4 py-2 text-[13px] font-semibold rounded-lg transition-all ${
                statusTab === "all"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              All
              <span
                className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${
                  statusTab === "all"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {totalCount}
              </span>
            </button>
            <button
              onClick={() => handleTabChange("open")}
              className={`px-4 py-2 text-[13px] font-semibold rounded-lg transition-all flex items-center gap-2 ${
                statusTab === "open"
                  ? "bg-amber-100 text-amber-900 shadow-sm ring-1 ring-amber-200/50"
                  : "text-slate-600 hover:bg-amber-50"
              }`}
            >
              <Clock size={14} className={statusTab === "open" ? "text-amber-600" : ""} />
              Open
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
                  statusTab === "open"
                    ? "bg-amber-200/50 text-amber-900"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {openCount}
              </span>
            </button>
            <button
              onClick={() => handleTabChange("resolved")}
              className={`px-4 py-2 text-[13px] font-semibold rounded-lg transition-all flex items-center gap-2 ${
                statusTab === "resolved"
                  ? "bg-emerald-100 text-emerald-900 shadow-sm ring-1 ring-emerald-200/50"
                  : "text-slate-600 hover:bg-emerald-50"
              }`}
            >
              <CheckCircle2 size={14} className={statusTab === "resolved" ? "text-emerald-600" : ""} />
              Resolved
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
                  statusTab === "resolved"
                    ? "bg-emerald-200/50 text-emerald-900"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {resolvedCount}
              </span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
              Project
            </label>
            <select
              value={projectParam ?? ""}
              onChange={(e) => handleFilterChange("projectId", e.target.value)}
              className="w-full h-9 px-3 text-[13px] bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
              Reviewee
            </label>
            <select
              value={revieweeParam ?? ""}
              onChange={(e) => handleFilterChange("revieweeId", e.target.value)}
              className="w-full h-9 px-3 text-[13px] bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
            >
              <option value="">All Team Members</option>
              {reviewees.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-end h-[58px]">
              <button
                onClick={clearFilters}
                className="h-9 px-4 flex items-center gap-2 text-[13px] font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <FilterX size={14} />
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-32 gap-4">
            <div className="spinner-gradient" />
            <p className="text-[13px] text-slate-400 font-medium">Loading feedbacks…</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6">
              <Send size={28} className="text-slate-300" />
            </div>
            <h2 className="text-[18px] font-semibold text-slate-900">
              No Feedbacks Found
            </h2>
            <p className="text-[13px] text-slate-500 mt-2 max-w-sm mx-auto">
              {hasActiveFilters
                ? "No feedbacks match your current filters. Try clearing them to see more results."
                : `You haven't submitted any ${statusTab === "all" ? "" : statusTab} feedbacks yet.`}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-6 px-4 py-2 text-[13px] font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 pb-12">
            {feedbacks.map((feedback) => (
              <ProjectFeedbackCard 
                key={feedback.id}
                feedback={feedback} 
                isSubmittedView={true}
                onView={() => navigate(`/feedbacks/${feedback.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SubmittedFeedbacksPage;