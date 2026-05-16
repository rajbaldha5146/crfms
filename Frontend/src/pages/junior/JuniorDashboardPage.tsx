import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Clock, CheckCircle2, FileText } from "lucide-react";
import { getMyProjectCards } from "../../api/projectApi";
import type { ProjectCardDto } from "../../types/project";
import Header from "../../components/layout/Header";

const JuniorDashboardPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectCardDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await getMyProjectCards();
      setProjects(response.data);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="My Projects"
        subtitle="View feedback assigned to you across your active projects"
      />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="spinner-gradient" />
            <p className="text-[13px] text-slate-400 font-medium">Loading projects…</p>
          </div>

        ) : projects.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl py-20 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
              <Briefcase size={22} className="text-slate-400" />
            </div>
            <h3 className="text-[15px] font-semibold text-slate-900">No Projects Found</h3>
            <p className="text-[13px] text-slate-400 mt-1.5 max-w-xs">
              No projects have been assigned to you yet.
            </p>
          </div>

        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-[22px] font-semibold text-slate-900">Assigned Projects</h2>
              <p className="text-[13px] text-slate-500 mt-1">
                Click a project to view your feedback inbox for that project
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/junior/projects/${project.id}`)}
                  className="group bg-white border border-slate-200 rounded-2xl p-6 text-left hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  {/* Project name + description */}
                  <div className="mb-6">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-[16px] font-semibold text-slate-900 leading-snug group-hover:text-slate-700 transition-colors">
                        {project.name}
                      </h2>
                      <span className="shrink-0 w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-200">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17L17 7M17 7H7M17 7v10" />
                        </svg>
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-500 mt-2 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  {/* Stats — My feedback counts */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Clock size={12} className="text-amber-500" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">Open</p>
                      </div>
                      <p className="text-[26px] font-bold text-amber-700 leading-none">
                        {project.openFeedbackCount}
                      </p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500">Resolved</p>
                      </div>
                      <p className="text-[26px] font-bold text-emerald-700 leading-none">
                        {project.resolvedFeedbackCount}
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <FileText size={12} className="text-slate-500" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Total</p>
                      </div>
                      <p className="text-[26px] font-bold text-slate-900 leading-none">
                        {project.openFeedbackCount + project.resolvedFeedbackCount}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default JuniorDashboardPage;
