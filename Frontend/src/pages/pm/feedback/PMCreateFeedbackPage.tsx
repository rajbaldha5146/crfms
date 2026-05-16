/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

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

const PMCreateFeedbackPage = () => {
  const { projectId, userId } = useParams();
  const navigate = useNavigate();
  const { showToast, loading: setGlobalLoading } = useUIStore();
  const { user } = useAuthStore();

  // Form State
  const [reviewableUsers, setReviewableUsers] = useState<ReviewableUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ReviewableUser | null>(null);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // UI State
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Constants
  const TITLE_MIN_LENGTH = 3;
  const TITLE_MAX_LENGTH = 150;
  const DESC_MIN_LENGTH = 10;
  const DESC_MAX_LENGTH = 2000;

  // Click Outside Listener to close autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load Users from API
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

        // Pre-select user if userId is in URL
        if (isInitial && userId) {
          const foundUser = response.data.find(
            (x: ReviewableUser) => x.id === Number(userId)
          );
          if (foundUser) {
            setSelectedUser(foundUser);
            setSearch(foundUser.fullName);
          }
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setIsLoadingUsers(false);
        setGlobalLoading(false);
      }
    },
    [projectId, userId, setGlobalLoading]
  );

  // Initial Load
  useEffect(() => {
    loadUsers("", true);
  }, [loadUsers]);

  // Search Debounce Logic
  useEffect(() => {
    if (userId) return; // Don't search if we already have a fixed user from URL
    
    const timeout = setTimeout(() => {
      if (isDropdownOpen) loadUsers(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, userId, loadUsers, isDropdownOpen]);

  const handleSelectUser = (u: ReviewableUser) => {
    setSelectedUser(u);
    setSearch(u.fullName);
    setIsDropdownOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    setIsDropdownOpen(true);
    if (selectedUser && val !== selectedUser.fullName) {
      setSelectedUser(null); // Deselect if user starts typing again
    }
  };

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
      navigate(`/pm-projects/${projectId}/users/${selectedUser.id}`);
    } finally {
      setIsSubmitting(false);
      setGlobalLoading(false);
    }
  };

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
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        {/* Context Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:divide-x divide-slate-100">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Project</p>
              <p className="text-[14px] font-semibold text-slate-900 leading-snug">Code Review System</p>
            </div>
            <div className="md:pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Reviewer</p>
              <p className="text-[14px] font-semibold text-slate-900">{user?.name}</p>
              <p className="text-[12px] text-slate-400 mt-0.5">{user?.role}</p>
            </div>
            <div className="md:pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Reviewee</p>
              {selectedUser ? (
                <div>
                  <p className="text-[14px] font-semibold text-slate-900">{selectedUser.fullName}</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">{selectedUser.roleName}</p>
                </div>
              ) : (
                <p className="text-[13px] text-slate-400 italic">Not selected yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          
          {/* Autocomplete Selector */}
          {!userId && (
            <div className="relative" ref={autocompleteRef}>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                Select Reviewee
              </label>
              
              <div className="relative">
                <Input
                  placeholder="Type to search employee..."
                  value={search}
                  onChange={handleInputChange}
                  onFocus={() => setIsDropdownOpen(true)}
                  className={selectedUser ? "border-green-200 bg-green-50/30" : ""}
                />
                
                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                    {isLoadingUsers ? (
                      <div className="p-4 text-center text-slate-400 text-xs">Searching...</div>
                    ) : reviewableUsers.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs">No users found for "{search}"</div>
                    ) : (
                      reviewableUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleSelectUser(u)}
                          className={`w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 transition-colors flex items-center justify-between hover:bg-slate-50 ${
                            selectedUser?.id === u.id ? "bg-slate-900 text-white hover:bg-slate-800" : ""
                          }`}
                        >
                          <div>
                            <p className={`text-[13px] font-semibold ${selectedUser?.id === u.id ? "text-white" : "text-slate-900"}`}>
                              {u.fullName}
                            </p>
                            <p className={`text-[11px] ${selectedUser?.id === u.id ? "text-slate-300" : "text-slate-400"}`}>
                              {u.roleName}
                            </p>
                          </div>
                          {selectedUser?.id === u.id && <Check size={16} className="text-white" />}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Title Input */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">Feedback Title</label>
              <Input
                placeholder="Enter a clear title..."
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX_LENGTH))}
              />
              <div className="flex justify-between mt-1 px-1">
                <p className="text-[10px] text-slate-400">Min {TITLE_MIN_LENGTH} chars</p>
                <p className={`text-[10px] ${title.length >= TITLE_MAX_LENGTH ? "text-rose-500" : "text-slate-400"}`}>
                  {title.length}/{TITLE_MAX_LENGTH}
                </p>
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">Feedback Description</label>
              <textarea
                rows={8}
                placeholder="Write detailed, constructive feedback..."
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX_LENGTH))}
                className="w-full p-3 text-[14px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all resize-none"
              />
              <div className="flex justify-between mt-1 px-1">
                <p className="text-[10px] text-slate-400">Min {DESC_MIN_LENGTH} chars</p>
                <p className={`text-[10px] ${description.length >= DESC_MAX_LENGTH ? "text-rose-500" : "text-slate-400"}`}>
                  {description.length}/{DESC_MAX_LENGTH}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
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

export default PMCreateFeedbackPage;