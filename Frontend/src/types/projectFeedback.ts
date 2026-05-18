export interface UserSummaryDto {
  id: number;

  fullName: string;

  roleName: string;

  openFeedbackCount: number;

  resolvedFeedbackCount: number;

  totalFeedbackCount: number;
}

export interface FeedbackCardDto {
  id: number;

  reviewerName: string;

  revieweeName : string;

  projectName?: string;

  title: string;

  status: string;

  createdAt: string;

  resolutionMessage?: string | null;

  resolutionCreatedAt?: string | null;
}

export interface UserProjectFeedbacksDto {
  user: UserSummaryDto;

  feedbacks: FeedbackCardDto[];
}