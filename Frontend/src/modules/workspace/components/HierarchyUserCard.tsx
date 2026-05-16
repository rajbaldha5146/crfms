/* eslint-disable @typescript-eslint/no-unused-vars */
import { CheckCircle2, Clock } from "lucide-react";
import type { ProjectHierarchyNodeDto } from "../../../types/projectHierarchy";
import { useAuthStore } from "../../../store/useAuthStore";

interface Props {
  node: ProjectHierarchyNodeDto;
  onUserClick: (userId: number) => void;
}

const HierarchyUserCard = ({ node, onUserClick }: Props) => {
  const { user } = useAuthStore();
  const isOwnProfile = user?.id === node.userId;

  const totalFeedback = node.openFeedbackCount + node.resolvedFeedbackCount;

  const handleClick = () => {
    if (!isOwnProfile) {
      onUserClick(node.userId);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={[
        "relative w-full max-w-[360px] mx-auto overflow-hidden",
        "rounded-2xl transition-all duration-300",
        isOwnProfile
          ? "cursor-not-allowed"
          : "cursor-pointer",
      ].join(" ")}
    >
      {/* Background gradient based on feedback status */}
      <div
        className={`
          absolute inset-0 -z-10
          ${
            totalFeedback === 0
              ? "bg-gradient-to-br from-slate-50 to-slate-100"
              : node.openFeedbackCount > node.resolvedFeedbackCount
              ? "bg-gradient-to-br from-amber-50 to-orange-50"
              : "bg-gradient-to-br from-emerald-50 to-teal-50"
          }
        `}
      />

      {/* Border + Shadow */}
      <div
        className={`
          absolute inset-0 rounded-2xl border -z-10 transition-all duration-300
          ${
            isOwnProfile
              ? "border-slate-300 shadow-sm"
              : "border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 hover:scale-105"
          }
        `}
      />

      {/* Content */}
      <div className="relative p-5">
        {/* Header: Avatar + Name + Status */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center shrink-0
              text-white text-[16px] font-bold
              ${
                isOwnProfile
                  ? "bg-slate-400"
                  : "bg-gradient-to-br from-slate-900 to-slate-700 shadow-md"
              }
            `}
          >
            {node.fullName?.[0] ?? "?"}
          </div>

          {/* Name + Role */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-bold text-slate-900 truncate">
                {node.fullName}
              </h3>
              {isOwnProfile && (
                <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-slate-900 text-white tracking-wider shrink-0">
                  You
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
              {node.roleName}
            </p>
          </div>

          {/* Feedback Indicator Badge */}
          {totalFeedback > 0 && !isOwnProfile && (
            <div className="text-right">
              <div className="text-[18px] font-black text-slate-900">
                {totalFeedback}
              </div>
              <p className="text-[8px] uppercase text-slate-500 font-bold tracking-widest">
                Items
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {totalFeedback > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Progress
              </div>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                style={{
                  width: `${(node.resolvedFeedbackCount / totalFeedback) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px] text-amber-600 font-bold">
                {node.openFeedbackCount} open
              </span>
              <span className="text-[9px] text-emerald-600 font-bold">
                {node.resolvedFeedbackCount} done
              </span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Open */}
          <div className="rounded-lg bg-white/60 border border-amber-200 p-3 text-center backdrop-blur-sm hover:bg-white/80 transition-all">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={13} className="text-amber-600" />
              <span className="text-[12px] font-black text-amber-700">
                {node.openFeedbackCount}
              </span>
            </div>
            <p className="text-[9px] uppercase text-amber-600 font-bold tracking-wider">
              Open
            </p>
          </div>

          {/* Resolved */}
          <div className="rounded-lg bg-white/60 border border-emerald-200 p-3 text-center backdrop-blur-sm hover:bg-white/80 transition-all">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span className="text-[12px] font-black text-emerald-700">
                {node.resolvedFeedbackCount}
              </span>
            </div>
            <p className="text-[9px] uppercase text-emerald-600 font-bold tracking-wider">
              Resolved
            </p>
          </div>
        </div>

        {/* CTA - Click hint */}
        {!isOwnProfile && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
              <span>View Details</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HierarchyUserCard;