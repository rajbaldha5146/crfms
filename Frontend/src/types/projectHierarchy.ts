export interface ProjectHierarchyNodeDto {
  userId: number;

  fullName: string;

  roleName: string;

  openFeedbackCount: number;

  resolvedFeedbackCount: number;
  
  reportingPersonId: number;

  reportingPersonName: string;

  children: ProjectHierarchyNodeDto[];
}
