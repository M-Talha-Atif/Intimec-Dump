import type { 
  Campaign, 
  ReviewItem, 
  ReviewDecision,
  ReviewTemplate,
  ComplianceReport,
  ExecutiveMetrics,
  IntegrationStatus,
  RoleMiningResult,
  NotificationConfig
} from '@/types/accessReview';

// Mock Users Database
export const mockUsers = [
  { id: 'u1', name: 'John Smith', email: 'john.smith@company.com', department: 'Engineering', jobTitle: 'Senior Developer', manager: 'Sarah Johnson' },
  { id: 'u2', name: 'Emily Davis', email: 'emily.davis@company.com', department: 'Finance', jobTitle: 'Financial Analyst', manager: 'Michael Brown' },
  { id: 'u3', name: 'Michael Chen', email: 'michael.chen@company.com', department: 'Engineering', jobTitle: 'DevOps Engineer', manager: 'Sarah Johnson' },
  { id: 'u4', name: 'Sarah Wilson', email: 'sarah.wilson@company.com', department: 'HR', jobTitle: 'HR Manager', manager: 'David Lee' },
  { id: 'u5', name: 'David Martinez', email: 'david.martinez@company.com', department: 'Sales', jobTitle: 'Sales Director', manager: 'Lisa Anderson' },
  { id: 'u6', name: 'Lisa Taylor', email: 'lisa.taylor@company.com', department: 'Engineering', jobTitle: 'Junior Developer', manager: 'Sarah Johnson' },
  { id: 'u7', name: 'James Anderson', email: 'james.anderson@company.com', department: 'IT', jobTitle: 'System Administrator', manager: 'Robert Clark' },
  { id: 'u8', name: 'Jennifer Lee', email: 'jennifer.lee@company.com', department: 'Marketing', jobTitle: 'Marketing Manager', manager: 'Patricia White' },
];

