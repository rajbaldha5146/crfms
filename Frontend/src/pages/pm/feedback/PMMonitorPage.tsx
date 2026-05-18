import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Clock, CheckCircle2, LayoutGrid, FileText, ChevronDown, CalendarDays } from "lucide-react";
import { getHierarchy, type FeedbackHierarchyFilter, type ReceivedFeedbackCardDto } from "../../../api/feedbackApi";
import { getMyProjectCards } from "../../../api/projectApi";
import PmHeader from "../../../components/layout/PmHeader";
import Button from "../../../components/common/Button";
import ProjectFeedbackCard from "../../../components/project/ProjectFeedbackCard";

const PMMonitorPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Read active filters from URL ──
  const status    = searchParams.get("status")     ?? "open";
  const projectId = searchParams.get("projectId")  ? Number(searchParams.get("projectId"))  : undefined;
  const startDate = searchParams.get("startDate")  ?? "";
  const endDate   = searchParams.get("endDate")    ?? "";

  const [feedbacks, setFeedbacks]       = useState<ReceivedFeedbackCardDto[]>([]);
  const [projects, setProjects]         = useState<any[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [openCount, setOpenCount]       = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [totalCount, setTotalCount]     = useState(0);

  // ── Load project list for filter dropdown ──
  const loadProjects = async () => {
    try {
      const response = await getMyProjectCards();
      setProjects(response.data);
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  // ── ONE API call — fetch everything ──
  const loadData = async () => {
    try {
      setIsLoading(true);

      const filter: FeedbackHierarchyFilter = {
        status,
        projectId,
        startDate: startDate || undefined,
        endDate:   endDate   || undefined,
      };

      const response = await getHierarchy(filter);

      setFeedbacks(response.data.feedbacks ?? []);
      setOpenCount(response.data.openCount ?? 0);
      setResolvedCount(response.data.resolvedCount ?? 0);
      setTotalCount(response.data.totalCount ?? 0);
    } catch (error) {
      console.error("Failed to load PM monitor data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Filter helpers ──
  const setParam = (key: string, value: string | undefined) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);
    else p.delete(key);
    setSearchParams(p);
  };

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { loadData(); }, [status, projectId, startDate, endDate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <PmHeader
        title="Team Feedback Monitor"
        subtitle="Monitor feedback activity, team performance, and review resolution across projects"
      />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Stats Bar ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x divide-slate-100">

            {/* Open */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Open Items</p>
                <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">{openCount}</p>
              </div>
            </div>

            {/* Resolved */}
            <div className="flex items-center gap-4 md:pl-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Resolved Items</p>
                <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">{resolvedCount}</p>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center gap-4 md:pl-6">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                <LayoutGrid size={20} className="text-slate-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Total Activity</p>
                <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">{totalCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">

            {/* Status */}
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Status:</p>
              <div className="flex gap-2">
                <Button
                  variant={status === "open" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setParam("status", "open")}
                >
                  Open
                </Button>
                <Button
                  variant={status === "resolved" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setParam("status", "resolved")}
                >
                  Resolved
                </Button>
              </div>
            </div>

            <div className="w-px h-6 bg-slate-200 hidden sm:block" />

            {/* Project */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <LayoutGrid size={13} className="text-slate-400" />
              </div>
              <select
                value={projectId ?? "all"}
                onChange={(e) => setParam("projectId", e.target.value === "all" ? undefined : e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 text-[13px] rounded-xl focus:border-slate-400 focus:ring-0 block w-52 pl-9 pr-8 py-2 font-medium outline-none transition-all appearance-none cursor-pointer hover:bg-slate-50"
              >
                <option value="all">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={13} className="text-slate-400" />
              </div>
            </div>

            <div className="w-px h-6 bg-slate-200 hidden sm:block" />

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarDays size={13} className="text-slate-400" />
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setParam("startDate", e.target.value || undefined)}
                  className="bg-white border border-slate-200 text-slate-700 text-[13px] rounded-xl pl-9 pr-3 py-2 outline-none focus:border-slate-400 cursor-pointer w-42"
                  placeholder="Start date"
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
                  className="bg-white border border-slate-200 text-slate-700 text-[13px] rounded-xl pl-9 pr-3 py-2 outline-none focus:border-slate-400 cursor-pointer w-42"
                  placeholder="End date"
                />
              </div>
            </div>

            {/* Clear filters */}
            {(projectId || startDate || endDate) && (
              <button
                onClick={() => setSearchParams({ status })}
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
            <p className="text-[13px] text-slate-400 font-medium">Analyzing team activity…</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 mx-auto flex items-center justify-center mb-6">
              <FileText size={28} className="text-slate-300" />
            </div>
            <h2 className="text-[18px] font-semibold text-slate-900">No Feedback Activity</h2>
            <p className="text-[13px] text-slate-500 mt-2 max-w-sm mx-auto">
              There is currently no feedback activity recorded for your team under the selected filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                onClick={() => navigate(`/feedbacks/${feedback.id}`)}
                className="cursor-pointer"
              >
                <ProjectFeedbackCard 
                  feedback={feedback} 
                  showBothParticipants={true}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PMMonitorPage;
