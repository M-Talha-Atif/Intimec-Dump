// Comprehensive SoD Policy Type Definitions

export type PolicyStatus = 'active' | 'draft' | 'inactive' | 'archived';
export type EnforcementMode = 'preventive' | 'detective' | 'advisory';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ViolationStatus = 'open' | 'in_review' | 'in_remediation' | 'resolved' | 'exception_approved' | 'escalated';
export type RemediationAction = 'remove_role' | 'remove_entitlement' | 'approve_exception' | 'manual_review' | 'auto_resolved';
export type ConflictType = 'role-role' | 'entitlement-entitlement' | 'role-entitlement' | 'app-role' | 'custom';

export interface PolicyCondition {
  id: string;
  type: 'role' | 'entitlement' | 'group' | 'application' | 'department' | 'attribute';
  operator: 'AND' | 'OR';
  value: string;
  negation: boolean;
  metadata?: Record<string, any>;
}

export interface PolicyVersion {
  version: number;
  timestamp: string;
  changes: string[];
  changedBy: string;
  changeReason?: string;
  rollbackable: boolean;
  snapshotData: any;
}

export interface ComplianceMapping {
  framework: string;
  controlId: string;
  description: string;
  required: boolean;
}

export interface PolicyApproval {
  id: string;
  approver: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  comments?: string;
}

export interface SoDPolicy {
  id: string;
  name: string;
  description: string;
  businessJustification: string;
  status: PolicyStatus;
  
  // Policy Definition
  conflictType: ConflictType;
  conditions: PolicyCondition[];
  enforcementMode: EnforcementMode;
  riskLevel: RiskLevel;
  
  // Compliance & Governance
  complianceFrameworks: ComplianceMapping[];
  tags: string[];
  category: string;
  
  // Lifecycle
  createdBy: string;
  createdDate: string;
  lastModifiedBy: string;
  lastModified: string;
  lastReviewed?: string;
  nextReviewDate?: string;
  
  // Versioning
  version: number;
  versions: PolicyVersion[];
  
  // Approvals
  requiresApproval: boolean;
  approvals: PolicyApproval[];
  
  // Metrics
  violationCount: number;
  exceptionCount: number;
  affectedUsers: number;
  lastViolationDate?: string;
  
  // Settings
  autoResolution: boolean;
  autoResolutionRules?: string[];
  notificationEnabled: boolean;
  escalationPath?: string[];
  
  // Custom fields
  customFields?: Record<string, any>;
}

export interface ViolationDetail {
  id: string;
  policyId: string;
  policyName: string;
  
  // Violation Info
  userId: string;
  userName: string;
  userEmail: string;
  userDepartment: string;
  userManager: string;
  
  // Conflict Details
  conflictingRoles: string[];
  conflictingEntitlements: string[];
  conflictingApplications: string[];
  conflictPath: string[];
  
  // Status & Priority
  status: ViolationStatus;
  severity: RiskLevel;
  riskScore: number;
  priority: number;
  
  // Timeline
  detectedDate: string;
  detectedBy: string;
  firstDetectedDate: string;
  lastCheckedDate: string;
  
  // Resolution
  assignedTo?: string;
  dueDate?: string;
  sla?: {
    target: number;
    remaining: number;
    breached: boolean;
  };
  
  // Actions & History
  remediationActions: RemediationAction[];
  comments: ViolationComment[];
  history: ViolationHistoryEntry[];
  
  // Business Context
  businessImpact: string;
  affectedSystems: string[];
  dataClassification: string[];
  
  // Exception
  hasException: boolean;
  exceptionId?: string;
  
  // Metadata
  metadata?: Record<string, any>;
}

export interface ViolationComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  timestamp: string;
  attachments?: string[];
}

export interface ViolationHistoryEntry {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
  previousState?: any;
  newState?: any;
}

export interface PolicyException {
  id: string;
  violationId: string;
  policyId: string;
  policyName: string;
  
  // User Info
  userId: string;
  userName: string;
  userEmail: string;
  userDepartment: string;
  
