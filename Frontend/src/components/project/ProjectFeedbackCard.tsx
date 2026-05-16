import type { FeedbackCardDto } from "../../types/projectFeedback";
import { CheckCircle2, Clock } from "lucide-react";

interface Props {
  feedback: FeedbackCardDto;
}

const ProjectFeedbackCard = ({ feedback }: Props) => {
  const isResolved = feedback.status === "Resolved";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
      {/* Header: Title + Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-[14px] font-semibold text-slate-900 leading-snug flex-1 min-w-0">
          {feedback.title}
          <div className="flex items-center gap-1.5 mt-1">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
               {feedback.projectName}
             </span>
          </div>
        </h3>

        <span
          className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
            isResolved
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-amber-50 text-amber-700 border-amber-100"
          }`}
        >
          {isResolved ? (
            <div className="flex items-center gap-1">
              <CheckCircle2 size={10} />
              {feedback.status}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Clock size={10} />
              {feedback.status}
            </div>
          )}
        </span>
      </div>

      {/* Meta: Reviewer + Reviewee */}
      <div className="flex flex-col gap-2 mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] text-slate-500">
            From:{" "}
            <span className="font-semibold text-slate-700">
              {feedback.reviewerName}
            </span>
          </p>
          <p className="text-[11px] text-slate-400 shrink-0">
            {new Date(feedback.createdAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {feedback.revieweeName && (
          <p className="text-[12px] text-slate-500">
            For:{" "}
            <span className="font-semibold text-slate-700">
              {feedback.revieweeName}
            </span>
          </p>
        )}
      </div>

      {/* Resolution Preview - Only when resolved */}
      {feedback.resolutionMessage && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700 mb-2">
            Resolution
          </p>
          <p className="text-[13px] text-emerald-900 line-clamp-3">
            {feedback.resolutionMessage}
          </p>
        </div>
      )}

      {/* Date */}

      <p className="text-xs text-slate-400 mt-2">
        {new Date(feedback.createdAt).toLocaleString()}
      </p>
    </div>
  );
};

export default ProjectFeedbackCard;
