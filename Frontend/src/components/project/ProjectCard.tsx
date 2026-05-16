import type { ProjectCardDto } from "../../types/project";
import { Users, Clock, CheckCircle2 } from "lucide-react";

interface Props {
  project: ProjectCardDto;
  isSelected: boolean;
  onClick: () => void;
}

const ProjectCard = ({ project, isSelected, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white border rounded-2xl p-5 transition-all duration-200 ${
        isSelected
          ? "border-slate-900 ring-2 ring-slate-900/20 shadow-sm"
          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {/* Header: Name + Status */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-slate-900 truncate">
            {project.name}
          </h3>
          <p className="text-[12px] text-slate-500 mt-1 line-clamp-2">
            {project.description}
          </p>
        </div>

        <span
          className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
            project.status === "Active"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-rose-50 text-rose-700 border border-rose-100"
          }`}
        >
          {project.status}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 mb-4" />

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Members */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            <Users size={14} className="text-slate-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Members
            </p>
            <p className="text-[16px] font-bold text-slate-900 leading-none">
              {project.totalMembers}
            </p>
          </div>
        </div>

        {/* Open */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <Clock size={14} className="text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Open
            </p>
            <p className="text-[16px] font-bold text-slate-900 leading-none">
              {project.openFeedbackCount}
            </p>
          </div>
        </div>

        {/* Resolved */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 size={14} className="text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Resolved
            </p>
            <p className="text-[16px] font-bold text-slate-900 leading-none">
              {project.resolvedFeedbackCount}
            </p>
          </div>
        </div>
      </div>

      {/* Last Activity */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Last activity:{" "}
          <span className="font-medium text-slate-500">
            {project.lastFeedbackAt
              ? new Date(project.lastFeedbackAt).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "No activity"}
          </span>
        </p>
      </div>
    </button>
  );
};

export default ProjectCard;