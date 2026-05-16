import type { SetStateAction } from "react";

export interface HierarchyNodeDto {
    data: SetStateAction<HierarchyNodeDto>;
    userId: number;
    fullName: string;
    role: string;
  
    reportingPersonId: number | null;
    reportingPersonName: string | null;
  
    children: HierarchyNodeDto[];
  }