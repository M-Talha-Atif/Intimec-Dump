// Comprehensive Access Review Type Definitions

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'user-based' | 'role-based' | 'application-based' | 'entitlement-based' | 'sod-based' | 'event-driven' | 'hybrid' | 'continuous' | 'risk-based';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  totalItems: number;
  completedItems: number;
  dueDate: string;
  createdDate: string;
  createdBy: string;
  complianceFrameworks: string[];
  reviewers: CampaignReviewer[];
  configuration: CampaignConfiguration;
}

export interface CampaignConfiguration {
  slaHours: number;
  notificationChannels: ('email' | 'slack' | 'teams' | 'in-app')[];
  preReviewSimulation: boolean;
  autoReminder: boolean;
  reminderFrequency: number;
  escalationEnabled: boolean;
  escalationAfterHours: number;
  requireJustification: boolean;
  allowBulkActions: boolean;
  enableAIAssist: boolean;
  confidenceThreshold: number;
}

export interface CampaignReviewer {
  id: string;
  userId: string;
  name: string;
  email: string;
  assignedDate: string;
  assignedBy: string;
  itemsAssigned: number;
  itemsCompleted: number;
  status: 'assigned' | 'accepted' | 'in-progress' | 'completed' | 'delegated';
  delegatedTo?: string;
  averageDecisionTime: number;
}

export interface ReviewItem {
  id: string;
  campaignId: string;
  itemType: 'user' | 'role' | 'entitlement' | 'application';
  userId?: string;
  userName?: string;
  userEmail?: string;
  userDepartment?: string;
  userJobTitle?: string;
  userManager?: string;
  roleId?: string;
  roleName?: string;
  applicationId?: string;
  applicationName?: string;
  entitlements: Entitlement[];
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  sodViolations: SoDViolation[];
  assignedReviewer: string;
  reviewerName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'escalated';
  dueDate: string;
  lastActivity?: string;
  aiSuggestion?: AISuggestion;
  accessAnalytics?: AccessAnalytics;
  peerComparison?: PeerComparison;
  attestationHistory?: AttestationRecord[];
  comments?: ReviewComment[];
}

export interface Entitlement {
  id: string;
  name: string;
  type: string;
  application: string;
  grantDate: string;
  lastUsed?: string;
  usageCount: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  isPII: boolean;
  isSensitive: boolean;
  businessJustification?: string;
  expiryDate?: string;
}

export interface SoDViolation {
  id: string;
  policyName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  conflictingEntitlements: string[];
  description: string;
  detectedDate: string;
}

export interface AISuggestion {
  action: 'approve' | 'revoke' | 'modify' | 'review';
  confidence: number;
  reasoning: string;
  riskAssessment: string;
  alternativeActions?: string[];
  detectedAnomalies?: string[];
}

export interface AccessAnalytics {
  lastLogin: string;
  loginFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';
  averageSessionDuration: number;
  totalSessions: number;
  unusedEntitlements: string[];
  usagePattern: UsagePattern[];
  anomalyScore: number;
}

export interface UsagePattern {
  date: string;
  loginCount: number;
  duration: number;
  activityLevel: 'low' | 'medium' | 'high';
}

export interface PeerComparison {
  similarUsers: PeerUser[];
  commonEntitlements: string[];
  uniqueEntitlements: string[];
  missingEntitlements: string[];
  recommendedRole?: string;
}

export interface PeerUser {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  matchScore: number;
  entitlements: string[];
}

export interface ReviewDecision {
  id: string;
  reviewItemId: string;
  campaignId: string;
  reviewerId: string;
  reviewerName: string;
  decision: 'approve' | 'revoke' | 'modify' | 'exception';
  justification: string;
  decidedAt: string;
  aiAccepted: boolean;
  entitlementDecisions?: EntitlementDecision[];
  exceptionDetails?: ExceptionDetails;
  remediationStatus?: RemediationStatus;
}

