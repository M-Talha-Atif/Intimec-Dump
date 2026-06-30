export interface EmployeeIdentityFormData {
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  employmentType: string;
  department: string;
  manager: string;
  dotLineManager?: string;
  startDate: string;
  probationEnd: string;
  location: string;
  costCenter: string;
  jobTitle: string;
  jobLevel: string;
  workLocation: string;
  leaveStatus: string;
  terminationDate?: string;
  accessRequests: any[];
}

export interface EmployeeIdentityValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  employeeId?: string;
  employmentType?: string;
  department?: string;
  manager?: string;
  startDate?: string;
  probationEnd?: string;
  location?: string;
  costCenter?: string;
  jobTitle?: string;
  jobLevel?: string;
  workLocation?: string;
}

export interface LifecycleStage {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  milestones?: LifecycleMilestone[];
}

export interface LifecycleMilestone {
  id: string;
  name: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  assignee: string;
  dueDate: string;
  completedDate?: string;
  description: string;
}

export interface AccessRiskAssessment {
  userId: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  sodViolations: number;
  dormantEntitlements: number;
  crossDepartmentAccess: number;
  peerDeviationScore: number;
  privilegedAccessCount: number;
  lastReviewDate: string;
}

export interface ReviewCampaign {
  id: string;
  name: string;
  type: 'Quarterly' | 'Annual' | 'Ad-hoc' | 'Transfer' | 'Promotion' | 'Exit';
  status: 'Active' | 'Pending' | 'Completed' | 'Overdue';
  assignedTo: string;
  employeeCount: number;
  completionPercentage: number;
  dueDate: string;
  createdDate: string;
  priority: 'Low' | 'Medium' | 'High';
}

export interface OnboardingProgress {
  employeeId: string;
  overallCompletion: number;
  milestones: {
    hrPaperwork: { status: 'Pending' | 'Completed'; completedDate?: string };
    activeDirectory: { status: 'Pending' | 'Completed'; completedDate?: string };
    email: { status: 'Pending' | 'Completed'; completedDate?: string };
    badge: { status: 'Pending' | 'Completed'; completedDate?: string };
    equipment: { status: 'Pending' | 'Completed'; completedDate?: string };
    training: { status: 'Pending' | 'Completed'; completedDate?: string };
    systemAccess: { status: 'Pending' | 'Completed'; completedDate?: string };
  };
  startDate: string;
  targetCompletionDate: string;
}

export interface EmployeeIdentityStats {
  label: string;
  value: string;
  trend: string;
  color: string;
  icon: any;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Temporary' | 'Intern' | 'Consultant';
  department: string;
  manager: string;
  dotLineManager?: string;
  jobTitle: string;
  jobLevel: string;
  startDate: string;
  location: string;
  workLocation: 'On-Site' | 'Remote' | 'Hybrid';
  status: 'Active' | 'Probation' | 'On Leave' | 'Terminating' | 'Terminated';
  riskLevel: 'Low' | 'Medium' | 'High';
  accessCount: number;
  probationEnd?: string;
  terminationDate?: string;
  lastLogin?: string;
  riskFactors?: string[];
  teamRiskScore?: number;
  directReports?: Employee[];
  lifecycleStage: string;
}

export interface ManagerDashboardData {
  activeReports: number;
  pendingTerminations: number;
  overdueReviews: number;
  orphanAccounts: number;
  teamRiskScore: number;
  accessRisks: {
    userId: string;
    userName: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    riskFactors: string[];
  }[];
}

export interface TeamAccessAnalysis {
  teamId: string;
  teamName: string;
  averageAccess: number;
  accessDeviation: {
    userId: string;
    userName: string;
    deviationType: 'Over' | 'Under';
    variance: number;
  }[];
}

export interface DelegationConfig {
  delegateId: string;
  delegateName: string;
  startDate: string;
  endDate: string;
  permissions: string[];
  isActive: boolean;
}

export interface EscalationRule {
  id: string;
  name: string;
  triggerCondition: string;
  escalationChain: string[];
  slaHours: number;
  isActive: boolean;
}

export interface TeamRiskMetrics {
  privilegedAccessPercent: number;
  peerAnomalies: number;
  sodConflictRate: number;
  reviewDelays: number;
  overallScore: number;
}
