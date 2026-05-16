/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigate, useParams } from "react-router-dom";
import type { ProjectHierarchyNodeDto } from "../../types/projectHierarchy";
import { useAuthStore } from "../../store/useAuthStore";
import { CheckCircle2, Clock, User } from "lucide-react";

interface Props {
  node: ProjectHierarchyNodeDto;
  level?: number;
}

const HierarchyNodeCard = ({ node, level = 0 }: Props) => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const { user } = useAuthStore();
  const isOwnProfile = user?.id === node.userId;

  const handleClick = () => {
    if (isOwnProfile) return;
    navigate(`/pm-projects/${projectId}/users/${node.userId}`);
  };

  const hasChildren = (node.children?.length ?? 0) > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        onClick={handleClick}
        className={`
          relative w-[280px]
          bg-white border border-slate-200 rounded-2xl p-5
          transition-all duration-200
          ${
            isOwnProfile
              ? "cursor-not-allowed bg-slate-50/60 opacity-70"
              : "cursor-pointer hover:border-slate-300 hover:shadow-md "
          }
        `}
      >
        {/* Avatar + Info */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 text-[16px] font-bold">
            {node.fullName?.[0] ?? <User size={18} />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[14px] font-semibold text-slate-900 truncate">
                {node.fullName}
              </h3>
              {isOwnProfile && (
                <span className="text-[9px] uppercase bg-slate-900 text-white px-1.5 py-0.5 rounded-full font-bold tracking-wider shrink-0">
                  You
                </span>
              )}
            </div>

            <p className="text-[12px] text-slate-500 truncate">
              {node.roleName}
            </p>

            {node.reportingPersonName && (
              <div className="mt-2 flex items-center gap-1 text-[11px]">
                <span className="text-slate-400">Reports to</span>
                <span className="font-medium text-slate-700 truncate">
                  {node.reportingPersonName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
            <Clock size={11} />
            {node.openFeedbackCount}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
            <CheckCircle2 size={11} />
            {node.resolvedFeedbackCount}
          </span>
        </div>
      </div>

      {/* Children - Vertical Tree */}
      {hasChildren && (
        <div className="flex flex-col items-center mt-6">
          {/* Vertical connector from parent */}
          <div className="w-px h-8 bg-slate-300" />

          {/* Horizontal line for multiple children */}
          {node.children!.length > 1 && (
            <div className="relative w-full">
              <div className="h-px bg-slate-300 absolute top-0 left-0 right-0" style={{ width: `${(node.children!.length - 1) * 320}px`, left: '50%', transform: 'translateX(-50%)' }} />
            </div>
          )}

          {/* Children Cards */}
          <div className="flex gap-12 mt-8">
            {node.children!.map((child, index) => (
              <div key={child.userId} className="relative flex flex-col items-center">
                {/* Vertical line to child (only if multiple children) */}
                {node.children!.length > 1 && (
                  <div className="w-px h-8 bg-slate-300 absolute -top-8" />
                )}
                <HierarchyNodeCard node={child} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchyNodeCard;