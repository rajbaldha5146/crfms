import { create } from "zustand";
import type { ProjectCardDto } from "../types/project";
import type { SubmittedFeedbackCardDto } from "../types/feedback";

interface FeedbackState {
  projects: ProjectCardDto[];

  selectedProject: ProjectCardDto | null;

  feedbacks: SubmittedFeedbackCardDto[];

  isLoading: boolean;

  setProjects: (projects: ProjectCardDto[]) => void;

  setSelectedProject: (project: ProjectCardDto) => void;

  setFeedbacks: (feedbacks: SubmittedFeedbackCardDto[]) => void;

  setLoading: (value: boolean) => void;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  projects: [],

  selectedProject: null,

  feedbacks: [],

  isLoading: false,

  setProjects: (projects) => set({ projects }),

  setSelectedProject: (selectedProject) => set({ selectedProject }),

  setFeedbacks: (feedbacks) => set({ feedbacks }),

  setLoading: (isLoading) => set({ isLoading }),
}));