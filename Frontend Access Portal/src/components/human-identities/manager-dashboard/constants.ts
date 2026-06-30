
import { type ManagerDashboardData, type Employee } from '../types';

export const mockManagerData: ManagerDashboardData = {
  activeReports: 12,
  pendingTerminations: 2,
  overdueReviews: 5,
  orphanAccounts: 1,
  teamRiskScore: 65,
  accessRisks: [
    {
      userId: 'emp_1',
      userName: 'Sarah Johnson',
      riskLevel: 'High',
      riskFactors: ['Excessive privileged access', 'SoD violations detected']
    },
    {
      userId: 'emp_2',
      userName: 'Mike Chen',
      riskLevel: 'Medium',
      riskFactors: ['Access drift from team norm']
    }
  ]
};

export const mockTeamHierarchy: Employee[] = [
  {
    id: 'mgr_1',
    name: 'David Kim',
    email: 'david.kim@company.com',
    employeeId: 'EMP001',
    employmentType: 'Full-Time',
    department: 'Engineering',
    manager: 'CTO',
    jobTitle: 'Engineering Manager',
    jobLevel: 'director',
    startDate: '2022-01-01',
    location: 'New York',
    workLocation: 'Hybrid',
    status: 'Active',
    riskLevel: 'Low',
    accessCount: 35,
    lifecycleStage: 'active',
    directReports: [
      {
        id: 'emp_1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        employeeId: 'EMP002',
        employmentType: 'Full-Time',
        department: 'Engineering',
        manager: 'David Kim',
        jobTitle: 'Senior Software Engineer',
        jobLevel: 'senior',
        startDate: '2023-01-15',
        location: 'New York',
        workLocation: 'Hybrid',
        status: 'Active',
        riskLevel: 'Low',
        accessCount: 24,
        lifecycleStage: 'active'
      },
      {
        id: 'emp_3',
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        employeeId: 'EMP003',
        employmentType: 'Intern',
        department: 'Engineering',
        manager: 'David Kim',
        jobTitle: 'Software Engineering Intern',
        jobLevel: 'entry',
        startDate: '2024-06-01',
        location: 'New York',
        workLocation: 'On-Site',
        status: 'Active',
        riskLevel: 'Low',
        accessCount: 8,
        lifecycleStage: 'onboarding'
      }
    ]
  }
];