  // Exception Details
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'revoked';
  justification: string;
  businessReason: string;
  compensatingControls: string[];
  
  // Approval Chain
  requestedBy: string;
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  
  // Lifecycle
  effectiveDate: string;
  expiryDate: string;
  autoRenew: boolean;
  renewalCount: number;
  
  // Review
  lastReviewDate?: string;
  nextReviewDate: string;
  reviewFrequency: number; // days
  
  // Risk Management
  riskLevel: RiskLevel;
  mitigationPlan: string;
  monitoringRequired: boolean;
  
  // Metadata
  attachments?: string[];
  comments: ViolationComment[];
  metadata?: Record<string, any>;
}

export interface ConflictMatrixCell {
  row: string;
  column: string;
  status: 'no_conflict' | 'conflict' | 'exception' | 'unknown';
  violationCount: number;
  exceptionCount: number;
  policyIds: string[];
  riskLevel?: RiskLevel;
}

export interface SoDAnalytics {
  // Overview Metrics
  totalPolicies: number;
  activePolicies: number;
  totalViolations: number;
  activeViolations: number;
  resolvedViolations: number;
  totalExceptions: number;
  activeExceptions: number;
  
  // Risk Metrics
  criticalViolations: number;
  highRiskViolations: number;
  averageRiskScore: number;
  riskTrend: 'improving' | 'stable' | 'degrading';
  
  // Performance Metrics
  averageResolutionTime: number; // days
  violationsResolvedThisMonth: number;
  violationDetectionRate: number;
  complianceScore: number; // percentage
  
  // Trends
  violationTrend: Array<{
    period: string;
    count: number;
    resolved: number;
  }>;
  
  policyEffectiveness: Array<{
    policyId: string;
    policyName: string;
    violationCount: number;
    avgResolutionTime: number;
    effectiveness: number;
  }>;
  
  // Top Issues
  topViolatedPolicies: Array<{
    policyId: string;
    policyName: string;
    count: number;
  }>;
  
  topConflictedRoles: Array<{
    roleId: string;
    roleName: string;
    conflictCount: number;
    affectedUsers: number;
  }>;
  
  topRiskyUsers: Array<{
    userId: string;
    userName: string;
    violationCount: number;
    riskScore: number;
  }>;
}

export interface AIRecommendation {
  id: string;
  type: 'policy_suggestion' | 'violation_prediction' | 'remediation_path' | 'risk_alert';
  title: string;
  description: string;
  confidence: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggestedAction: string;
  impact: string;
  relatedPolicies?: string[];
  relatedViolations?: string[];
  timestamp: string;
  status: 'new' | 'reviewed' | 'implemented' | 'dismissed';
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  userId?: string;
  rolesToAdd: string[];
  rolesToRemove: string[];
  entitlementsToAdd: string[];
  entitlementsToRemove: string[];
  timestamp: string;
}

export interface SimulationResult {
  scenarioId: string;
  status: 'safe' | 'conflict' | 'warning';
  conflictCount: number;
  conflicts: Array<{
    policyId: string;
    policyName: string;
    severity: RiskLevel;
    description: string;
    conflictingItems: string[];
  }>;
  riskScore: number;
  recommendations: string[];
  alternativePaths: Array<{
    description: string;
    changes: string[];
    riskScore: number;
  }>;
}

export interface BulkOperation {
  id: string;
  type: 'remediate' | 'approve_exception' | 'resolve' | 'assign' | 'export';
  items: string[]; // IDs of policies/violations
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdBy: string;
  createdDate: string;
  completedDate?: string;
  results?: {
    successful: number;
    failed: number;
    errors?: string[];
  };
}

export interface NotificationRule {
  id: string;
  name: string;
  enabled: boolean;
  triggers: Array<'violation_detected' | 'exception_expiring' | 'sla_breach' | 'policy_changed'>;
  conditions: Record<string, any>;
  channels: Array<'email' | 'slack' | 'teams' | 'webhook'>;
  recipients: string[];
  template: string;
}
