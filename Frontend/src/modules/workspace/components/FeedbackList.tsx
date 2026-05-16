import React from "react";
import FeedbackCard from "./FeedbackCard";
import type { FeedbackCardDto } from "../../../types/projectFeedback";

interface FeedbackListProps {
  feedbacks: FeedbackCardDto[];
  isLoading: boolean;
  showReviewer?: boolean;
  showReviewee?: boolean;
  showResolution?: boolean;
  onFeedbackClick?: (feedbackId: number) => void;
}

const FeedbackList: React.FC<FeedbackListProps> = ({
  feedbacks,
  isLoading,
  showReviewer = true,
  showReviewee = false,
  showResolution = true,
  onFeedbackClick,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="spinner-gradient" />
        <p className="text-[13px] text-slate-400 font-medium">Loading feedbacks…</p>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10m7-8H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V4a2 2 0 00-2-2z" />
          </svg>
        </div>
        <h2 className="text-[18px] font-semibold text-slate-900">
          No Feedbacks Found
        </h2>
        <p className="text-[13px] text-slate-500 mt-2 max-w-sm mx-auto">
          No feedbacks available in this section. Try a different filter or create one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback) => (
        <FeedbackCard
          key={feedback.id}
          feedback={feedback}
          showReviewer={showReviewer}
          showReviewee={showReviewee}
          showResolution={showResolution}
          onClick={() => onFeedbackClick?.(feedback.id)}
        />
      ))}
    </div>
  );
};

export default FeedbackList;