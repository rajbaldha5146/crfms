import type { SubmittedFeedbackCardDto } from "../../types/feedback";

interface Props {
  feedback: SubmittedFeedbackCardDto;
}

const FeedbackCard = ({ feedback }: Props) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{feedback.title}</h3>

        <span
          className={`
            px-3 py-1 rounded-full text-xs font-bold
            ${
              feedback.status === "Resolved"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }
          `}
        >
          {feedback.status}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p>
          <span className="font-semibold">Reviewee:</span>{" "}
          {feedback.revieweeName}
        </p>

        <p>
          <span className="font-semibold">Reviewer:</span>{" "}
          {feedback.reviewerName}
        </p>

        {feedback.resolutionMessage && (
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-bold uppercase text-slate-500 mb-1">
              Resolution
            </p>

            <p className="text-sm text-slate-700">
              {feedback.resolutionMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackCard;