// Mock Campaigns
export const mockCampaigns: Campaign[] = [
  {
    id: 'camp-001',
    name: 'Q4 2024 User Access Certification',
    description: 'Quarterly user access review for SOX compliance',
    type: 'user-based',
    status: 'active',
    riskLevel: 'high',
    progress: 65,
    totalItems: 247,
    completedItems: 161,
    dueDate: '2024-12-31T23:59:59Z',
    createdDate: '2024-12-01T00:00:00Z',
    createdBy: 'admin@company.com',
    complianceFrameworks: ['SOX', 'ISO27001'],
    reviewers: [
      {
        id: 'rev-001',
        userId: 'u1',
        name: 'John Smith',
        email: 'john.smith@company.com',
        assignedDate: '2024-12-01T10:00:00Z',
        assignedBy: 'admin@company.com',
        itemsAssigned: 85,
        itemsCompleted: 62,
        status: 'in-progress',
        averageDecisionTime: 4.2
      },
      {
        id: 'rev-002',
        userId: 'u4',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@company.com',
        assignedDate: '2024-12-01T10:00:00Z',
        assignedBy: 'admin@company.com',
        itemsAssigned: 162,
        itemsCompleted: 99,
        status: 'in-progress',
        averageDecisionTime: 3.8
      }
    ],
    configuration: {
      slaHours: 168,
      notificationChannels: ['email', 'slack', 'in-app'],
      preReviewSimulation: true,
      autoReminder: true,
      reminderFrequency: 48,
      escalationEnabled: true,
      escalationAfterHours: 72,
      requireJustification: true,
      allowBulkActions: true,
      enableAIAssist: true,
      confidenceThreshold: 75
    }
  },
  {
    id: 'camp-002',
    name: 'Privileged Access Review - December',
    description: 'Monthly review of privileged and admin access',
    type: 'role-based',
    status: 'active',
    riskLevel: 'critical',
    progress: 42,
    totalItems: 89,
    completedItems: 37,
    dueDate: '2024-12-15T23:59:59Z',
    createdDate: '2024-12-05T00:00:00Z',
    createdBy: 'security@company.com',
    complianceFrameworks: ['SOX', 'PCI-DSS'],
    reviewers: [
      {
        id: 'rev-003',
        userId: 'u7',
        name: 'James Anderson',
        email: 'james.anderson@company.com',
        assignedDate: '2024-12-05T10:00:00Z',
        assignedBy: 'security@company.com',
        itemsAssigned: 89,
        itemsCompleted: 37,
        status: 'in-progress',
        averageDecisionTime: 6.5
      }
    ],
    configuration: {
      slaHours: 72,
      notificationChannels: ['email', 'teams', 'in-app'],
      preReviewSimulation: false,
      autoReminder: true,
      reminderFrequency: 24,
      escalationEnabled: true,
      escalationAfterHours: 48,
      requireJustification: true,
      allowBulkActions: false,
      enableAIAssist: true,
      confidenceThreshold: 85
    }
  },
  {
    id: 'camp-003',
    name: 'SAP Access Certification',
    description: 'Application-specific access review for SAP system',
    type: 'application-based',
    status: 'paused',
    riskLevel: 'medium',
    progress: 28,
    totalItems: 156,
    completedItems: 44,
    dueDate: '2024-12-20T23:59:59Z',
    createdDate: '2024-11-28T00:00:00Z',
    createdBy: 'app-owner@company.com',
    complianceFrameworks: ['SOX'],
    reviewers: [
      {
        id: 'rev-004',
        userId: 'u2',
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        assignedDate: '2024-11-28T10:00:00Z',
        assignedBy: 'app-owner@company.com',
        itemsAssigned: 156,
        itemsCompleted: 44,
        status: 'in-progress',
        averageDecisionTime: 5.1
      }
    ],
    configuration: {
      slaHours: 240,
      notificationChannels: ['email'],
      preReviewSimulation: true,
      autoReminder: true,
      reminderFrequency: 72,
      escalationEnabled: false,
      escalationAfterHours: 0,
      requireJustification: true,
      allowBulkActions: true,
      enableAIAssist: true,
      confidenceThreshold: 70
    }
  },
  {
    id: 'camp-004',
    name: 'SoD Violation Remediation',
    description: 'Review and remediate segregation of duties conflicts',
    type: 'sod-based',
    status: 'active',
    riskLevel: 'critical',
    progress: 75,
    totalItems: 32,
    completedItems: 24,
    dueDate: '2024-12-10T23:59:59Z',
    createdDate: '2024-12-03T00:00:00Z',
    createdBy: 'compliance@company.com',
    complianceFrameworks: ['SOX', 'ISO27001', 'GDPR'],
    reviewers: [
      {
        id: 'rev-005',
        userId: 'u1',
        name: 'John Smith',
        email: 'john.smith@company.com',
        assignedDate: '2024-12-03T10:00:00Z',
        assignedBy: 'compliance@company.com',
        itemsAssigned: 32,
        itemsCompleted: 24,
        status: 'in-progress',
        averageDecisionTime: 8.3
      }
    ],
    configuration: {
      slaHours: 48,
      notificationChannels: ['email', 'slack', 'in-app'],
      preReviewSimulation: false,
      autoReminder: true,
      reminderFrequency: 12,
      escalationEnabled: true,
      escalationAfterHours: 24,
      requireJustification: true,
      allowBulkActions: false,
      enableAIAssist: true,
      confidenceThreshold: 90
    }
  },
  {
    id: 'camp-005',
    name: 'New Hire Access Review - December',
    description: 'Event-driven review for new employees hired in December',
    type: 'event-driven',
    status: 'completed',
    riskLevel: 'low',
    progress: 100,
    totalItems: 23,
    completedItems: 23,
    dueDate: '2024-12-08T23:59:59Z',
    createdDate: '2024-12-01T00:00:00Z',
    createdBy: 'hr@company.com',
    complianceFrameworks: ['GDPR'],
    reviewers: [
      {
        id: 'rev-006',
        userId: 'u4',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@company.com',
        assignedDate: '2024-12-01T10:00:00Z',
        assignedBy: 'hr@company.com',
        itemsAssigned: 23,
        itemsCompleted: 23,
        status: 'completed',
        averageDecisionTime: 2.1
      }
    ],
    configuration: {
      slaHours: 168,
      notificationChannels: ['email', 'in-app'],
      preReviewSimulation: true,
      autoReminder: true,
      reminderFrequency: 48,
      escalationEnabled: false,
      escalationAfterHours: 0,
      requireJustification: false,
      allowBulkActions: true,
      enableAIAssist: true,
      confidenceThreshold: 65
    }
  }
];

