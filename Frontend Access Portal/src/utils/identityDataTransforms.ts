
import { type User } from '@/data/mock-users';

export interface EmployeeData {
  id: string;
  name: string;
  employmentType: string;
  email: string;
  manager: string;
  department: string;
  jobTitle: string;
  startDate: string;
  location: string;
  workLocation: string;
  status: string;
  riskLevel: string;
  accessCount: number;
  probationEnd: string | null;
  type: string;
  team: number;
  lastUpdated: string;
  aiAnalysis: string;
  isPrivileged: boolean;
  isOrphan: boolean;
}

export interface RiskyEmployeeData {
  id: string;
  name: string;
  employmentType: string;
  department: string;
  manager: string;
  lastLogin: string;
  riskFactors: string[];
  riskScore: number;
  status: string;
  teamRiskScore: number;
}

export interface LifecycleData {
  id: string;
  name: string;
  type: string;
  currentStage: string;
  progress: number;
  nextAction: string;
  daysInStage: number;
  automationEnabled: boolean;
  workflows: string[];
}

// Transform User to EmployeeData
export function transformUserToEmployee(user: User): EmployeeData {
  return {
    id: user.id,
    name: user.name,
    employmentType: user.type === 'Employee' ? 'Full-Time' : user.type === 'Contractor' ? 'Contract' : 'Other',
    email: `${user.name.toLowerCase().replace(/\s+/g, '.')}.${user.id.slice(-1)}@company.com`,
    manager: user.manager,
    department: user.department,
    jobTitle: getJobTitleFromDepartment(user.department, user.type),
    startDate: getStartDateFromUser(user),
    location: getLocationFromDepartment(user.department),
    workLocation: user.type === 'Service Account' ? 'N/A' : 'Hybrid',
    status: user.status,
    riskLevel: user.riskLevel,
    accessCount: user.access?.length || 0,
    probationEnd: user.status === 'Active' && user.type === 'Employee' ? null : null,
    type: user.type,
    team: user.team,
    lastUpdated: user.lastUpdated,
    aiAnalysis: user.aiAnalysis,
    isPrivileged: user.isPrivileged || false,
    isOrphan: user.isOrphan || false
  };
}

// Transform User to RiskyEmployeeData
export function transformUserToRiskyEmployee(user: User): RiskyEmployeeData {
  const riskScore = user.riskLevel === 'High' ? 85 + Math.floor(Math.random() * 15) : 
                   user.riskLevel === 'Medium' ? 50 + Math.floor(Math.random() * 35) : 
                   20 + Math.floor(Math.random() * 30);
  
  return {
    id: user.id,
    name: user.name,
    employmentType: user.type === 'Employee' ? 'Full-Time' : user.type,
    department: user.department,
    manager: user.manager,
    lastLogin: user.status === 'Suspended' ? 'Never' : getLastLoginFromUser(user),
    riskFactors: user.riskFactors || getRiskFactorsFromUser(user),
    riskScore,
    status: user.riskLevel === 'High' ? 'Critical' : user.riskLevel === 'Medium' ? 'High' : 'Medium',
    teamRiskScore: Math.floor(riskScore * 0.8)
  };
}

// Transform User to LifecycleData
export function transformUserToLifecycle(user: User): LifecycleData {
  const stage = getLifecycleStage(user);
  const progress = getLifecycleProgress(user, stage);
  
  return {
    id: user.id,
    name: user.name,
    type: user.type,
    currentStage: stage,
    progress,
    nextAction: getNextAction(user, stage),
    daysInStage: getDaysInStage(user, stage),
    automationEnabled: user.type !== 'Service Account',
    workflows: getWorkflows(user, stage)
  };
}

// Helper functions
function getJobTitleFromDepartment(department: string, type: string): string {
  if (type === 'Service Account') return 'Service Account';
  
  const titleMap: { [key: string]: string } = {
    'Engineering': 'Software Engineer',
    'Marketing': 'Marketing Specialist',
    'Finance': 'Financial Analyst',
    'HR': 'HR Business Partner',
    'Sales': 'Sales Executive',
    'Backend': 'Backend Developer',
    'Unknown': 'Unknown Role'
  };
  
  return titleMap[department] || 'Employee';
}

function getStartDateFromUser(user: User): string {
  const baseDate = new Date('2024-01-01');
  const randomDays = Math.floor(Math.random() * 365);
  baseDate.setDate(baseDate.getDate() + randomDays);
  return baseDate.toISOString().split('T')[0];
}

function getLocationFromDepartment(department: string): string {
  const locationMap: { [key: string]: string } = {
    'Engineering': 'San Francisco',
    'Marketing': 'New York',
    'Finance': 'Chicago',
    'HR': 'Austin',
    'Sales': 'Boston',
    'Backend': 'Remote',
    'Unknown': 'Unknown'
  };
  
  return locationMap[department] || 'Remote';
}

