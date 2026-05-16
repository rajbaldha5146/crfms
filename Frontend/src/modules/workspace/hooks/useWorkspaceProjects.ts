/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback, useEffect } from "react";
import { getMyProjectCards } from "../../../api/projectApi";
import type { ProjectCardDto } from "../../../types/project";

interface UseWorkspaceProjectsResult {
  projects: ProjectCardDto[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useWorkspaceProjects = (): UseWorkspaceProjectsResult => {
  const [projects, setProjects] = useState<ProjectCardDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getMyProjectCards();
      setProjects(response.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to load projects");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    isLoading,
    error,
    refetch: loadProjects,
  };
};