// Mock Review Items
export const mockReviewItems: ReviewItem[] = [
  {
    id: 'item-001',
    campaignId: 'camp-001',
    itemType: 'user',
    userId: 'u1',
    userName: 'John Smith',
    userEmail: 'john.smith@company.com',
    userDepartment: 'Engineering',
    userJobTitle: 'Senior Developer',
    userManager: 'Sarah Johnson',
    entitlements: [
      {
        id: 'ent-001',
        name: 'GitHub Admin',
        type: 'Admin Role',
        application: 'GitHub',
        grantDate: '2023-01-15T00:00:00Z',
        lastUsed: '2024-12-09T14:23:00Z',
        usageCount: 1247,
        riskLevel: 'high',
        isPII: false,
        isSensitive: true,
        businessJustification: 'Repository management and code review',
        expiryDate: '2025-01-15T00:00:00Z'
      },
      {
        id: 'ent-002',
        name: 'AWS Production Access',
        type: 'Account Access',
        application: 'AWS',
        grantDate: '2023-02-10T00:00:00Z',
        lastUsed: '2024-12-09T08:15:00Z',
        usageCount: 892,
        riskLevel: 'critical',
        isPII: false,
        isSensitive: true,
        businessJustification: 'Production deployment and monitoring'
      },
      {
        id: 'ent-003',
        name: 'Jira Project Admin',
        type: 'Admin Role',
        application: 'Jira',
        grantDate: '2023-01-20T00:00:00Z',
        lastUsed: '2024-12-08T16:45:00Z',
        usageCount: 2341,
        riskLevel: 'medium',
        isPII: false,
        isSensitive: false,
        businessJustification: 'Sprint planning and issue management'
      },
      {
        id: 'ent-004',
        name: 'Salesforce Read Access',
        type: 'Standard Access',
        application: 'Salesforce',
        grantDate: '2023-06-01T00:00:00Z',
        lastUsed: '2024-10-15T10:30:00Z',
        usageCount: 45,
        riskLevel: 'low',
        isPII: true,
        isSensitive: false,
        businessJustification: 'Customer data lookup for engineering tickets'
      }
    ],
    riskScore: 78,
    riskLevel: 'high',
    riskFactors: [
      'Multiple admin privileges',
      'Production environment access',
      'Low usage on Salesforce (potentially unused)',
      'PII access without regular usage'
    ],
    sodViolations: [
      {
        id: 'sod-001',
        policyName: 'Dev-Prod Separation',
        severity: 'medium',
        conflictingEntitlements: ['GitHub Admin', 'AWS Production Access'],
        description: 'User has both development and production access which violates separation policy',
        detectedDate: '2024-12-01T00:00:00Z'
      }
    ],
    assignedReviewer: 'u4',
    reviewerName: 'Sarah Wilson',
    status: 'pending',
    dueDate: '2024-12-15T23:59:59Z',
    aiSuggestion: {
      action: 'modify',
      confidence: 82,
      reasoning: 'User has legitimate need for most access, but Salesforce access appears unused for 2+ months. Recommend revoking Salesforce access.',
      riskAssessment: 'Medium-High risk due to SoD violation and unused PII access',
      alternativeActions: ['Revoke unused Salesforce access', 'Keep critical GitHub and AWS access', 'Add exception for SoD with quarterly review'],
      detectedAnomalies: ['Salesforce access unused for 56 days', 'Typical for engineering role but SoD violation present']
    },
    accessAnalytics: {
      lastLogin: '2024-12-09T14:23:00Z',
      loginFrequency: 'daily',
      averageSessionDuration: 6.5,
      totalSessions: 487,
      unusedEntitlements: ['Salesforce Read Access'],
      usagePattern: [
        { date: '2024-12-09', loginCount: 8, duration: 7.2, activityLevel: 'high' },
        { date: '2024-12-08', loginCount: 6, duration: 6.8, activityLevel: 'medium' },
        { date: '2024-12-07', loginCount: 9, duration: 8.1, activityLevel: 'high' },
        { date: '2024-12-06', loginCount: 7, duration: 6.5, activityLevel: 'medium' },
        { date: '2024-12-05', loginCount: 5, duration: 5.2, activityLevel: 'medium' }
      ],
      anomalyScore: 23
    },
    peerComparison: {
      similarUsers: [
        {
          id: 'u3',
          name: 'Michael Chen',
          jobTitle: 'DevOps Engineer',
          department: 'Engineering',
          matchScore: 87,
          entitlements: ['GitHub Admin', 'AWS Production Access', 'Jira Project Admin', 'DataDog Admin']
        },
        {
          id: 'u6',
          name: 'Lisa Taylor',
          jobTitle: 'Junior Developer',
          department: 'Engineering',
          matchScore: 72,
          entitlements: ['GitHub Developer', 'AWS Dev Access', 'Jira Standard User']
        }
      ],
      commonEntitlements: ['GitHub Admin', 'Jira Project Admin'],
      uniqueEntitlements: ['Salesforce Read Access'],
      missingEntitlements: ['DataDog Admin'],
      recommendedRole: 'Senior Engineering Role'
    },
    attestationHistory: [
      {
        id: 'att-001',
        campaignId: 'camp-q3-2024',
        campaignName: 'Q3 2024 User Access Certification',
        reviewDate: '2024-09-28T15:30:00Z',
        reviewer: 'Sarah Wilson',
        decision: 'approve',
        justification: 'All access appropriate for Senior Developer role'
      },
      {
        id: 'att-002',
        campaignId: 'camp-q2-2024',
        campaignName: 'Q2 2024 User Access Certification',
        reviewDate: '2024-06-30T10:15:00Z',
        reviewer: 'Michael Brown',
        decision: 'approve',
        justification: 'Access aligns with job responsibilities'
      }
    ],
    comments: [
      {
        id: 'comment-001',
        userId: 'u4',
        userName: 'Sarah Wilson',
        comment: 'Checking with manager about Salesforce access need',
        createdAt: '2024-12-09T09:00:00Z'
      }
    ]
  },
  {
    id: 'item-002',
    campaignId: 'camp-001',
    itemType: 'user',
    userId: 'u2',
    userName: 'Emily Davis',
    userEmail: 'emily.davis@company.com',
    userDepartment: 'Finance',
    userJobTitle: 'Financial Analyst',
    userManager: 'Michael Brown',
    entitlements: [
      {
        id: 'ent-005',
        name: 'QuickBooks Full Access',
        type: 'Full Access',
        application: 'QuickBooks',
        grantDate: '2022-11-10T00:00:00Z',
        lastUsed: '2024-12-09T11:20:00Z',
        usageCount: 3421,
        riskLevel: 'high',
        isPII: true,
        isSensitive: true,
        businessJustification: 'Financial reporting and analysis'
      },
      {
        id: 'ent-006',
        name: 'SAP Finance Module',
        type: 'Module Access',
        application: 'SAP',
        grantDate: '2022-11-15T00:00:00Z',
        lastUsed: '2024-12-09T13:45:00Z',
        usageCount: 2987,
        riskLevel: 'critical',
        isPII: true,
        isSensitive: true,
        businessJustification: 'Month-end closing and financial transactions'
      },
      {
        id: 'ent-007',
        name: 'Excel Power User',
        type: 'Standard Access',
        application: 'Microsoft 365',
        grantDate: '2022-11-10T00:00:00Z',
        lastUsed: '2024-12-09T14:00:00Z',
        usageCount: 4521,
        riskLevel: 'low',
        isPII: false,
        isSensitive: false,
        businessJustification: 'Financial modeling and reporting'
      }
    ],
    riskScore: 85,
    riskLevel: 'high',
    riskFactors: [
      'Access to financial systems with PII',
      'Critical SAP access',
      'High-value transaction capability',
      'No SoD violations detected'
    ],
    sodViolations: [],
    assignedReviewer: 'u1',
    reviewerName: 'John Smith',
    status: 'pending',
    dueDate: '2024-12-15T23:59:59Z',
    aiSuggestion: {
      action: 'approve',
      confidence: 91,
      reasoning: 'All access is appropriate for Financial Analyst role. High usage frequency on all systems. No anomalies detected.',
      riskAssessment: 'Expected high risk for finance role with proper usage patterns',
      alternativeActions: [],
      detectedAnomalies: []
    },
    accessAnalytics: {
      lastLogin: '2024-12-09T14:00:00Z',
      loginFrequency: 'daily',
      averageSessionDuration: 5.8,
      totalSessions: 612,
      unusedEntitlements: [],
      usagePattern: [
        { date: '2024-12-09', loginCount: 12, duration: 6.5, activityLevel: 'high' },
        { date: '2024-12-08', loginCount: 10, duration: 5.8, activityLevel: 'high' },
        { date: '2024-12-07', loginCount: 8, duration: 4.2, activityLevel: 'medium' },
        { date: '2024-12-06', loginCount: 11, duration: 6.1, activityLevel: 'high' },
        { date: '2024-12-05', loginCount: 13, duration: 7.2, activityLevel: 'high' }
      ],
      anomalyScore: 8
    },
    peerComparison: {
      similarUsers: [
        {
          id: 'u-fin-01',
          name: 'Robert Chen',
          jobTitle: 'Financial Analyst',
          department: 'Finance',
          matchScore: 95,
          entitlements: ['QuickBooks Full Access', 'SAP Finance Module', 'Excel Power User']
        },
        {
          id: 'u-fin-02',
          name: 'Amanda Liu',
          jobTitle: 'Senior Financial Analyst',
          department: 'Finance',
          matchScore: 89,
          entitlements: ['QuickBooks Full Access', 'SAP Finance Module', 'Excel Power User', 'Tableau Access']
        }
      ],
      commonEntitlements: ['QuickBooks Full Access', 'SAP Finance Module', 'Excel Power User'],
      uniqueEntitlements: [],
      missingEntitlements: ['Tableau Access'],
      recommendedRole: 'Financial Analyst Standard Role'
    },
    attestationHistory: [
      {
        id: 'att-003',
        campaignId: 'camp-q3-2024',
        campaignName: 'Q3 2024 User Access Certification',
        reviewDate: '2024-09-29T11:20:00Z',
        reviewer: 'Michael Brown',
        decision: 'approve',
        justification: 'Standard finance access, all appropriate'
      }
    ]
  }
];

