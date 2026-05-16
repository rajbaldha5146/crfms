/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FolderKanban, Plus, Users, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../../components/layout/Header";
import { createProject, getProjects } from "../../../api/pmProjectApi";
import { useUIStore } from "../../../store/useUIStore";

import type { ProjectCardDto } from "../../../types/project";

const PMProjectManagementPage = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<ProjectCardDto[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { showToast, loading: setGlobalLoading } = useUIStore();

  const loadProjects = async () => {
    try {
      setGlobalLoading(true);
      const response = await getProjects();
      setProjects(response);
    } catch (error) {
      console.error("Failed to load projects", error);
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast("Project name is required", "error");
      return;
    }

    if (description.length > 1000) {
      showToast("Description must be less than 1000 characters", "error");
      return;
    }

    try {
      setLoading(true);
      setGlobalLoading(true);

      await createProject({
        name,
        description,
      });

      showToast("Project created successfully", "success");

      setName("");
      setDescription("");
      setIsFormOpen(false); // Close form after success

      await loadProjects();
    } catch (error) {
      showToast("Failed to create project", "error");
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Project Management"
        subtitle="Create projects and manage project members"
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Create Project Form - Collapsible */}
          <div className="bg-white border border-slate-200 rounded-2xl">
            {/* Header - Always Visible */}
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-slate-600" />
                <h2 className="text-[18px] font-semibold text-slate-900">
                  Create New Project
                </h2>
              </div>
              <ChevronDown
                size={20}
                className={`text-slate-500 transition-transform duration-200 ${
                  isFormOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Subtitle - Always Visible */}
            <div className="px-6 pb-4">
              <p className="text-[13px] text-slate-500">
                Add a new project to manage team members and assignments
              </p>
            </div>

            {/* Form Content - Collapsible */}
            {isFormOpen && (
              <>
                <div className="border-t border-slate-200" />
                <div className="px-6 py-6 space-y-4">
                  {/* Project Name */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
                      Project Name *
                      <span className="text-slate-400 normal-case ml-2">
                        ({name.length}/150)
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter project name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      className="
                        h-[38px]
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        px-4
                        text-[13px]
                        outline-none
                        transition
                        focus:border-slate-400
                        focus:ring-2
                        focus:ring-slate-100
                        disabled:bg-slate-50
                        disabled:cursor-not-allowed
                      "
                      maxLength={150}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
                      Description
                      <span className="text-slate-400 normal-case ml-2">
                        ({description.length}/1000)
                      </span>
                    </label>
                    <textarea
                      placeholder="Enter project description (optional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={loading}
                      rows={3}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        px-4
                        py-3
                        text-[13px]
                        outline-none
                        transition
                        resize-none
                        focus:border-slate-400
                        focus:ring-2
                        focus:ring-slate-100
                        disabled:bg-slate-50
                        disabled:cursor-not-allowed
                      "
                      maxLength={1000}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="
                        h-[38px]
                        px-6
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        text-[13px]
                        font-bold
                        text-slate-700
                        transition
                        hover:bg-slate-50
                        hover:border-slate-300
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                      "
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={!name.trim() || loading}
                      className="
                        h-[38px]
                        px-6
                        rounded-xl
                        bg-slate-900
                        text-[13px]
                        font-bold
                        text-white
                        transition
                        hover:bg-slate-800
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                      "
                    >
                      {loading ? "Creating..." : "Create Project"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Projects List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="mb-6">
              <h2 className="text-[18px] font-semibold text-slate-900">
                All Projects
              </h2>
              <p className="text-[13px] text-slate-500 mt-1">
                {projects.length} {projects.length === 1 ? "project" : "projects"} available
              </p>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
                  <FolderKanban size={28} className="text-slate-400" />
                </div>
                <h3 className="text-[18px] font-semibold text-slate-900">
                  No Projects Yet
                </h3>
                <p className="text-[13px] text-slate-500 mt-2">
                  Create your first project to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="
                      bg-slate-50
                      border
                      border-slate-200
                      rounded-xl
                      p-5
                      transition-all
                      hover:border-slate-300
                      hover:shadow-sm
                    "
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] font-semibold text-slate-900 truncate">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-[12px] text-slate-500 mt-1.5 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                      </div>

                      <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <FolderKanban size={18} className="text-slate-600" />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Users size={14} />
                        <span className="text-[12px] font-medium">
                          {project.totalMembers}{" "}
                          {project.totalMembers === 1 ? "Member" : "Members"}
                        </span>
                      </div>

                      <div className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        {project.status}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() =>
                        navigate(`/pm-project-management/${project.id}/members`)
                      }
                      className="
                        h-9
                        w-full
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        text-[13px]
                        font-semibold
                        text-slate-700
                        transition
                        hover:bg-slate-50
                        hover:border-slate-300
                      "
                    >
                      Manage Members
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PMProjectManagementPage;