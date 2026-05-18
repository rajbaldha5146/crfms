/* Shared Create Feedback Page
 * Used by: PM, TL, SeniorDeveloper
 * Props:
 *   onSuccessRedirect(projectId, revieweeUserId) -> string  — where to navigate after submit
 */
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Select from "react-select";

import Header from "../layout/Header";
import Input from "../common/Input";
import Button from "../common/Button";

import { createFeedback, getReviewableUsers } from "../../api/feedbackApi";
import { useUIStore } from "../../store/useUIStore";
import { useAuthStore } from "../../store/useAuthStore";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ReviewableUser {
  id: number;
  fullName: string;
  roleName: string;
}

interface SelectOption {
  value: number;
  label: string;
  roleName: string;
}

interface CreateFeedbackPageProps {
  /** Called with resolved projectId and selected revieweeId; must return the redirect path. */
  onSuccessRedirect: (projectId: number, revieweeUserId: number) => string;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const TITLE_MIN = 3;
const TITLE_MAX = 150;
const DESC_MIN = 10;
const DESC_MAX = 2000;

// ── Component ─────────────────────────────────────────────────────────────────
const CreateFeedbackPage = ({ onSuccessRedirect }: CreateFeedbackPageProps) => {
  const { projectId, userId } = useParams();
  const navigate = useNavigate();
  const { showToast, loading: setGlobalLoading } = useUIStore();
  const { user } = useAuthStore();

  // State
  const [allUsers, setAllUsers] = useState<ReviewableUser[]>([]);
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Load reviewable users ────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      setGlobalLoading(true);

      const response = await getReviewableUsers(Number(projectId), "");
      const users: ReviewableUser[] = response.data ?? [];
      setAllUsers(users);

      // Pre-select if userId is in the URL (came from a member card click)
      if (userId) {
        const found = users.find((x) => x.id === Number(userId));
        if (found) {
          setSelectedOption({
            value: found.id,
            label: `${found.fullName} (${found.roleName})`,
            roleName: found.roleName,
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch reviewable users", err);
    } finally {
      setIsLoadingUsers(false);
      setGlobalLoading(false);
    }
  }, [projectId, userId, setGlobalLoading]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ── Build react-select options ───────────────────────────────────────────────
  const userOptions: SelectOption[] = allUsers.map((u) => ({
    value: u.id,
    label: `${u.fullName} (${u.roleName})`,
    roleName: u.roleName,
  }));

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedOption) return showToast("Please select a reviewee", "error");
    if (title.trim().length < TITLE_MIN)
      return showToast(`Title must be at least ${TITLE_MIN} characters`, "error");
    if (description.trim().length < DESC_MIN)
      return showToast(`Description must be at least ${DESC_MIN} characters`, "error");

    try {
      setIsSubmitting(true);
      setGlobalLoading(true);

      await createFeedback({
        projectId: Number(projectId),
        revieweeUserId: selectedOption.value,
        title: title.trim(),
        description: description.trim(),
      });

      showToast("Feedback submitted successfully", "success");
      navigate(onSuccessRedirect(Number(projectId), selectedOption.value));
    } finally {
      setIsSubmitting(false);
      setGlobalLoading(false);
    }
  };

  // Resolve selected user object for context bar display
  const selectedUser = selectedOption
    ? allUsers.find((u) => u.id === selectedOption.value) ?? null
    : null;

  const isFormValid =
    !!selectedOption &&
    title.trim().length >= TITLE_MIN &&
    description.trim().length >= DESC_MIN;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Create Feedback"
        subtitle={
          selectedUser
            ? `Submitting feedback for ${selectedUser.fullName}`
            : "Submit new feedback for a team member"
        }
      />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        {/* ── Context Bar ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:divide-x divide-slate-100">
            {/* Project */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                Project
              </p>
              <p className="text-[14px] font-semibold text-slate-900 leading-snug">
                Code Review System
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
                  <p className="text-[14px] font-semibold text-slate-900">{selectedUser.fullName}</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">{selectedUser.roleName}</p>
                </>
              ) : (
                <p className="text-[13px] text-slate-400 italic">Not selected yet</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Form Card ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">

          {/* ── react-select Reviewee (hidden when userId is fixed via URL) ── */}
          {!userId && (
            <>
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                  Select Reviewee
                </label>
                <Select
                  options={userOptions}
                  value={selectedOption}
                  onChange={(option) => setSelectedOption(option as SelectOption | null)}
                  placeholder="Search and select reviewee..."
                  isLoading={isLoadingUsers}
                  isClearable
                  isDisabled={isLoadingUsers}
                  className="text-[13px]"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="border-t border-slate-100" />
            </>
          )}

          {/* ── Feedback Title ── */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-2">
              Feedback Title
            </label>
            <Input
              placeholder="Enter a clear, concise title..."
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            />
            <div className="flex items-center justify-between mt-1.5 px-0.5">
              <p className="text-[11px] text-slate-400">Minimum {TITLE_MIN} characters</p>
              <p className={`text-[11px] font-medium ${title.length >= TITLE_MAX ? "text-rose-500" : "text-slate-400"}`}>
                {title.length}/{TITLE_MAX}
              </p>
            </div>
          </div>

          {/* ── Feedback Description ── */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-2">
              Feedback Description
            </label>
            <textarea
              rows={9}
              placeholder="Write detailed, constructive feedback. Be specific about what to improve and why..."
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX))}
              className="w-full px-4 py-3 text-[14px] border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 transition-all resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-1.5 px-0.5">
              <p className="text-[11px] text-slate-400">Minimum {DESC_MIN} characters</p>
              <p className={`text-[11px] font-medium ${description.length >= DESC_MAX ? "text-rose-500" : "text-slate-400"}`}>
                {description.length}/{DESC_MAX}
              </p>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={!isFormValid}
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateFeedbackPage;