// Mock Review Decisions
export const mockReviewDecisions: ReviewDecision[] = [
  {
    id: 'dec-001',
    reviewItemId: 'item-002',
    campaignId: 'camp-001',
    reviewerId: 'u1',
    reviewerName: 'John Smith',
    decision: 'approve',
    justification: 'All access is appropriate for Financial Analyst role with high usage.',
    decidedAt: '2024-12-09T15:30:00Z',
    aiAccepted: true,
    remediationStatus: {
      id: 'rem-001',
      status: 'completed',
      startedAt: '2024-12-09T15:30:01Z',
      completedAt: '2024-12-09T15:30:02Z',
      actions: [
        {
          id: 'action-001',
          type: 'notify',
          target: 'emily.davis@company.com',
          status: 'completed',
          result: 'Notification sent successfully'
        }
      ]
    }
  }
];

// Mock Review Templates
export const mockReviewTemplates: ReviewTemplate[] = [
  {
    id: 'tmpl-001',
    name: 'Approve Standard Engineering Access',
    description: 'Standard approval for engineering roles with GitHub, Jira, AWS dev access',
    createdBy: 'Sarah Wilson',
    createdAt: '2024-11-15T10:00:00Z',
    decision: 'approve',
    justification: 'Access aligns with standard engineering role requirements',
    applicableFor: {
      departments: ['Engineering', 'DevOps'],
      jobTitles: ['Developer', 'Engineer', 'DevOps Engineer'],
      riskLevels: ['low', 'medium']
    },
    usageCount: 47
  },
  {
    id: 'tmpl-002',
    name: 'Revoke Unused Access',
    description: 'Standard revocation for access unused for 60+ days',
    createdBy: 'John Smith',
    createdAt: '2024-11-20T14:30:00Z',
    decision: 'revoke',
    justification: 'Access has not been used for over 60 days and does not align with current role',
    applicableFor: {
      riskLevels: ['low', 'medium']
    },
    usageCount: 32
  }
];

