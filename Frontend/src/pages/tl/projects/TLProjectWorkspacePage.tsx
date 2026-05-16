import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, Clock, CheckCircle2, FileText } from "lucide-react";
import Header from "../../../components/layout/Header";
import Button from "../../../components/common/Button";
import { getMyProjectCards, getProjectHierarchy } from "../../../api/projectApi";
import type { ProjectCardDto } from "../../../types/project";
import type { ProjectHierarchyNodeDto } from "../../../types/projectHierarchy";

const TLProjectWorkspacePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectCardDto | null>(null);
  const [hierarchy, setHierarchy] = useState<ProjectHierarchyNodeDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load Workspace
  const loadWorkspace = async () => {
    try {
      setIsLoading(true);

      // Projects
      const projectsResponse = await getMyProjectCards();
      const selectedProject = projectsResponse.data.find(
        (x) => x.id === Number(projectId)
      );

      if (!selectedProject) {
        navigate("/tl-projects");
        return;
      }

      setProject(selectedProject);

      // Hierarchy
      const hierarchyResponse = await getProjectHierarchy(Number(projectId));
      setHierarchy(hierarchyResponse);
    } finally {
      setIsLoading(false);
    }
  };

  // Flatten Hierarchy
  const members = useMemo(() => {
    const result: ProjectHierarchyNodeDto[] = [];

    const traverse = (nodes: ProjectHierarchyNodeDto[]) => {
      for (const node of nodes) {
        result.push(node);
        if (node.children?.length) {
          traverse(node.children);
        }
      }
    };

    traverse(hierarchy);
    return result;
  }, [hierarchy]);

  // Initial Load
  useEffect(() => {
    loadWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title={project?.name ?? "Project Workspace"}
        subtitle="Manage your team feedback workflows"
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Top Actions */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate("/tl-projects")}
            className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Projects
          </button>

          <Button
            variant="primary"
            onClick={() => navigate(`/tl-projects/${projectId}/create-feedback`)}
          >
            Submit Feedback
          </Button>
        </div>

        {/* Stats Bar */}
        {project && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:divide-x divide-slate-100">
              {/* Members */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <Users size={20} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Team Members
                  </p>
                  <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">
                    {members.length}
                  </p>
                </div>
              </div>

              {/* Open */}
              <div className="flex items-center gap-4 md:pl-6">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Open Feedbacks
                  </p>
                  <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">
                    {project.openFeedbackCount}
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
                    Resolved Feedbacks
                  </p>
                  <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">
                    {project.resolvedFeedbackCount}
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center gap-4 md:pl-6">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Total Feedbacks
                  </p>
                  <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">
                    {project.openFeedbackCount + project.resolvedFeedbackCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="spinner-gradient" />
            <p className="text-[13px] text-slate-400 font-medium">Loading workspace…</p>
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-[18px] font-semibold text-slate-900">Team Members</h2>
              <p className="text-[13px] text-slate-500 mt-1">
                View and manage your assigned team members
              </p>
            </div>

            {/* Empty State */}
            {members.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
                  <Users size={28} className="text-slate-400" />
                </div>
                <h2 className="text-[18px] font-semibold text-slate-900">
                  No Team Members Found
                </h2>
                <p className="text-[13px] text-slate-500 mt-2 max-w-sm mx-auto">
                  No hierarchy users assigned under this project.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {members.map((member) => (
                  <button
                    key={member.userId}
                    onClick={() =>
                      navigate(`/tl-projects/${projectId}/users/${member.userId}`)
                    }
                    className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                  >
                    {/* Avatar + Info */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[16px] font-bold shrink-0">
                        {member.fullName[0]}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-semibold text-slate-900 truncate">
                          {member.fullName}
                        </h3>
                        <p className="text-[12px] text-slate-500 truncate">
                          {member.roleName}
                        </p>
                        {member.reportingPersonName && (
                            <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                              <span className="text-slate-400 font-medium">
                                Reports to
                              </span>

                              <span className="font-semibold text-slate-700">
                                {member.reportingPersonName}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      {/* Open */}
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-600">
                          Open
                        </p>
                        <p className="text-[20px] font-bold text-amber-700 mt-1 leading-none">
                          {member.openFeedbackCount}
                        </p>
                      </div>

                      {/* Resolved */}
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-emerald-600">
                          Resolved
                        </p>
                        <p className="text-[20px] font-bold text-emerald-700 mt-1 leading-none">
                          {member.resolvedFeedbackCount}
                        </p>
                      </div>

                      {/* Total */}
                      <div className="bg-slate-100 rounded-xl p-2.5">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                          Total
                        </p>
                        <p className="text-[20px] font-bold text-slate-900 mt-1 leading-none">
                          {member.openFeedbackCount + member.resolvedFeedbackCount}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default TLProjectWorkspacePage;