import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Clock, CheckCircle2, FileText, LayoutGrid, ChevronDown } from "lucide-react";
import { getHierarchyFeedbacks, type ReceivedFeedbackCardDto } from "../../../api/feedbackApi";
import { getMyProjectCards } from "../../../api/projectApi";
import Header from "../../../components/layout/Header";
import Button from "../../../components/common/Button";
import ProjectFeedbackCard from "../../../components/project/ProjectFeedbackCard";

const PMMonitorPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get("status") ?? "open";
  const projectId = searchParams.get("projectId") ? Number(searchParams.get("projectId")) : undefined;

  const [feedbacks, setFeedbacks] = useState<ReceivedFeedbackCardDto[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  // Load Projects
  const loadProjects = async () => {
    try {
        const response = await getMyProjectCards();
        setProjects(response.data);
    } catch (err) {
        console.error("Failed to load projects for filter", err);
    }
  };

  // Load Feedbacks
  const loadFeedbacks = async () => {
    try {
      setIsLoading(true);

      const response = await getHierarchyFeedbacks(status, projectId);
      setFeedbacks(response.data);

      const openResponse = await getHierarchyFeedbacks("open", projectId);
      const resolvedResponse = await getHierarchyFeedbacks("resolved", projectId);

      setOpenCount(openResponse.data.length);
      setResolvedCount(resolvedResponse.data.length);
    } catch (error) {
      console.error("Failed to load PM monitor data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Change Filter
  const handleFilterChange = (value: "open" | "resolved") => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("status", value);
    setSearchParams(newParams);
  };

  const handleProjectChange = (id: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (id === "all") {
        newParams.delete("projectId");
    } else {
        newParams.set("projectId", id);
    }
    setSearchParams(newParams);
  };

  // Initial Load
  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, projectId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Team Feedback Monitor"
        subtitle="Overview of all feedback activity across your projects"
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x divide-slate-100">
            {/* Open */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Open Items
                </p>
                <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">
                  {openCount}
                </p>
              </div>
            </div>

            {/* Resolved */}
            <div className="flex items-center gap-4 md:pl-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Resolved Items
                </p>
                <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">
                  {resolvedCount}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center gap-4 md:pl-6">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                <LayoutGrid size={20} className="text-slate-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Total Activity
                </p>
                <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">
                  {openCount + resolvedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    Status:
                </p>
                <div className="flex gap-2">
                    <Button
                    variant={status === "open" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handleFilterChange("open")}
                    >
                    Open
                    </Button>

                    <Button
                    variant={status === "resolved" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handleFilterChange("resolved")}
                    >
                    Resolved
                    </Button>
                </div>
            </div>

            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LayoutGrid size={14} className="text-slate-400" />
                </div>
                <select
                    value={projectId ?? "all"}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 text-[13px] rounded-xl focus:border-slate-400 focus:ring-0 block w-full md:w-60 pl-10 pr-10 py-2 font-semibold outline-none transition-all appearance-none cursor-pointer hover:bg-slate-50"
                >
                    <option value="all">All Projects</option>
                    {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <ChevronDown size={15} className="text-slate-400" />
                </div>
            </div>
        </div>

        {/* Content */}
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
            <h2 className="text-[18px] font-semibold text-slate-900">
              No Feedback Activity
            </h2>
            <p className="text-[13px] text-slate-500 mt-2 max-w-sm mx-auto">
              There is currently no feedback activity recorded for your team members under the selected filter.
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
                <ProjectFeedbackCard feedback={feedback} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PMMonitorPage;
