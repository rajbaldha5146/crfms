export interface PmUserDetailsDto {
    userId: number;
  
    fullName: string;
  
    email: string;
  
    role: string;
  
    department: string;
  
    experience: string;
  
    mobileNumber: string;
  
    status: string;
  
    reportingPersonId: number | null;
  
    reportingPersonName: string | null;
  }