// Mock Compliance Report
export const mockComplianceReport: ComplianceReport = {
  id: 'report-001',
  name: 'Q4 2024 SOX Compliance Report',
  framework: 'SOX',
  generatedAt: '2024-12-09T16:00:00Z',
  generatedBy: 'compliance@company.com',
  period: {
    start: '2024-10-01T00:00:00Z',
    end: '2024-12-31T23:59:59Z'
  },
  campaigns: ['camp-001', 'camp-002', 'camp-004'],
  metrics: {
    totalReviews: 368,
    completedReviews: 222,
    approvalRate: 78,
    revocationRate: 15,
    averageCompletionTime: 4.7,
    sodViolationsResolved: 18,
    highRiskItemsReviewed: 89,
    complianceScore: 92
  },
  evidence: [
    {
      id: 'ev-001',
      type: 'Access Review Decision',
      description: 'User access approved with manager attestation',
      timestamp: '2024-12-09T15:30:00Z',
      reviewer: 'John Smith',
      reference: 'dec-001'
    }
  ]
};

// Mock Executive Metrics
export const mockExecutiveMetrics: ExecutiveMetrics = {
  totalCampaigns: 12,
  activeCampaigns: 3,
  completedCampaigns: 8,
  totalReviews: 1247,
  avgCompletionTime: 4.3,
  riskReduction: 34,
  complianceScore: 94,
  topReviewers: [
    {
      reviewerId: 'u4',
      reviewerName: 'Sarah Wilson',
      reviewsCompleted: 284,
      avgDecisionTime: 3.8,
      accuracyScore: 96,
      aiAcceptanceRate: 87
    },
    {
      reviewerId: 'u1',
      reviewerName: 'John Smith',
      reviewsCompleted: 247,
      avgDecisionTime: 4.2,
      accuracyScore: 94,
      aiAcceptanceRate: 82
    },
    {
      reviewerId: 'u7',
      reviewerName: 'James Anderson',
      reviewsCompleted: 189,
      avgDecisionTime: 6.5,
      accuracyScore: 98,
      aiAcceptanceRate: 91
    }
  ],
  riskTrends: [
    { date: '2024-11-01', highRiskItems: 142, mediumRiskItems: 287, lowRiskItems: 521, totalRisk: 950 },
    { date: '2024-11-15', highRiskItems: 128, mediumRiskItems: 294, lowRiskItems: 535, totalRisk: 957 },
    { date: '2024-12-01', highRiskItems: 98, mediumRiskItems: 276, lowRiskItems: 548, totalRisk: 922 },
    { date: '2024-12-09', highRiskItems: 89, mediumRiskItems: 265, lowRiskItems: 557, totalRisk: 911 }
  ],
  campaignEffectiveness: [
    {
      campaignId: 'camp-001',
      campaignName: 'Q4 2024 User Access Certification',
      riskBefore: 8456,
      riskAfter: 5234,
      riskReduction: 38,
      itemsReviewed: 161,
      itemsRevoked: 28,
      timeTaken: 7.2
    },
    {
      campaignId: 'camp-002',
      campaignName: 'Privileged Access Review - December',
      riskBefore: 3421,
      riskAfter: 2134,
      riskReduction: 38,
      itemsReviewed: 37,
      itemsRevoked: 12,
      timeTaken: 9.8
    }
  ]
};