export interface EntitlementDecision {
  entitlementId: string;
  entitlementName: string;
  action: 'keep' | 'revoke' | 'reduce-scope';
  reason: string;
}

export interface ExceptionDetails {
  expiryDate: string;
  reason: string;
  approver: string;
  reviewFrequency: 'weekly' | 'monthly' | 'quarterly';
}

export interface RemediationStatus {
  id: string;
  status: 'queued' | 'in-progress' | 'completed' | 'failed' | 'requires-manual';
  startedAt?: string;
  completedAt?: string;
  executedBy?: string;
  errorMessage?: string;
  actions: RemediationAction[];
}

export interface RemediationAction {
  id: string;
  type: 'deprovision' | 'reduce-access' | 'notify' | 'flag';
  target: string;
  status: 'pending' | 'completed' | 'failed';
  result?: string;
}

export interface AttestationRecord {
  id: string;
  campaignId: string;
  campaignName: string;
  reviewDate: string;
  reviewer: string;
  decision: 'approve' | 'revoke' | 'modify';
  justification: string;
}

export interface ReviewComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
  mentions?: string[];
  attachments?: string[];
}

export interface ReviewTemplate {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  decision: 'approve' | 'revoke' | 'modify';
  justification: string;
  applicableFor: {
    departments?: string[];
    jobTitles?: string[];
    riskLevels?: string[];
  };
  usageCount: number;
}

export interface NotificationConfig {
  id: string;
  campaignId: string;
  type: 'reminder' | 'escalation' | 'completion' | 'overdue';
  channels: ('email' | 'slack' | 'teams' | 'in-app')[];
  recipients: string[];
  schedule: string;
  lastSent?: string;
  enabled: boolean;
}

export interface ComplianceReport {
  id: string;
  name: string;
  framework: 'SOX' | 'GDPR' | 'HIPAA' | 'ISO27001' | 'PCI-DSS' | 'Custom';
  generatedAt: string;
  generatedBy: string;
  period: {
    start: string;
    end: string;
  };
  campaigns: string[];
  metrics: ComplianceMetrics;
  evidence: EvidenceItem[];
}

export interface ComplianceMetrics {
  totalReviews: number;
  completedReviews: number;
  approvalRate: number;
  revocationRate: number;
  averageCompletionTime: number;
  sodViolationsResolved: number;
  highRiskItemsReviewed: number;
  complianceScore: number;
}

export interface EvidenceItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  reviewer: string;
  reference: string;
}

export interface ExecutiveMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalReviews: number;
  avgCompletionTime: number;
  riskReduction: number;
  complianceScore: number;
  topReviewers: ReviewerPerformance[];
  riskTrends: RiskTrend[];
  campaignEffectiveness: CampaignEffectiveness[];
}

export interface ReviewerPerformance {
  reviewerId: string;
  reviewerName: string;
  reviewsCompleted: number;
  avgDecisionTime: number;
  accuracyScore: number;
  aiAcceptanceRate: number;
}

export interface RiskTrend {
  date: string;
  highRiskItems: number;
  mediumRiskItems: number;
  lowRiskItems: number;
  totalRisk: number;
}

export interface CampaignEffectiveness {
  campaignId: string;
  campaignName: string;
  riskBefore: number;
  riskAfter: number;
  riskReduction: number;
  itemsReviewed: number;
  itemsRevoked: number;
  timeTaken: number;
}

export interface IntegrationStatus {
  system: string;
  type: 'provisioning' | 'identity' | 'hr' | 'access-request' | 'role-management';
  status: 'connected' | 'disconnected' | 'error' | 'not-configured';
  lastSync?: string;
  health: 'healthy' | 'degraded' | 'down';
  capabilities: string[];
}

export interface RoleMiningResult {
  id: string;
  suggestedRoleName: string;
  confidence: number;
  commonEntitlements: string[];
  affectedUsers: string[];
  potentialMembers: number;
  riskLevel: 'low' | 'medium' | 'high';
  businessJustification: string;
}
