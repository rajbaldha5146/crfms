import type { FeedbackCardDto } from "../../types/projectFeedback";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";

interface Props {
  feedback: FeedbackCardDto;
  onView?: () => void;
  isSubmittedView?: boolean;
  showBothParticipants?: boolean;
}

// Format relative time like "2 hours ago", "yesterday", etc.
const relativeTime = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1)   return "just now";
  if (diffMins < 60)  return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7)   return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

// Get initials from a full name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const ProjectFeedbackCard = ({ feedback, onView, isSubmittedView, showBothParticipants }: Props) => {
  const isResolved = feedback.status === "Resolved";

  return (
    <div
      onClick={onView}
      className={`bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 overflow-hidden flex ${
        onView ? "cursor-pointer" : ""
      }`}
    >
      {/* Left color accent bar */}
      <div
        className={`w-1 shrink-0 ${isResolved ? "bg-emerald-400" : "bg-amber-400"}`}
      />

      <div className="flex-1 p-5">
        {/* Top row: title + status badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold text-slate-900 leading-snug truncate">
              {feedback.title}
            </h3>
            {feedback.projectName && (
              <span className="inline-block mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                {feedback.projectName}
              </span>
            )}
          </div>

          <span
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
              isResolved
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-amber-50 text-amber-700 border-amber-100"
            }`}
          >
            {isResolved ? <CheckCircle2 size={10} /> : <Clock size={10} />}
            {isResolved ? "Resolved" : "Open"}
          </span>
        </div>

        {/* Reviewer/Reviewee row with avatar */}
        <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
          {showBothParticipants ? (
            <div className="flex items-center gap-3">
              {/* Reviewer */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {getInitials(feedback.reviewerName)}
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-slate-700 leading-tight">
                    {feedback.reviewerName}
                  </p>
                  <p className="text-[10px] text-slate-400">Reviewer</p>
                </div>
              </div>
              
              <div className="text-slate-300">
                <ArrowRight size={14} />
              </div>

              {/* Reviewee */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {getInitials(feedback.revieweeName)}
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-slate-700 leading-tight">
                    {feedback.revieweeName}
                  </p>
                  <p className="text-[10px] text-slate-400">Reviewee</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Avatar initials */}
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {getInitials(isSubmittedView ? feedback.revieweeName : feedback.reviewerName)}
              </div>
              <div>
                <p className="text-[12px] font-semibold text-slate-700 leading-tight">
                  {isSubmittedView ? feedback.revieweeName : feedback.reviewerName}
                </p>
                <p className="text-[10px] text-slate-400">
                  {isSubmittedView ? "Reviewee" : "Reviewer"}
                </p>
              </div>
            </div>
          )}

          <div className="text-right">
            <p className="text-[11px] font-medium text-slate-500">
              {relativeTime(feedback.createdAt)}
            </p>
            <p className="text-[10px] text-slate-400">
              {new Date(feedback.createdAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>
        </div>

        {/* Resolution Preview */}
        {isResolved && feedback.resolutionMessage && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mt-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 mb-1">
              Resolution
            </p>
            <p className="text-[12px] text-emerald-900 line-clamp-2">
              {feedback.resolutionMessage}
            </p>
            {feedback.resolutionCreatedAt && (
              <p className="text-[10px] text-emerald-500 mt-1">
                Resolved {relativeTime(feedback.resolutionCreatedAt)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectFeedbackCard;
