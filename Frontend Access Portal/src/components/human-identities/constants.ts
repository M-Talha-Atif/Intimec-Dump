
import { 
  UserPlus, 
  Building, 
  Shield, 
  CheckCircle, 
  Users, 
  Calendar, 
  AlertTriangle, 
  Clock,
  Play,
  Pause,
  UserCheck,
  UserX,
  FileCheck,
  BookOpen,
  TrendingUp,
  Target,
  Award
} from 'lucide-react';

export const employeeIdentityWizardSteps = [
  { id: 'basic', name: 'Basic Information', icon: UserPlus },
  { id: 'employment', name: 'Employment Details', icon: Building },
  { id: 'access', name: 'Access Planning', icon: Shield },
  { id: 'review', name: 'Review & Submit', icon: CheckCircle }
];

export const employeeLifecycleStages = [
  { id: 'pre-hire', name: 'Pre-Hire', icon: UserPlus, color: 'bg-blue-500', description: 'Offer accepted, pending start' },
  { id: 'onboarding', name: 'Onboarding', icon: BookOpen, color: 'bg-orange-500', description: 'First day to full productivity' },
  { id: 'active', name: 'Active', icon: Play, color: 'bg-green-500', description: 'Fully productive employee' },
  { id: 'probation', name: 'Probation', icon: Clock, color: 'bg-yellow-500', description: 'Probationary period' },
  { id: 'on-leave', name: 'On Leave', icon: Pause, color: 'bg-purple-500', description: 'Temporary leave of absence' },
  { id: 'terminating', name: 'Terminating', icon: UserX, color: 'bg-red-500', description: 'Notice given, offboarding in progress' },
  { id: 'terminated', name: 'Terminated', icon: UserX, color: 'bg-gray-500', description: 'Employment ended, access revoked' }
];

export const employmentTypes = [
  { value: 'full-time', label: 'Full-Time Employee' },
  { value: 'part-time', label: 'Part-Time Employee' },
  { value: 'temporary', label: 'Temporary Employee' },
  { value: 'intern', label: 'Intern' },
  { value: 'consultant', label: 'Internal Consultant' }
];

export const jobLevels = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'principal', label: 'Principal' },
  { value: 'director', label: 'Director' },
  { value: 'vp', label: 'Vice President' },
  { value: 'c-level', label: 'C-Level' }
];

export const workLocations = [
  { value: 'on-site', label: 'On-Site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' }
];

export const leaveStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'medical-leave', label: 'Medical Leave' },
  { value: 'parental-leave', label: 'Parental Leave' },
  { value: 'sabbatical', label: 'Sabbatical' },
  { value: 'unpaid-leave', label: 'Unpaid Leave' }
];

export const managerKPIs = [
  { id: 'active-reports', label: 'Active Reports', icon: Users, color: 'text-blue-600' },
  { id: 'pending-terminations', label: 'Pending Terminations', icon: Calendar, color: 'text-orange-600' },
  { id: 'overdue-reviews', label: 'Overdue Reviews', icon: Clock, color: 'text-red-600' },
  { id: 'orphan-accounts', label: 'Orphan Accounts', icon: UserX, color: 'text-gray-600' },
  { id: 'team-risk-score', label: 'Team Risk Score', icon: TrendingUp, color: 'text-purple-600' }
];

export const riskFactors = [
  'Excessive privileged access',
  'Access drift from team norm',
  'SoD violations detected',
  'No login in 60+ days',
  'Orphaned account (no HR match)',
  'Cross-departmental reporting anomaly',
  'Pending access review',
  'Unused entitlements',
  'High-risk application access'
];
