/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, Clock, CheckCircle2 } from "lucide-react";

import Header from "../../../components/layout/Header";
import Button from "../../../components/common/Button";

import { getProjectHierarchy, getMyProjectCards } from "../../../api/projectApi";
import HierarchyNodeCard from "../../../components/project/HierarchyNodeCard";

import type { ProjectCardDto } from "../../../types/project";
import type { ProjectHierarchyNodeDto } from "../../../types/projectHierarchy";
import { useUIStore } from "../../../store/useUIStore";

const PMProjectWorkspacePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const setGlobalLoading = useUIStore((state) => state.loading);

  const [project, setProject] = useState<ProjectCardDto | null>(null);
  const [hierarchy, setHierarchy] = useState<ProjectHierarchyNodeDto[]>([]);

  const loadWorkspace = useCallback(async () => {
    if (!projectId) return;

    try {
      setGlobalLoading(true);

      const [projectsResponse, hierarchyResponse] = await Promise.all([
        getMyProjectCards(),
        getProjectHierarchy(Number(projectId)),
      ]);

      const selectedProject = projectsResponse.data.find(
        (x) => x.id === Number(projectId)
      );

      if (!selectedProject) {
        navigate("/pm-projects");
        return;
      }

      setProject(selectedProject);
      setHierarchy(hierarchyResponse);
    } catch (error) {
      console.error("Workspace load failed", error);
    } finally {
      setGlobalLoading(false);
    }
  }, [projectId, navigate, setGlobalLoading]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title={project?.name ?? "Project Workspace"}
        subtitle={project?.description ?? "Hierarchy and feedback monitoring"}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Top Actions */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate("/pm-projects")}
              className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={15} />
              Back to Projects
            </button>

            <Button
              variant="primary"
              onClick={() => navigate(`/pm-projects/${projectId}/create-feedback`)}
            >
              Submit Feedback
            </Button>
          </div>

          {project && (
            <>
              {/* Stats Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Members */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <Users size={20} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Members
                      </p>
                      <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">
                        {project.totalMembers}
                      </p>
                    </div>
                  </div>

                  {/* Open */}
                  <div className="flex items-center gap-4">
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
                  <div className="flex items-center gap-4">
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
                </div>
              </div>

              {/* Team Network Section */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="mb-6">
                  <h2 className="text-[18px] font-semibold text-slate-900">
                    Team Network
                  </h2>
                  <p className="text-[13px] text-slate-500 mt-1">
                    Click a member to open their workspace. Branch connections follow reporting hierarchy.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  {hierarchy.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
                        <Users size={28} className="text-slate-400" />
                      </div>
                      <h3 className="text-[18px] font-semibold text-slate-900">
                        No Hierarchy Found
                      </h3>
                      <p className="text-[13px] text-slate-500 mt-2">
                        No hierarchy data available for this project.
                      </p>
                    </div>
                  ) : (
                    <div className="min-w-max py-6 px-4">
                      {/* Render multiple root nodes horizontally */}
                      <div className="flex justify-center gap-12 flex-wrap">
                        {hierarchy.map((rootNode) => (
                          <div key={rootNode.userId} className="flex flex-col items-center">
                            <HierarchyNodeCard node={rootNode} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Loading State */}
          {!project && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
                  <Users size={28} className="text-slate-400" />
                </div>
                <h3 className="text-[18px] font-semibold text-slate-900">
                  Loading Project...
                </h3>
                <p className="text-[13px] text-slate-500 mt-2">
                  Please wait while we fetch project details.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PMProjectWorkspacePage;