function getLastLoginFromUser(user: User): string {
  if (user.status === 'Suspended') return 'Never';
  if (user.isOrphan) return '45+ days ago';
  
  const daysAgo = Math.floor(Math.random() * 30) + 1;
  return `${daysAgo} days ago`;
}

function getRiskFactorsFromUser(user: User): string[] {
  const factors: string[] = [];
  
  if (user.isOrphan) factors.push('Orphaned Account');
  if (user.isPrivileged) factors.push('Privileged Access');
  if (user.status === 'Suspended') factors.push('Account Suspended');
  if (user.type === 'Service Account') factors.push('Service Account');
  if (user.manager === 'N/A') factors.push('No Manager');
  
  return factors.length > 0 ? factors : ['Standard Risk Profile'];
}

function getLifecycleStage(user: User): string {
  if (user.status === 'Suspended') return 'disabled';
  if (user.status === 'Stale') return 'expiring';
  if (user.type === 'Service Account') return 'active';
  if (user.isOrphan) return 'terminated';
  
  return 'active';
}

function getLifecycleProgress(user: User, stage: string): number {
  const progressMap: { [key: string]: number } = {
    'invite': 10,
    'approved': 25,
    'provisioned': 50,
    'active': 75,
    'expiring': 90,
    'disabled': 95,
    'terminated': 100
  };
  
  return progressMap[stage] || 50;
}

function getNextAction(user: User, stage: string): string {
  const actionMap: { [key: string]: string } = {
    'invite': 'Approval Required',
    'approved': 'Provision Access',
    'provisioned': 'Activate Account',
    'active': user.riskLevel === 'High' ? 'Risk Review' : 'Periodic Review',
    'expiring': 'Renewal Required',
    'disabled': 'Reactivation Review',
    'terminated': 'Cleanup Required'
  };
  
  return actionMap[stage] || 'No Action Required';
}

function getDaysInStage(user: User, stage: string): number {
  if (stage === 'expiring') return 5;
  if (stage === 'disabled') return 30;
  if (stage === 'terminated') return 60;
  
  return Math.floor(Math.random() * 90) + 1;
}

function getWorkflows(user: User, stage: string): string[] {
  const workflowMap: { [key: string]: string[] } = {
    'invite': ['Invitation Sent', 'Awaiting Response'],
    'approved': ['Manager Approval', 'HR Verification'],
    'provisioned': ['Account Created', 'Access Granted'],
    'active': ['Onboarding Complete', 'Regular Access'],
    'expiring': ['Expiry Warning', 'Renewal Process'],
    'disabled': ['Account Disabled', 'Access Revoked'],
    'terminated': ['Termination Process', 'Cleanup Required']
  };
  
  return workflowMap[stage] || ['Standard Workflow'];
}

// ---------------------------------------------------------------------------
// IdentityDTO → EmployeeData transforms (real API data)
// ---------------------------------------------------------------------------
import { IdentityDTO, attr, displayName as idDisplayName, toDateString, toInstantString } from '@/types/identity';

/**
 * Transforms a backend IdentityDTO into the EmployeeData shape
 * expected by the employee Directory table.
 */
export function identityToEmployee(identity: IdentityDTO): EmployeeData {
  const name = idDisplayName(identity);
  const email = attr(identity, 'email') ?? '';
  const department = attr(identity, 'department') ?? '';
  const jobTitle = attr(identity, 'jobTitle') ?? '';
  const manager = attr(identity, 'managerDisplayName') ?? attr(identity, 'managerRef') ?? '';
  const employeeId = attr(identity, 'employeeId') ?? '';

  const statusMap: Record<string, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Stale',
    SUSPENDED: 'Suspended',
    TERMINATED: 'Terminated',
    PENDING: 'Probation',
    EXPIRED: 'Terminated',
    ARCHIVED: 'Terminated',
  };

  return {
    id: identity.id,
    name,
    employmentType: identity.identityType === 'EMPLOYEE' ? 'Full-Time' :
                    identity.identityType === 'NON_EMPLOYEE' ? 'Contract' : 'Other',
    email,
    manager,
    department,
    jobTitle,
    startDate: attr(identity, 'hireDate') ?? toDateString(identity.createdAt),
    location: attr(identity, 'location') ?? '',
    workLocation: attr(identity, 'workLocation') ?? 'Hybrid',
    status: statusMap[identity.status] ?? identity.status,
    riskLevel: '',
    accessCount: 0,
    probationEnd: identity.status === 'PENDING' ? attr(identity, 'terminationDate') ?? null : null,
    type: identity.identityType === 'EMPLOYEE' ? 'Employee' :
          identity.identityType === 'NON_EMPLOYEE' ? 'Contractor' : 'Service Account',
    team: 0,
    lastUpdated: toInstantString(identity.updatedAt || identity.createdAt),
    aiAnalysis: '',
    isPrivileged: false,
    isOrphan: false,
  };
}
