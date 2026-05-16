import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "../../../components/layout/Header";
import FeedbackTabs from "../components/FeedbackTabs";
import FeedbackList from "../components/FeedbackList";
import { useWorkspaceFeedbacks } from "../hooks/useWorkspaceFeedbacks";
import { useRoleConfig } from "../hooks/useRoleConfig";
import { getSubmittedFeedbacks } from "../../../api/feedbackApi";

const WorkspaceSubmittedPage = () => {
  const navigate = useNavigate();
  const roleConfig = useRoleConfig();

  const { feedbacks, isLoading, activeTab, openCount, resolvedCount, setActiveTab } =
    useWorkspaceFeedbacks({
      fetchFn: (status) => getSubmittedFeedbacks(status),
    });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Submitted Feedbacks"
        subtitle="Track feedbacks you've submitted"
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(roleConfig.baseRoute)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        {/* Tabs */}
        <FeedbackTabs
          activeTab={activeTab}
          openCount={openCount}
          resolvedCount={resolvedCount}
          onTabChange={setActiveTab}
        />

        {/* Feedback List */}
        <FeedbackList
          feedbacks={feedbacks}
          isLoading={isLoading}
          showReviewer={roleConfig.showReviewerInCard}
          showReviewee={roleConfig.showRevieweeInCard}
          showResolution={roleConfig.showResolutionPreview}
          onFeedbackClick={(feedbackId) =>
            navigate(roleConfig.feedbackDetailsRoute(feedbackId))
          }
        />
      </main>
    </div>
  );
};

export default WorkspaceSubmittedPage;