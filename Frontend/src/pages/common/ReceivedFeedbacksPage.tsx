import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Clock, CheckCircle2, FileText } from "lucide-react";
import { getReceivedFeedbacks, type ReceivedFeedbackCardDto } from "../../api/feedbackApi";
import Header from "../../components/layout/Header";
import Button from "../../components/common/Button";
import ProjectFeedbackCard from "../../components/project/ProjectFeedbackCard";

const ReceivedFeedbacksPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get("status") ?? "open";

  const [feedbacks, setFeedbacks] = useState<ReceivedFeedbackCardDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  // Load Feedbacks
  const loadFeedbacks = async () => {
    try {
      setIsLoading(true);

      const response = await getReceivedFeedbacks(status);
      setFeedbacks(response.data);

      // Total Counts
      const openResponse = await getReceivedFeedbacks("open");
      const resolvedResponse = await getReceivedFeedbacks("resolved");

      setOpenCount(openResponse.data.length);
      setResolvedCount(resolvedResponse.data.length);
    } finally {
      setIsLoading(false);
    }
  };

  // Change Filter
  const handleFilterChange = (value: "open" | "resolved") => {
    setSearchParams({ status: value });
  };

  // Initial Load
  useEffect(() => {
    loadFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="My Received Feedbacks"
        subtitle="Track and resolve feedbacks assigned to you"
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x divide-slate-100">
            {/* Open */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Open Feedbacks
                </p>
                <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">
                  {openCount}
                </p>
              </div>
            </div>

            {/* Resolved */}
            <div className="flex items-center gap-4 md:pl-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Resolved Feedbacks
                </p>
                <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">
                  {resolvedCount}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center gap-4 md:pl-6">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-slate-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Total Feedbacks
                </p>
                <p className="text-[28px] font-bold text-slate-900 leading-none mt-1">
                  {openCount + resolvedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Filter:
          </p>
          <div className="flex gap-2">
            <Button
              variant={status === "open" ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleFilterChange("open")}
            >
              Open
            </Button>

            <Button
              variant={status === "resolved" ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleFilterChange("resolved")}
            >
              Resolved
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="spinner-gradient" />
            <p className="text-[13px] text-slate-400 font-medium">Loading feedbacks…</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
              <FileText size={28} className="text-slate-400" />
            </div>
            <h2 className="text-[18px] font-semibold text-slate-900">
              No Feedbacks Found
            </h2>
            <p className="text-[13px] text-slate-500 mt-2 max-w-sm mx-auto">
              No feedbacks available in this section. Check back later or change the filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                onClick={() => navigate(`/feedbacks/${feedback.id}`)}
                className="cursor-pointer"
              >
                <ProjectFeedbackCard feedback={feedback} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ReceivedFeedbacksPage;