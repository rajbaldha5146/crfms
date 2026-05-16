export interface ProjectCardDto {
    id: number;
    name: string;
    description: string;
    status: string;
    totalMembers: number;
    openFeedbackCount: number;
    resolvedFeedbackCount: number;
    lastFeedbackAt?: string | null;
  }