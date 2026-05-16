import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";

import Header from "../../../components/layout/Header";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";

import { createFeedback, getReviewableUsers } from "../../../api/feedbackApi";
import { useUIStore } from "../../../store/useUIStore";
import { useAuthStore } from "../../../store/useAuthStore";

interface ReviewableUser {
  id: number;
  fullName: string;
  roleName: string;
}

const TLCreateFeedbackPage = () => {
  const { projectId, userId } = useParams();
  const navigate = useNavigate();
  const { showToast, loading: setGlobalLoading } = useUIStore();

  const [reviewableUsers, setReviewableUsers] = useState<ReviewableUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ReviewableUser | null>(null);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Loading States
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuthStore();

  // Constants
  const TITLE_MIN_LENGTH = 3;
  const TITLE_MAX_LENGTH = 150;
  const DESC_MIN_LENGTH = 10;
  const DESC_MAX_LENGTH = 2000;

  // Load Users
  const loadUsers = useCallback(
    async (searchText = "", isInitial = false) => {
      try {
        if (isInitial) setGlobalLoading(true);
        setIsLoadingUsers(true);

        const response = await getReviewableUsers(
          Number(projectId),
          searchText
        );
        setReviewableUsers(response.data);

        if (isInitial && userId) {
          const foundUser = response.data.find(
            (x: ReviewableUser) => x.id === Number(userId)
          );
          if (foundUser) setSelectedUser(foundUser);
        }
      } finally {
        setIsLoadingUsers(false);
        setGlobalLoading(false);
      }
    },
    [projectId, userId, setGlobalLoading]
  );

  // Submit
  const handleSubmit = async () => {
    if (!selectedUser) return showToast("Please select reviewee", "error");
    if (title.length < TITLE_MIN_LENGTH)
      return showToast(`Title must be at least ${TITLE_MIN_LENGTH} characters`, "error");
    if (description.length < DESC_MIN_LENGTH)
      return showToast(`Description must be at least ${DESC_MIN_LENGTH} characters`, "error");

    try {
      setIsSubmitting(true);
      setGlobalLoading(true);

      await createFeedback({
        projectId: Number(projectId),
        revieweeUserId: selectedUser.id,
        title,
        description,
      });

      showToast("Feedback submitted successfully", "success");
      navigate(`/tl-projects/${projectId}/users/${selectedUser.id}`);
    } finally {
      setIsSubmitting(false);
      setGlobalLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    loadUsers("", true);
  }, [loadUsers]);

  // Search Debounce
  useEffect(() => {
    if (userId) return;
    const timeout = setTimeout(() => {
      loadUsers(search);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, userId, loadUsers]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Create Feedback"
        subtitle={
          selectedUser
            ? `Submit feedback for ${selectedUser.fullName}`
            : "Submit new feedback"
        }
      />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        {/* Context bar — Project / Reviewer / Reviewee */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:divide-x divide-slate-100">
            {/* Project */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                Project
              </p>
              <p className="text-[14px] font-semibold text-slate-900 leading-snug">
                Code Review Management System
              </p>
            </div>

            {/* Reviewer */}
            <div className="md:pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                Reviewer
              </p>
              <p className="text-[14px] font-semibold text-slate-900">{user?.name}</p>
              <p className="text-[12px] text-slate-400 mt-0.5">{user?.role}</p>
            </div>

            {/* Reviewee */}
            <div className="md:pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                Reviewee
              </p>
              {selectedUser ? (
                <>
                  <p className="text-[14px] font-semibold text-slate-900">
                    {selectedUser.fullName}
                  </p>
                  <p className="text-[12px] text-slate-400 mt-0.5">
                    {selectedUser.roleName}
                  </p>
                </>
              ) : (
                <p className="text-[13px] text-slate-400">Not selected yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Main form card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
          {/* Reviewee selector */}
          {!userId && (
            <>
              <div>
                <h3 className="text-[13px] font-semibold text-slate-700 mb-3">
                  Select Reviewee
                </h3>

                <Input
                  placeholder="Search by employee name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {/* User list */}
                <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                  {isLoadingUsers ? (
                    <div className="h-32 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="spinner-gradient scale-50" />
                        <p className="text-[11px] text-slate-400">Loading users…</p>
                      </div>
                    </div>
                  ) : reviewableUsers.length === 0 ? (
                    <div className="h-32 flex items-center justify-center">
                      <p className="text-[13px] text-slate-400 font-medium">No users found</p>
                    </div>
                  ) : (
                    reviewableUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setSelectedUser(u)}
                        className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 transition-colors flex items-center justify-between gap-3 ${
                          selectedUser?.id === u.id
                            ? "bg-slate-900 text-white"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className={`text-[13px] font-semibold leading-snug truncate ${
                            selectedUser?.id === u.id ? "text-white" : "text-slate-900"
                          }`}>
                            {u.fullName}
                          </p>
                          <p className={`text-[11px] mt-0.5 truncate ${
                            selectedUser?.id === u.id ? "text-slate-300" : "text-slate-400"
                          }`}>
                            {u.roleName}
                          </p>
                        </div>
                        {selectedUser?.id === u.id && (
                          <ChevronRight size={15} className="text-white shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />
            </>
          )}

          {/* Feedback fields */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                Feedback Title
              </label>
              <Input
                placeholder="Enter a clear, concise title..."
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX_LENGTH))}
              />
              <div className="flex items-center justify-between mt-1.5 px-0.5">
                <p className="text-[11px] text-slate-400">
                  Minimum {TITLE_MIN_LENGTH} characters
                </p>
                <p className={`text-[11px] font-medium ${
                  title.length >= TITLE_MAX_LENGTH ? "text-rose-500" : "text-slate-400"
                }`}>
                  {title.length}/{TITLE_MAX_LENGTH}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                Feedback Description
              </label>
              <textarea
                rows={9}
                placeholder="Write detailed, constructive feedback..."
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX_LENGTH))}
                className="input-field resize-none w-full"
              />
              <div className="flex items-center justify-between mt-1.5 px-0.5">
                <p className="text-[11px] text-slate-400">
                  Minimum {DESC_MIN_LENGTH} characters
                </p>
                <p className={`text-[11px] font-medium ${
                  description.length >= DESC_MAX_LENGTH ? "text-rose-500" : "text-slate-400"
                }`}>
                  {description.length}/{DESC_MAX_LENGTH}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={!selectedUser || title.length < TITLE_MIN_LENGTH || description.length < DESC_MIN_LENGTH}
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TLCreateFeedbackPage;