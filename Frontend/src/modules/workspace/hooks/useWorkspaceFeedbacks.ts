import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { FeedbackCardDto } from "../../../types/projectFeedback";

interface UseWorkspaceFeedbacksOptions {
  fetchFn: (status?: string) => Promise<{ data: FeedbackCardDto[] }>;
}

interface UseWorkspaceFeedbacksResult {
  feedbacks: FeedbackCardDto[];
  isLoading: boolean;
  activeTab: "open" | "resolved";
  openCount: number;
  resolvedCount: number;
  setActiveTab: (tab: "open" | "resolved") => void;
  refetch: () => Promise<void>;
}

export const useWorkspaceFeedbacks = (
  options: UseWorkspaceFeedbacksOptions
): UseWorkspaceFeedbacksResult => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("status") ?? "open") as "open" | "resolved";

  // Cache: holds ALL feedbacks (open + resolved) after first load
  const allFeedbacksRef = useRef<FeedbackCardDto[]>([]);

  const [feedbacks, setFeedbacks] = useState<FeedbackCardDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  // Filter from cache whenever tab changes — zero extra API calls
  const applyFilter = useCallback((tab: "open" | "resolved") => {
    const filtered = allFeedbacksRef.current.filter(
      (f) => f.status.toLowerCase() === tab
    );
    setFeedbacks(filtered);
  }, []);

  // Initial load: ONE call with no status filter to get everything
  const loadFeedbacks = useCallback(async () => {
    try {
      setIsLoading(true);

      // Single API call — no status param → backend returns all
      const response = await options.fetchFn(undefined);
      const all = response.data;

      allFeedbacksRef.current = all;

      setOpenCount(all.filter((f) => f.status.toLowerCase() === "open").length);
      setResolvedCount(all.filter((f) => f.status.toLowerCase() === "resolved").length);

      // Apply current tab filter from cache
      setFeedbacks(all.filter((f) => f.status.toLowerCase() === activeTab));
    } finally {
      setIsLoading(false);
    }
  }, [options, activeTab]);

  // On mount: fetch once
  useEffect(() => {
    loadFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally only on mount

  // On tab change: filter from cache, no fetch
  useEffect(() => {
    if (allFeedbacksRef.current.length > 0) {
      applyFilter(activeTab);
    }
  }, [activeTab, applyFilter]);

  const setActiveTab = useCallback(
    (tab: "open" | "resolved") => {
      setSearchParams({ status: tab });
    },
    [setSearchParams]
  );

  return {
    feedbacks,
    isLoading,
    activeTab,
    openCount,
    resolvedCount,
    setActiveTab,
    refetch: loadFeedbacks,
  };
};