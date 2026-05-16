import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/layout/Header";
import { getMyProjectCards } from "../../../api/projectApi";
import { useFeedbackStore } from "../../../store/useFeedbackStore";
import { useUIStore } from "../../../store/useUIStore";

const PMProjectsOverviewPage = () => {
  const { projects, setProjects, setSelectedProject } = useFeedbackStore();
  const navigate = useNavigate();

  // GLOBAL STORE - UI Blocking
  const setGlobalLoading = useUIStore((state) => state.loading);

  // =========================
  // Load Projects (Bootstrap)
  // =========================
  const loadProjects = async () => {
    try {
      // RULE: Route bootstrap operation requires global spinner
      setGlobalLoading(true);

      const response = await getMyProjectCards();

      setProjects(response.data);

      if (response.data.length > 0) {
        setSelectedProject(response.data[0]);
      }
    } catch (error) {
      console.error("Failed to load projects", error);
    } finally {
      // Release global lock
      setGlobalLoading(false);
    }
  };

  // =========================
  // Initial Load
  // =========================
  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="My Projects"
        subtitle="Overview of assigned projects and feedback activity"
      />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Empty state */}
        {projects.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl py-20 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-slate-900">No Projects Assigned</h3>
            <p className="text-[13px] text-slate-400 mt-1.5 max-w-xs">
              You are not assigned to any active projects yet.
            </p>
          </div>

        ) : (
          <>
            {/* Page heading */}
            <div className="mb-8">
              <h2 className="text-[22px] font-semibold text-slate-900">Project Workspace</h2>
              <p className="text-[13px] text-slate-500 mt-1">
                Monitor project activity and feedback statistics
              </p>
            </div>

            {/* Project Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/pm-projects/${project.id}`)}
                  className="group bg-white border border-slate-200 rounded-2xl p-6 text-left hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  {/* Project name + description */}
                  <div className="mb-6">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-[16px] font-semibold text-slate-900 leading-snug group-hover:text-slate-700 transition-colors">
                        {project.name}
                      </h2>
                      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-200">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17L17 7M17 7H7M17 7v10" />
                        </svg>
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-500 mt-2 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">

                    {/* Members */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Members
                      </p>
                      <p className="text-[26px] font-bold text-slate-900 mt-1.5 leading-none">
                        {project.totalMembers}
                      </p>
                    </div>

                    {/* Open */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">
                        Open
                      </p>
                      <p className="text-[26px] font-bold text-amber-700 mt-1.5 leading-none">
                        {project.openFeedbackCount}
                      </p>
                    </div>

                    {/* Resolved */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500">
                        Resolved
                      </p>
                      <p className="text-[26px] font-bold text-emerald-700 mt-1.5 leading-none">
                        {project.resolvedFeedbackCount}
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

export default PMProjectsOverviewPage;