// Mock Integration Status
export const mockIntegrationStatus: IntegrationStatus[] = [
  {
    system: 'Active Directory',
    type: 'identity',
    status: 'connected',
    lastSync: '2024-12-09T15:45:00Z',
    health: 'healthy',
    capabilities: ['user-sync', 'group-sync', 'authentication']
  },
  {
    system: 'SAP Provisioning',
    type: 'provisioning',
    status: 'connected',
    lastSync: '2024-12-09T16:00:00Z',
    health: 'healthy',
    capabilities: ['provision', 'deprovision', 'modify-access']
  },
  {
    system: 'Workday',
    type: 'hr',
    status: 'connected',
    lastSync: '2024-12-09T14:30:00Z',
    health: 'healthy',
    capabilities: ['employee-data', 'org-hierarchy', 'lifecycle-events']
  },
  {
    system: 'ServiceNow',
    type: 'access-request',
    status: 'connected',
    lastSync: '2024-12-09T15:30:00Z',
    health: 'degraded',
    capabilities: ['request-sync', 'approval-workflow']
  },
  {
    system: 'Role Management System',
    type: 'role-management',
    status: 'not-configured',
    health: 'down',
    capabilities: []
  }
];

// Mock Role Mining Results
export const mockRoleMiningResults: RoleMiningResult[] = [
  {
    id: 'role-001',
    suggestedRoleName: 'Engineering Standard Access',
    confidence: 89,
    commonEntitlements: ['GitHub Developer', 'Jira Standard User', 'Slack Workspace', 'Google Workspace'],
    affectedUsers: ['u1', 'u3', 'u6'],
    potentialMembers: 24,
    riskLevel: 'low',
    businessJustification: 'Common access pattern for engineering team members across 24 users'
  },
  {
    id: 'role-002',
    suggestedRoleName: 'Finance Analyst Role',
    confidence: 94,
    commonEntitlements: ['QuickBooks Full Access', 'SAP Finance Module', 'Excel Power User'],
    affectedUsers: ['u2'],
    potentialMembers: 8,
    riskLevel: 'medium',
    businessJustification: 'Standard finance analyst access pattern identified across finance department'
  }
];

// Mock Notification Configurations
export const mockNotificationConfigs: NotificationConfig[] = [
  {
    id: 'notif-001',
    campaignId: 'camp-001',
    type: 'reminder',
    channels: ['email', 'in-app'],
    recipients: ['john.smith@company.com', 'sarah.wilson@company.com'],
    schedule: 'Every 48 hours',
    lastSent: '2024-12-08T09:00:00Z',
    enabled: true
  },
  {
    id: 'notif-002',
    campaignId: 'camp-001',
    type: 'escalation',
    channels: ['email', 'slack'],
    recipients: ['manager@company.com', 'compliance@company.com'],
    schedule: 'After 72 hours overdue',
    enabled: true
  }
];
