/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ArrowLeft, Trash2, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";

import Header from "../../../components/layout/Header";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import {
  getProjectHierarchy,
  getMyProjectCards,
} from "../../../api/projectApi";
import { getPmHierarchy } from "../../../api/pmHierarchyApi";
import { assignMembers, removeMember } from "../../../api/pmProjectApi";
import { useUIStore } from "../../../store/useUIStore";

import type { ProjectCardDto } from "../../../types/project";
import type { ProjectHierarchyNodeDto } from "../../../types/projectHierarchy";
import type { HierarchyNodeDto } from "../../../types/hierarchy";
import { useRealtimeNotificationStore } from "../../../store/useRealtimeNotificationStore";

const PMProjectMembersPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const { addNotification } = useRealtimeNotificationStore();

  const [project, setProject] = useState<ProjectCardDto | null>(null);
  const [members, setMembers] = useState<ProjectHierarchyNodeDto[]>([]);
  const [allUsers, setAllUsers] = useState<HierarchyNodeDto[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<
    { value: number; label: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Confirmation Dialog State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    userId: number;
    name: string;
  } | null>(null);

  const { showToast, loading: setGlobalLoading } = useUIStore();

  // Flatten PM Users
  const flattenPmUsers = (node: HierarchyNodeDto): HierarchyNodeDto[] => {
    return [node, ...node.children.flatMap(flattenPmUsers)];
  };

  // Flatten Project Users
  const flattenProjectUsers = (
    nodes: ProjectHierarchyNodeDto[]
  ): ProjectHierarchyNodeDto[] => {
    return nodes.flatMap((node) => [
      node,
      ...flattenProjectUsers(node.children || []),
    ]);
  };

  // Load
  const load = async () => {
    setLoading(true);
    setGlobalLoading(true);

    try {
      // Get Project Details
      const projectsResponse = await getMyProjectCards();
      const selectedProject = projectsResponse.data.find(
        (x) => x.id === Number(projectId)
      );
      if (selectedProject) {
        setProject(selectedProject);
      }

      // Project Members
      const hierarchy = await getProjectHierarchy(Number(projectId));
      const flatMembers = flattenProjectUsers(hierarchy);
      setMembers(flatMembers);

      // PM Users
      const pmHierarchy = await getPmHierarchy();
      setAllUsers(flattenPmUsers(pmHierarchy));
    } catch (error) {
      console.error("Failed to load members", error);
      showToast("Failed to load project details", "error");
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Assigned User IDs
  const assignedIds = members.map((x) => x.userId);

  // Available Users
  const availableUsers = allUsers.filter(
    (x) => !assignedIds.includes(x.userId)
  );

  // Options
  const userOptions = availableUsers.map((user) => ({
    value: user.userId,
    label: `${user.fullName} (${user.role})`,
  }));

  // Add Members
  const handleAdd = async () => {
    if (selectedUsers.length === 0) {
      return;
    }

    try {
      setLoading(true);

      setGlobalLoading(true);

      const response = await assignMembers(
        Number(projectId),
        selectedUsers.map((x) => x.value)
      );

      // Success Toast

      showToast(response.message || "Members added successfully", "success");

      // Warning Toasts

      const warnings = response.data?.warnings ?? [];

      warnings.forEach((warning: string) => {
        addNotification({
          id: Date.now() + Math.random(),

          title: "Hierarchy Warning",

          message: warning,

          type: "HierarchyWarning",

          createdAt: new Date().toISOString(),
        });
      });

      // Reset

      setSelectedUsers([]);

      // Reload

      await load();
    } catch (error) {
      showToast("Failed to add members", "error");
    } finally {
      setLoading(false);

      setGlobalLoading(false);
    }
  };

  // Open Confirmation Dialog
  const handleRemoveClick = (userId: number, fullName: string) => {
    setMemberToRemove({ userId, name: fullName });
    setIsConfirmOpen(true);
  };

  // Confirm Remove Member
  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;

    try {
      setLoading(true);
      setGlobalLoading(true);

      await removeMember(Number(projectId), memberToRemove.userId);
      showToast("Member removed successfully", "success");
      await load();
    } catch (error) {
      // showToast("Failed to remove member", "error");
    } finally {
      setLoading(false);
      setGlobalLoading(false);
      setMemberToRemove(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title={project?.name ?? "Project Members"}
        subtitle="Manage project team members and assignments"
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Back Button & Project Info */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <button
              onClick={() => navigate("/pm-project-management")}
              className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={15} />
              Back to Projects
            </button>

            {/* Project Info Cards */}
            <div className="flex items-center gap-3">
              {project && (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Project
                    </span>
                    <span className="text-[13px] font-semibold text-slate-900">
                      {project.name}
                    </span>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users size={16} />
                  <span className="text-[13px] font-semibold">
                    {members.length}{" "}
                    {members.length === 1 ? "Member" : "Members"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Add Members Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-slate-600" />
                <h2 className="text-[18px] font-semibold text-slate-900">
                  Add Members
                </h2>
              </div>
              <p className="text-[13px] text-slate-500 mt-1">
                Select team members to add to this project
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-4">
              <Select
                isMulti
                options={userOptions}
                value={selectedUsers}
                onChange={(value) =>
                  setSelectedUsers(
                    value as {
                      value: number;
                      label: string;
                    }[]
                  )
                }
                placeholder="Search and select members..."
                className="text-[13px]"
                classNamePrefix="react-select"
                isDisabled={loading}
              />

              <button
                onClick={handleAdd}
                disabled={selectedUsers.length === 0 || loading}
                className="
                  h-[38px]
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
                {loading ? "Adding..." : "Add Members"}
              </button>
            </div>
          </div>

          {/* Members List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="mb-6">
              <h2 className="text-[18px] font-semibold text-slate-900">
                Team Members
              </h2>
              <p className="text-[13px] text-slate-500 mt-1">
                Current members assigned to this project
              </p>
            </div>

            {members.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
                  <Users size={28} className="text-slate-400" />
                </div>
                <h3 className="text-[18px] font-semibold text-slate-900">
                  No Members Yet
                </h3>
                <p className="text-[13px] text-slate-500 mt-2">
                  Add team members to get started with this project.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div
                    key={member.userId}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition-all hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Member Info - Clickable */}
                      <div
                        className="min-w-0 flex-1 cursor-pointer"
                        onClick={() => navigate(`/pm-users/${member.userId}`)}
                      >
                        <h3 className="text-[15px] font-semibold text-slate-900 truncate">
                          {member.fullName}
                        </h3>
                        <p className="text-[12px] text-slate-500 mt-0.5 truncate">
                          {member.roleName}
                        </p>

                        {member.reportingPersonName && (
                          <div className="mt-3 text-[11px] text-slate-400">
                            <span>Reports to </span>
                            <span className="font-semibold text-slate-600">
                              {member.reportingPersonName}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveClick(member.userId, member.fullName);
                        }}
                        disabled={loading}
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-rose-200
                          bg-rose-50
                          text-rose-600
                          transition
                          hover:bg-rose-100
                          hover:border-rose-300
                          disabled:opacity-40
                          disabled:cursor-not-allowed
                        "
                        title="Remove member"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setMemberToRemove(null);
        }}
        onConfirm={handleConfirmRemove}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${memberToRemove?.name} from the project "${project?.name}"? This action cannot be undone.`}
        confirmText="Yes, Remove"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default PMProjectMembersPage;
