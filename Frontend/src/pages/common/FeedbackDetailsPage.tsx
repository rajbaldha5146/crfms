import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock, FileText, AlertCircle } from "lucide-react";
import { getFeedbackDetails, resolveFeedback, type FeedbackDetailDto } from "../../api/feedbackApi";
import Header from "../../components/layout/Header";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { useAuthStore } from "../../store/useAuthStore";
import { useUIStore } from "../../store/useUIStore";

const FeedbackDetailsPage = () => {
  const { feedbackId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useUIStore();

  const [feedback, setFeedback] = useState<FeedbackDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionMessage, setResolutionMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canResolve =
    feedback &&
    feedback.status === "Open" &&
    feedback.revieweeUserId === user?.id;

  const isResolved = feedback?.status === "Resolved";

  const loadDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getFeedbackDetails(Number(feedbackId));
      setFeedback(response.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackId]);

  const handleResolve = async () => {
    if (resolutionMessage.trim().length < 5) {
      showToast("Resolution message must be at least 5 characters", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await resolveFeedback(feedback!.id, { message: resolutionMessage });
      showToast("Feedback resolved successfully", "success");
      setIsResolveModalOpen(false);
      setResolutionMessage("");
      loadDetails();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Feedback Details"
        subtitle="Detailed feedback information and resolution workflow"
      />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="spinner-gradient" />
            <p className="text-[13px] text-slate-400 font-medium">Loading feedback…</p>
          </div>

        ) : feedback ? (
          <div className="space-y-5">
            {/* Status Bar - Prominent */}
            <div className={`rounded-2xl border-2 p-6 flex items-center justify-between ${
              isResolved
                ? "bg-emerald-50 border-emerald-200"
                : "bg-amber-50 border-amber-200"
            }`}>
              <div className="flex items-center gap-4">
                {isResolved ? (
                  <>
                    <CheckCircle2 size={32} className="text-emerald-600" />
                    <div>
                      <h2 className="text-[16px] font-bold text-emerald-900">Feedback Resolved</h2>
                      <p className="text-[12px] text-emerald-700 mt-1">
                        Resolved on {new Date(feedback.resolutionCreatedAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle size={32} className="text-amber-600" />
                    <div>
                      <h2 className="text-[16px] font-bold text-amber-900">Feedback Open</h2>
                      <p className="text-[12px] text-amber-700 mt-1">
                        Awaiting resolution
                      </p>
                    </div>
                  </>
                )}
              </div>

              {canResolve && (
                <Button variant="primary" onClick={() => setIsResolveModalOpen(true)}>
                  Resolve Now
                </Button>
              )}
            </div>

            {/* Meta Information */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:divide-x divide-slate-100">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                    Reviewer
                  </p>
                  <p className="text-[14px] font-semibold text-slate-900 leading-snug">
                    {feedback.reviewerName}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{feedback.reviewerRole}</p>
                </div>

                <div className="md:pl-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                    Reviewee
                  </p>
                  <p className="text-[14px] font-semibold text-slate-900 leading-snug">
                    {feedback.revieweeName}
                  </p>
                </div>

                <div className="md:pl-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                    Project
                  </p>
                  <p className="text-[14px] font-semibold text-slate-900 leading-snug">
                    {feedback.projectName}
                  </p>
                </div>

                <div className="md:pl-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                    Created
                  </p>
                  <p className="text-[14px] font-semibold text-slate-900 leading-snug">
                    {new Date(feedback.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Feedback Content */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                Feedback Title
              </p>
              <h1 className="text-[24px] font-bold text-slate-900 leading-snug mb-6">
                {feedback.title}
              </h1>

              <div className="border-t border-slate-100 pt-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">
                  Description
                </p>
                <div className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {feedback.description}
                </div>
              </div>
            </div>

            {/* Resolution Section - Only when Resolved */}
            {isResolved ? (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                    Resolution
                  </p>
                </div>

                <div className="bg-white border border-emerald-100 rounded-xl p-5 mb-5">
                  <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {feedback.resolutionMessage}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white border border-emerald-100 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                      Resolved By
                    </p>
                    <p className="text-[14px] font-bold text-slate-900">
                      {feedback.resolverName}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white border border-emerald-100 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                      Resolved At
                    </p>
                    <p className="text-[14px] font-bold text-slate-900">
                      {new Date(feedback.resolutionCreatedAt!).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-blue-600" />
                  <div>
                    <p className="text-[14px] font-bold text-blue-900">
                      Waiting for Resolution
                    </p>
                    <p className="text-[12px] text-blue-700 mt-1">
                      {canResolve
                        ? "You can resolve this feedback now"
                        : "Awaiting reviewer's response"
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
              <FileText size={28} className="text-slate-400" />
            </div>
            <h2 className="text-[18px] font-semibold text-slate-900">
              Feedback Not Found
            </h2>
            <p className="text-[13px] text-slate-500 mt-2 max-w-sm mx-auto">
              The requested feedback could not be loaded.
            </p>
          </div>
        )}
      </main>

      {/* Resolution Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Resolve Feedback"
      >
        <div className="space-y-5">
          <p className="text-[13px] text-slate-500 leading-relaxed">
            Add resolution details explaining how the feedback was addressed.
          </p>

          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-2">
              Resolution Message
            </label>
            <textarea
              rows={7}
              value={resolutionMessage}
              onChange={(e) => setResolutionMessage(e.target.value)}
              placeholder="Describe how the issue was resolved..."
              className="input-field resize-none w-full"
            />
            <div className="flex justify-between mt-1.5 px-0.5">
              <p className="text-[11px] text-slate-400">Minimum 5 characters</p>
              <p className="text-[11px] text-slate-400">{resolutionMessage.length}/2000</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="secondary" onClick={() => setIsResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleResolve}
              isLoading={isSubmitting}
            >
              Confirm Resolution
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FeedbackDetailsPage;