/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useCallback, useEffect } from "react";
import { getProjectHierarchy } from "../../../api/projectApi";
import type { ProjectHierarchyNodeDto } from "../../../types/projectHierarchy";

interface UseWorkspaceHierarchyResult {
  hierarchy: ProjectHierarchyNodeDto[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useWorkspaceHierarchy = (
  projectId: number
): UseWorkspaceHierarchyResult => {
  const [hierarchy, setHierarchy] = useState<ProjectHierarchyNodeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHierarchy = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getProjectHierarchy(projectId);
      setHierarchy(response);
    } catch (err) {
      setError("Failed to load hierarchy");
      setHierarchy([]);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      loadHierarchy();
    }
  }, [projectId, loadHierarchy]);

  return {
    hierarchy,
    isLoading,
    error,
    refetch: loadHierarchy,
  };
};