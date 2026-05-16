import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, Clock, CheckCircle2, FileText } from "lucide-react";
import Header from "../../../components/layout/Header";
import Button from "../../../components/common/Button";
import { useWorkspaceHierarchy } from "../hooks/useWorkspaceHierarchy";
import { useWorkspaceProjects } from "../hooks/useWorkspaceProjects";
import { useRoleConfig } from "../hooks/useRoleConfig";
import { useAuthStore } from "../../../store/useAuthStore";

const WorkspaceProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const roleConfig = useRoleConfig();
  const { user } = useAuthStore();
  

  const { projects } = useWorkspaceProjects();
  const { hierarchy, isLoading } = useWorkspaceHierarchy(Number(projectId));

  const project = projects.find((p) => p.id === Number(projectId));

  // Flatten hierarchy tree into a flat list (same as TLProjectWorkspacePage)
  const members = useMemo(() => {
    const result: typeof hierarchy[number][] = [];
    const traverse = (nodes: typeof hierarchy) => {
      for (const node of nodes) {
        result.push(node);
        if (node.children?.length) traverse(node.children);
      }
    };
    traverse(hierarchy);
    return result;
  }, [hierarchy]);

  // Stats derived from hierarchy nodes — scope-correct for this user's subtree.
  // This fixes the inconsistency: ProjectCardDto.open/resolved counts ALL project
  // feedbacks (8 open, 11 resolved) but SeniorDev only sees their 2 children.
  // Computing from nodes means the stat bar matches what the cards below show.
  const openCount = members.reduce((sum, m) => sum + m.openFeedbackCount, 0);
  const resolvedCount = members.reduce((sum, m) => sum + m.resolvedFeedbackCount, 0);
  const totalCount = openCount + resolvedCount;

  if (!project && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header
          title="Project Not Found"
          subtitle="The requested project could not be loaded"
        />
      </div>
    );
  }

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
            onClick={() => navigate(roleConfig.baseRoute)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Projects
          </button>

          {roleConfig.canCreateFeedback && (
            <Button
              variant="primary"
              onClick={() =>
                navigate(roleConfig.createFeedbackRoute(Number(projectId)))
              }
            >
              Submit Feedback
            </Button>
          )}
        </div>

        {/* Stats Bar — 4 columns, matches TLProjectWorkspacePage */}
        {project && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:divide-x divide-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <Users size={20} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Team Members</p>
                  <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">{members.length + 1}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 md:pl-6">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Open Feedbacks</p>
                  <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">{openCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 md:pl-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Resolved Feedbacks</p>
                  <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">{resolvedCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 md:pl-6">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Total Feedbacks</p>
                  <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">{totalCount}</p>
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
            <div className="mb-6">
              <h2 className="text-[18px] font-semibold text-slate-900">Team Members</h2>
              <p className="text-[13px] text-slate-500 mt-1">
                View and manage your assigned team members
              </p>
            </div>

            {members.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
                  <Users size={28} className="text-slate-400" />
                </div>
                <h2 className="text-[18px] font-semibold text-slate-900">No Team Members Found</h2>
                <p className="text-[13px] text-slate-500 mt-2 max-w-sm mx-auto">
                  No hierarchy users assigned under this project.
                </p>
              </div>
            ) : (
              /* Member cards — identical markup to TLProjectWorkspacePage */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {members.map((member) => {
                  const isOwnProfile = user?.id === member.userId;
                  return (
                    <button
                      key={member.userId}
                      onClick={() => {
                        if (!isOwnProfile) {
                          navigate(roleConfig.userRoute(Number(projectId), member.userId));
                        }
                      }}
                      disabled={isOwnProfile}
                      className={`bg-white border border-slate-200 rounded-2xl p-5 text-left transition-all duration-200 ${
                        isOwnProfile
                          ? "cursor-not-allowed opacity-60"
                          : "hover:border-slate-300 hover:shadow-sm cursor-pointer"
                      }`}
                    >
                      {/* Avatar + Name */}
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[16px] font-bold shrink-0">
                          {member.fullName[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[15px] font-semibold text-slate-900 truncate">
                              {member.fullName}
                            </h3>
                            {isOwnProfile && (
                              <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-slate-900 text-white tracking-wider shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] text-slate-500 truncate">{member.roleName}</p>
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

                      {/* Stats — matches TL */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5">
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-600">Open</p>
                          <p className="text-[20px] font-bold text-amber-700 mt-1 leading-none">{member.openFeedbackCount}</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-emerald-600">Resolved</p>
                          <p className="text-[20px] font-bold text-emerald-700 mt-1 leading-none">{member.resolvedFeedbackCount}</p>
                        </div>
                        <div className="bg-slate-100 rounded-xl p-2.5">
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Total</p>
                          <p className="text-[20px] font-bold text-slate-900 mt-1 leading-none">
                            {member.openFeedbackCount + member.resolvedFeedbackCount}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default WorkspaceProjectPage;