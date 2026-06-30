
export interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  type?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  sponsor?: string;
  fallbackSponsor?: string;
  department?: string;
  justification?: string;
  workLocation?: string;
  contractorId?: string;
}

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  company: string;
  startDate: string;
  endDate: string;
  sponsor: string;
  fallbackSponsor: string;
  department: string;
  justification: string;
  accessRequests: any[];
  workLocation: string;
  contractorId: string;
}
