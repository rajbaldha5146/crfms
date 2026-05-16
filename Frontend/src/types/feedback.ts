export interface SubmittedFeedbackCardDto {
    id: number;
    projectName: string;
    reviewerName: string;
    revieweeName: string;
    title: string;
    status: string;
    resolutionMessage?: string | null;
    resolutionCreatedAt?: string | null;
    createdAt: string;
  }