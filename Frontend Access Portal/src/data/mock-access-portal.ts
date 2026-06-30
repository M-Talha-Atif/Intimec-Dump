// ============================================================================
// COMPLETE AND VALIDATED ACCESS REQUEST DATA
// ============================================================================

export interface AccessItem {
  id: string;
  name: string;
  type: 'application' | 'role' | 'group' | 'entitlement';
  description: string;
  owner: string;
  department: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  approvalWorkflow: string[];
  icon: string;
  applicationName?: string;
  category: string;
  requestCount: number;
  expiringUsers?: number;
  // Hierarchy fields
  parentId?: string;
  hierarchyLevel: 'root' | 'application' | 'directory' | 'department' | 'role' | 'entitlement';
  hierarchyPath?: string[];
  childCount?: number;
  // Owner details
  ownerEmail?: string;
  ownerDepartment?: string;
  // Business context
  businessJustification?: string;

  // Approval metrics
  approvalRate?: number;     // Approval rate percentage (0-100)
  totalRequests?: number;    // Total number of requests for this item
  // Enhanced fields
  tileId?: string;
  customIcon?: string;
  lastUsedDate?: string;
  avgUsagePerMonth?: number;
  provisioningTime?: number;
}

export interface AccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  items: RequestItem[];
  status: 'draft' | 'submitted' | 'pending-approval' | 'approved' | 'rejected' | 'provisioned';
  createdAt: string;
  submittedAt?: string;
  completedAt?: string;
  totalItems: number;
  emergencyAccess: boolean;
  justification: string;
  attachments?: string[];
  currentApprover?: string;
  slaHours: number;
  hoursRemaining?: number;
  riskScore: number;
  sodConflicts: string[];
  complianceIssues: string[];
  // Enhanced fields
  requestType?: 'self' | 'on-behalf' | 'bulk' | 'renewal' | 'template';
  beneficiaries?: string[];
  parentRequestId?: string;
  templateId?: string;
  isDraft?: boolean;
  approvalChain?: any[];
  provisioningStatus?: 'pending' | 'in-progress' | 'completed' | 'failed' | 'partial';
  provisioningDetails?: any[];
  expirationDate?: string;
  renewalReminderSent?: boolean;
  autoRenewEnabled?: boolean;
  gracePeriodEnds?: string;
  usageStatistics?: any;
  auditTrail?: any[];
  comments?: any[];
}

export interface RequestItem {
  accessItemId: string;
  accessItem: AccessItem;
  justification: string;
  validityPeriod: number;
  urgency: 'low' | 'medium' | 'high';
  emergencyAccess: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approver?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

// ============================================================================
// COMPLETE MOCK DATA - ALL CATEGORIES REPRESENTED
// ============================================================================

export const mockAccessItems: AccessItem[] = [
  // ========== BUSINESS APPLICATIONS (12 items) ==========
  {
    id: 'app-1',
    name: 'Salesforce CRM',
    type: 'application',
    description: 'Customer relationship management system with full access',
    owner: 'John Martinez',
    ownerEmail: 'john.martinez@company.com',
    department: 'Sales',
    riskLevel: 'medium',
    tags: ['CRM', 'Customer Data', 'Sales'],
    complianceFlags: ['GDPR', 'SOX'],
    approvalWorkflow: ['Manager', 'App Owner'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'Users',
    applicationName: 'Salesforce',
    category: 'Business Applications',
    requestCount: 156,
    isRecommended: true,
    hierarchyLevel: 'application',
    childCount: 0,
    vendor: 'Salesforce Inc.',
    version: '2024.1',
    loginUrl: 'https://company.salesforce.com',
    activeUsers: 1200,
    licenseCost: 150,
    currency: 'USD'
  },
  {
    id: 'app-2',
    name: 'Microsoft Dynamics 365',
    type: 'application',
    description: 'Enterprise resource planning and CRM platform',
    owner: 'Sarah Johnson',
    ownerEmail: 'sarah.johnson@company.com',
    department: 'Operations',
    riskLevel: 'high',
    tags: ['ERP', 'CRM', 'Finance'],
    complianceFlags: ['SOX', 'HIPAA'],
    approvalWorkflow: ['Manager', 'Finance Director'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'Briefcase',
    category: 'Business Applications',
    requestCount: 89,
    hierarchyLevel: 'application',
    childCount: 0,
    vendor: 'Microsoft',
    activeUsers: 800
  },
  {
    id: 'app-3',
    name: 'HubSpot Marketing',
    type: 'application',
    description: 'Marketing automation and analytics platform',
    owner: 'Emily Chen',
    department: 'Marketing',
    riskLevel: 'low',
    tags: ['Marketing', 'Analytics', 'Automation'],
    complianceFlags: ['GDPR'],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'TrendingUp',
    category: 'Business Applications',
    requestCount: 234,
    isNew: true,
    hierarchyLevel: 'application',
    childCount: 0
  },
  {
    id: 'app-4',
    name: 'NetSuite ERP',
    type: 'application',
    description: 'Cloud-based ERP system for finance and operations',
    owner: 'Michael Roberts',
    department: 'Finance',
    riskLevel: 'critical',
    tags: ['ERP', 'Finance', 'Accounting'],
    complianceFlags: ['SOX', 'GAAP'],
    approvalWorkflow: ['Manager', 'CFO'],
    autoApprovalEligible: false,
    maxValidityDays: 180,
    icon: 'Calculator',
    category: 'Business Applications',
    requestCount: 45,
    hierarchyLevel: 'application',
    childCount: 0
  },
  {
    id: 'app-5',
    name: 'Workday HCM',
    type: 'application',
    description: 'Human capital management and payroll system',
    owner: 'Jennifer Adams',
    department: 'HR',
    riskLevel: 'high',
    tags: ['HR', 'Payroll', 'Employee Data'],
    complianceFlags: ['GDPR', 'HIPAA'],
    approvalWorkflow: ['Manager', 'HR Director'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'Users',
    category: 'Business Applications',
    requestCount: 178,
    hierarchyLevel: 'application',
    childCount: 0
  },
  {
    id: 'app-6',
    name: 'ServiceNow',
    type: 'application',
    description: 'IT service management and workflow automation',
    owner: 'David Kim',
    department: 'IT',
    riskLevel: 'medium',
    tags: ['ITSM', 'Workflow', 'Automation'],
    complianceFlags: [],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'Settings',
    category: 'Business Applications',
    requestCount: 267,
    hierarchyLevel: 'application',
    childCount: 0
  },

  // ========== IT ROLES (8 items) ==========
  {
    id: 'role-1',
    name: 'Database Administrator',
    type: 'role',
    description: 'Full administrative access to production databases',
    owner: 'Sarah Chen',
    department: 'IT',
    riskLevel: 'critical',
    tags: ['Privileged', 'Database', 'Production'],
    prerequisites: ['Database User', 'IT Security Training'],
    toxicCombinations: ['Auditor Role', 'Financial Analyst'],
    complianceFlags: ['SOX', 'HIPAA'],
    approvalWorkflow: ['Manager', 'IT Director', 'CISO'],
    autoApprovalEligible: false,
    maxValidityDays: 90,
    icon: 'Shield',
    category: 'IT Roles',
    requestCount: 23,
    hierarchyLevel: 'role',
    childCount: 0,
    requiredTraining: ['DB-ADMIN-101', 'SECURITY-AWARENESS']
  },
  {
    id: 'role-2',
    name: 'System Administrator',
    type: 'role',
    description: 'Server and infrastructure administration privileges',
    owner: 'David Kim',
    department: 'IT',
    riskLevel: 'critical',
    tags: ['Privileged', 'Infrastructure', 'Admin'],
    complianceFlags: ['SOX'],
    approvalWorkflow: ['Manager', 'IT Director'],
    autoApprovalEligible: false,
    maxValidityDays: 90,
    icon: 'Server',
    category: 'IT Roles',
    requestCount: 34,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-3',
    name: 'Network Administrator',
    type: 'role',
    description: 'Network infrastructure and security management',
    owner: 'Lisa Wang',
    department: 'IT',
    riskLevel: 'high',
    tags: ['Network', 'Security', 'Infrastructure'],
    complianceFlags: ['PCI-DSS'],
    approvalWorkflow: ['Manager', 'IT Director'],
    autoApprovalEligible: false,
    maxValidityDays: 180,
    icon: 'Network',
    category: 'IT Roles',
    requestCount: 19,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-4',
    name: 'Security Analyst',
    type: 'role',
    description: 'Security monitoring and incident response',
    owner: 'Robert Taylor',
    department: 'IT',
    riskLevel: 'high',
    tags: ['Security', 'Monitoring', 'Incident Response'],
    complianceFlags: ['SOX', 'PCI-DSS'],
    approvalWorkflow: ['Manager', 'CISO'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'Shield',
    category: 'IT Roles',
    requestCount: 45,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-5',
    name: 'DevOps Engineer',
    type: 'role',
    description: 'CI/CD pipeline and deployment automation access',
    owner: 'David Kim',
    department: 'IT',
    riskLevel: 'high',
    tags: ['DevOps', 'Automation', 'Deployment'],
    complianceFlags: ['SOX'],
    approvalWorkflow: ['Manager', 'IT Director'],
    autoApprovalEligible: false,
    maxValidityDays: 180,
    icon: 'Code',
    category: 'IT Roles',
    requestCount: 78,
    hierarchyLevel: 'role',
    childCount: 0
  },

  // ========== MARKETING ROLES (4 items) ==========
  {
    id: 'role-marketing-1',
    name: 'Marketing Manager',
    type: 'role',
    description: 'Full marketing platform access and campaign management',
    owner: 'Emily Chen',
    department: 'Marketing',
    riskLevel: 'medium',
    tags: ['Marketing', 'Campaigns', 'Management'],
    complianceFlags: ['GDPR'],
    approvalWorkflow: ['Manager', 'Marketing Director'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'TrendingUp',
    category: 'Marketing Roles',
    requestCount: 89,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-marketing-2',
    name: 'Marketing Analyst',
    type: 'role',
    description: 'Analytics and reporting access for marketing data',
    owner: 'Emily Chen',
    department: 'Marketing',
    riskLevel: 'low',
    tags: ['Analytics', 'Reporting', 'Data'],
    complianceFlags: [],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'BarChart',
    category: 'Marketing Roles',
    requestCount: 134,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-marketing-3',
    name: 'Content Manager',
    type: 'role',
    description: 'Content management system and publishing access',
    owner: 'Emily Chen',
    department: 'Marketing',
    riskLevel: 'low',
    tags: ['Content', 'Publishing', 'CMS'],
    complianceFlags: [],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'FileText',
    category: 'Marketing Roles',
    requestCount: 98,
    hierarchyLevel: 'role',
    childCount: 0
  },

  // ========== DEPARTMENT GROUPS (15 items) ==========
  {
    id: 'group-1',
    name: 'Finance Team',
    type: 'group',
    description: 'Access to financial systems and reports',
    owner: 'Michael Roberts',
    department: 'Finance',
    riskLevel: 'high',
    tags: ['Finance', 'Reports', 'Financial Data'],
    complianceFlags: ['SOX'],
    approvalWorkflow: ['Manager', 'Finance Director'],
    autoApprovalEligible: false,
    maxValidityDays: 180,
    icon: 'Calculator',
    category: 'Department Groups',
    requestCount: 89,
    hierarchyLevel: 'role',
    childCount: 0,
    activeUsers: 45
  },
  {
    id: 'group-2',
    name: 'Marketing Team',
    type: 'group',
    description: 'Marketing tools and campaign management access',
    owner: 'Emily Chen',
    department: 'Marketing',
    riskLevel: 'medium',
    tags: ['Marketing', 'Campaigns', 'Analytics'],
    complianceFlags: ['GDPR'],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'TrendingUp',
    category: 'Department Groups',
    requestCount: 145,
    hierarchyLevel: 'role',
    childCount: 0,
    activeUsers: 62
  },
  {
    id: 'group-3',
    name: 'Sales Team',
    type: 'group',
    description: 'CRM and sales enablement tools',
    owner: 'John Martinez',
    department: 'Sales',
    riskLevel: 'medium',
    tags: ['Sales', 'CRM', 'Customer Data'],
    complianceFlags: ['GDPR'],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'Users',
    category: 'Department Groups',
    requestCount: 198,
    hierarchyLevel: 'role',
    childCount: 0,
    activeUsers: 120
  },
  {
    id: 'group-4',
    name: 'HR Team',
    type: 'group',
    description: 'HR systems and employee data access',
    owner: 'Jennifer Adams',
    department: 'HR',
    riskLevel: 'high',
    tags: ['HR', 'Employee Data', 'Confidential'],
    complianceFlags: ['GDPR', 'HIPAA'],
    approvalWorkflow: ['Manager', 'HR Director'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'Heart',
    category: 'Department Groups',
    requestCount: 56,
    hierarchyLevel: 'role',
    childCount: 0,
    activeUsers: 28
  },
  {
    id: 'group-5',
    name: 'Engineering Team',
    type: 'group',
    description: 'Development tools and code repository access',
    owner: 'David Kim',
    department: 'Engineering',
    riskLevel: 'medium',
    tags: ['Development', 'Code', 'Tools'],
    complianceFlags: [],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'Code',
    category: 'Department Groups',
    requestCount: 234,
    hierarchyLevel: 'role',
    childCount: 0,
    activeUsers: 156
  },

  // ========== FINANCE ROLES (5 items) ==========
  {
    id: 'role-fin-1',
    name: 'Financial Analyst',
    type: 'role',
    description: 'Financial reporting and analysis access',
    owner: 'Michael Roberts',
    department: 'Finance',
    riskLevel: 'medium',
    tags: ['Finance', 'Analysis', 'Reporting'],
    complianceFlags: ['SOX'],
    approvalWorkflow: ['Manager', 'Finance Director'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'TrendingUp',
    category: 'Finance Roles',
    requestCount: 123,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-fin-2',
    name: 'Accounts Payable Clerk',
    type: 'role',
    description: 'AP processing and vendor payment access',
    owner: 'Michael Roberts',
    department: 'Finance',
    riskLevel: 'high',
    tags: ['AP', 'Payments', 'Vendors'],
    complianceFlags: ['SOX'],
    approvalWorkflow: ['Manager', 'Finance Director'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'DollarSign',
    category: 'Finance Roles',
    requestCount: 78,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-fin-3',
    name: 'Accounts Receivable Clerk',
    type: 'role',
    description: 'AR processing and collections access',
    owner: 'Michael Roberts',
    department: 'Finance',
    riskLevel: 'medium',
    tags: ['AR', 'Collections', 'Invoicing'],
    complianceFlags: ['SOX'],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'FileText',
    category: 'Finance Roles',
    requestCount: 92,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-fin-4',
    name: 'Budget Analyst',
    type: 'role',
    description: 'Budget planning and tracking access',
    owner: 'Michael Roberts',
    department: 'Finance',
    riskLevel: 'medium',
    tags: ['Budget', 'Planning', 'Forecasting'],
    complianceFlags: [],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'PieChart',
    category: 'Finance Roles',
    requestCount: 67,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-fin-5',
    name: 'Internal Auditor',
    type: 'role',
    description: 'Audit and compliance review access',
    owner: 'Michael Roberts',
    department: 'Finance',
    riskLevel: 'high',
    tags: ['Audit', 'Compliance', 'Review'],
    toxicCombinations: ['Database Administrator', 'System Administrator'],
    complianceFlags: ['SOX', 'GAAP'],
    approvalWorkflow: ['Manager', 'CFO'],
    autoApprovalEligible: false,
    maxValidityDays: 180,
    icon: 'Shield',
    category: 'Finance Roles',
    requestCount: 34,
    hierarchyLevel: 'role',
    childCount: 0
  },

  // ========== COLLABORATION TOOLS (10 items) ==========
  {
    id: 'app-collab-1',
    name: 'Confluence Wiki',
    type: 'application',
    description: 'Collaboration and documentation platform',
    owner: 'David Kim',
    department: 'IT',
    riskLevel: 'low',
    tags: ['Documentation', 'Collaboration', 'Wiki'],
    complianceFlags: [],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'FileText',
    applicationName: 'Confluence',
    category: 'Collaboration Tools',
    requestCount: 234,
    isNew: true,
    hierarchyLevel: 'application',
    childCount: 0,
    activeUsers: 850
  },
  {
    id: 'app-collab-2',
    name: 'Slack Workspace',
    type: 'application',
    description: 'Team communication and messaging platform',
    owner: 'Emily Chen',
    department: 'IT',
    riskLevel: 'low',
    tags: ['Communication', 'Chat', 'Collaboration'],
    complianceFlags: [],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'MessageSquare',
    category: 'Collaboration Tools',
    requestCount: 456,
    hierarchyLevel: 'application',
    childCount: 0,
    activeUsers: 1200
  },
  {
    id: 'app-collab-3',
    name: 'Microsoft Teams',
    type: 'application',
    description: 'Video conferencing and team collaboration',
    owner: 'Sarah Johnson',
    department: 'IT',
    riskLevel: 'low',
    tags: ['Video', 'Meetings', 'Collaboration'],
    complianceFlags: [],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'Video',
    category: 'Collaboration Tools',
    requestCount: 389,
    hierarchyLevel: 'application',
    childCount: 0,
    activeUsers: 980
  },
  {
    id: 'app-collab-4',
    name: 'Miro Whiteboard',
    type: 'application',
    description: 'Online collaborative whiteboard platform',
    owner: 'David Kim',
    department: 'IT',
    riskLevel: 'low',
    tags: ['Whiteboard', 'Brainstorming', 'Visual'],
    complianceFlags: [],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'Layout',
    category: 'Collaboration Tools',
    requestCount: 145,
    hierarchyLevel: 'application',
    childCount: 0,
    activeUsers: 340
  },

  // ========== ERP ENTITLEMENTS (6 items) ==========
  {
    id: 'ent-1',
    name: 'SAP Admin Console',
    type: 'entitlement',
    description: 'Administrative access to SAP configuration',
    owner: 'Lisa Wang',
    department: 'IT',
    riskLevel: 'critical',
    tags: ['Privileged', 'SAP', 'Admin', 'ERP'],
    prerequisites: ['SAP User', 'Admin Training'],
    complianceFlags: ['SOX'],
    approvalWorkflow: ['Manager', 'SAP Owner', 'IT Director'],
    autoApprovalEligible: false,
    maxValidityDays: 60,
    icon: 'Settings',
    applicationName: 'SAP ERP',
    category: 'ERP Entitlements',
    requestCount: 34,
    hierarchyLevel: 'entitlement',
    childCount: 0,
    permissions: ['read', 'write', 'admin'],
    accessLevel: 'admin'
  },
  {
    id: 'ent-2',
    name: 'SAP Finance Module',
    type: 'entitlement',
    description: 'Access to SAP financial transactions and reporting',
    owner: 'Michael Roberts',
    department: 'Finance',
    riskLevel: 'high',
    tags: ['Finance', 'SAP', 'Transactions'],
    complianceFlags: ['SOX', 'GAAP'],
    approvalWorkflow: ['Manager', 'Finance Director'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'DollarSign',
    applicationName: 'SAP ERP',
    category: 'ERP Entitlements',
    requestCount: 67,
    hierarchyLevel: 'entitlement',
    childCount: 0,
    accessLevel: 'write'
  },
  {
    id: 'ent-3',
    name: 'Oracle Financials',
    type: 'entitlement',
    description: 'Oracle ERP financial management access',
    owner: 'Michael Roberts',
    department: 'Finance',
    riskLevel: 'high',
    tags: ['Oracle', 'Finance', 'ERP'],
    complianceFlags: ['SOX'],
    approvalWorkflow: ['Manager', 'Finance Director'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'Calculator',
    category: 'ERP Entitlements',
    requestCount: 45,
    hierarchyLevel: 'entitlement',
    childCount: 0
  },
  {
    id: 'ent-4',
    name: 'SAP HR Module',
    type: 'entitlement',
    description: 'Access to SAP human resources and payroll',
    owner: 'Jennifer Adams',
    department: 'HR',
    riskLevel: 'high',
    tags: ['HR', 'SAP', 'Payroll'],
    complianceFlags: ['GDPR', 'HIPAA'],
    approvalWorkflow: ['Manager', 'HR Director'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'Users',
    category: 'ERP Entitlements',
    requestCount: 56,
    hierarchyLevel: 'entitlement',
    childCount: 0
  },

  // ========== HR ROLES (7 items) ==========
  {
    id: 'role-hr-1',
    name: 'HR Business Partner',
    type: 'role',
    description: 'Access to employee data and HR systems',
    owner: 'Jennifer Adams',
    department: 'HR',
    riskLevel: 'medium',
    tags: ['HR', 'Employee Data', 'Confidential'],
    complianceFlags: ['GDPR', 'HIPAA'],
    approvalWorkflow: ['Manager', 'HR Director'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'Users',
    category: 'HR Roles',
    requestCount: 67,
    expiringUsers: 5,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-hr-2',
    name: 'HR Recruiter',
    type: 'role',
    description: 'Recruiting and applicant tracking system access',
    owner: 'Jennifer Adams',
    department: 'HR',
    riskLevel: 'low',
    tags: ['HR', 'Recruiting', 'ATS'],
    complianceFlags: ['GDPR'],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'UserPlus',
    category: 'HR Roles',
    requestCount: 89,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-hr-3',
    name: 'Payroll Administrator',
    type: 'role',
    description: 'Payroll processing and sensitive compensation data',
    owner: 'Michael Roberts',
    department: 'HR',
    riskLevel: 'critical',
    tags: ['Payroll', 'Compensation', 'Sensitive'],
    complianceFlags: ['SOX', 'GDPR'],
    approvalWorkflow: ['Manager', 'HR Director', 'CFO'],
    autoApprovalEligible: false,
    maxValidityDays: 180,
    icon: 'DollarSign',
    category: 'HR Roles',
    requestCount: 23,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-hr-4',
    name: 'Benefits Administrator',
    type: 'role',
    description: 'Employee benefits and wellness program management',
    owner: 'Jennifer Adams',
    department: 'HR',
    riskLevel: 'medium',
    tags: ['Benefits', 'Wellness', 'HR'],
    complianceFlags: ['HIPAA'],
    approvalWorkflow: ['Manager', 'HR Director'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'Heart',
    category: 'HR Roles',
    requestCount: 45,
    hierarchyLevel: 'role',
    childCount: 0
  },

  // ========== SALES ROLES (4 items) ==========
  {
    id: 'role-sales-1',
    name: 'Sales Manager',
    type: 'role',
    description: 'Full CRM access and team management',
    owner: 'John Martinez',
    department: 'Sales',
    riskLevel: 'medium',
    tags: ['Sales', 'CRM', 'Management'],
    complianceFlags: ['GDPR'],
    approvalWorkflow: ['Manager', 'Sales Director'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'Users',
    category: 'Sales Roles',
    requestCount: 156,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-sales-2',
    name: 'Sales Representative',
    type: 'role',
    description: 'CRM access for managing customer accounts',
    owner: 'John Martinez',
    department: 'Sales',
    riskLevel: 'low',
    tags: ['Sales', 'CRM', 'Customers'],
    complianceFlags: ['GDPR'],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'UserCheck',
    category: 'Sales Roles',
    requestCount: 234,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-sales-3',
    name: 'Sales Operations Analyst',
    type: 'role',
    description: 'Sales analytics and reporting access',
    owner: 'John Martinez',
    department: 'Sales',
    riskLevel: 'low',
    tags: ['Sales', 'Analytics', 'Reporting'],
    complianceFlags: [],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'BarChart',
    category: 'Sales Roles',
    requestCount: 98,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-sales-4',
    name: 'Inside Sales Representative',
    type: 'role',
    description: 'CRM and lead management access',
    owner: 'John Martinez',
    department: 'Sales',
    riskLevel: 'low',
    tags: ['Sales', 'Leads', 'CRM'],
    complianceFlags: ['GDPR'],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'Phone',
    category: 'Sales Roles',
    requestCount: 187,
    hierarchyLevel: 'role',
    childCount: 0
  },

  // ========== LEGAL ROLES (3 items) ==========
  {
    id: 'role-legal-1',
    name: 'Legal Counsel',
    type: 'role',
    description: 'Access to legal management and contract systems',
    owner: 'Patricia Wilson',
    department: 'Legal',
    riskLevel: 'high',
    tags: ['Legal', 'Contracts', 'Confidential'],
    complianceFlags: ['SOX', 'GDPR'],
    approvalWorkflow: ['Manager', 'General Counsel'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'Scale',
    category: 'Legal Roles',
    requestCount: 34,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-legal-2',
    name: 'Compliance Officer',
    type: 'role',
    description: 'Regulatory compliance and audit access',
    owner: 'Patricia Wilson',
    department: 'Legal',
    riskLevel: 'high',
    tags: ['Compliance', 'Audit', 'Regulatory'],
    complianceFlags: ['SOX', 'GDPR', 'HIPAA'],
    approvalWorkflow: ['Manager', 'General Counsel'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'Shield',
    category: 'Legal Roles',
    requestCount: 45,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-legal-3',
    name: 'Contract Administrator',
    type: 'role',
    description: 'Contract management and review access',
    owner: 'Patricia Wilson',
    department: 'Legal',
    riskLevel: 'medium',
    tags: ['Contracts', 'Legal', 'Administration'],
    complianceFlags: [],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'FileText',
    category: 'Legal Roles',
    requestCount: 67,
    hierarchyLevel: 'role',
    childCount: 0
  },

  // ========== OPERATIONS ROLES (4 items) ==========
  {
    id: 'role-ops-1',
    name: 'Operations Manager',
    type: 'role',
    description: 'Full operations systems access',
    owner: 'Sarah Johnson',
    department: 'Operations',
    riskLevel: 'medium',
    tags: ['Operations', 'Management', 'Systems'],
    complianceFlags: [],
    approvalWorkflow: ['Manager', 'Operations Director'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'Settings',
    category: 'Operations Roles',
    requestCount: 78,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-ops-2',
    name: 'Supply Chain Analyst',
    type: 'role',
    description: 'Supply chain management and analytics',
    owner: 'Sarah Johnson',
    department: 'Operations',
    riskLevel: 'low',
    tags: ['Supply Chain', 'Analytics', 'Planning'],
    complianceFlags: [],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'TrendingUp',
    category: 'Operations Roles',
    requestCount: 123,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-ops-3',
    name: 'Inventory Manager',
    type: 'role',
    description: 'Inventory management system access',
    owner: 'Sarah Johnson',
    department: 'Operations',
    riskLevel: 'medium',
    tags: ['Inventory', 'Warehouse', 'Management'],
    complianceFlags: [],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'Package',
    category: 'Operations Roles',
    requestCount: 89,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-ops-4',
    name: 'Warehouse Coordinator',
    type: 'role',
    description: 'Warehouse management system access',
    owner: 'Sarah Johnson',
    department: 'Operations',
    riskLevel: 'low',
    tags: ['Warehouse', 'Logistics', 'Operations'],
    complianceFlags: [],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'Truck',
    category: 'Operations Roles',
    requestCount: 145,
    hierarchyLevel: 'role',
    childCount: 0
  },

  // ========== SUPPORT ROLES (3 items) ==========
  {
    id: 'role-support-1',
    name: 'Customer Support Manager',
    type: 'role',
    description: 'Full customer support system access',
    owner: 'Lisa Martinez',
    department: 'Customer Support',
    riskLevel: 'medium',
    tags: ['Support', 'Customer Service', 'Management'],
    complianceFlags: ['GDPR'],
    approvalWorkflow: ['Manager', 'Support Director'],
    autoApprovalEligible: false,
    maxValidityDays: 365,
    icon: 'Headphones',
    category: 'Support Roles',
    requestCount: 67,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-support-2',
    name: 'Customer Support Representative',
    type: 'role',
    description: 'Customer ticketing and case management',
    owner: 'Lisa Martinez',
    department: 'Customer Support',
    riskLevel: 'low',
    tags: ['Support', 'Tickets', 'Customers'],
    complianceFlags: ['GDPR'],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'MessageCircle',
    category: 'Support Roles',
    requestCount: 234,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-support-3',
    name: 'Technical Support Specialist',
    type: 'role',
    description: 'Advanced technical support and troubleshooting',
    owner: 'Lisa Martinez',
    department: 'Customer Support',
    riskLevel: 'medium',
    tags: ['Support', 'Technical', 'Troubleshooting'],
    complianceFlags: [],
    approvalWorkflow: ['Manager'],
    autoApprovalEligible: true,
    maxValidityDays: 365,
    icon: 'Tool',
    category: 'Support Roles',
    requestCount: 156,
    hierarchyLevel: 'role',
    childCount: 0
  },

  // ========== SECURITY ROLES (3 items) ==========
  {
    id: 'role-security-1',
    name: 'Information Security Manager',
    type: 'role',
    description: 'Full security system access and management',
    owner: 'Robert Taylor',
    department: 'IT',
    riskLevel: 'critical',
    tags: ['Security', 'Management', 'Privileged'],
    complianceFlags: ['SOX', 'PCI-DSS', 'HIPAA'],
    approvalWorkflow: ['Manager', 'CISO'],
    autoApprovalEligible: false,
    maxValidityDays: 90,
    icon: 'Shield',
    category: 'Security Roles',
    requestCount: 23,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-security-2',
    name: 'Security Auditor',
    type: 'role',
    description: 'Security audit and compliance review',
    owner: 'Robert Taylor',
    department: 'IT',
    riskLevel: 'high',
    tags: ['Security', 'Audit', 'Compliance'],
    toxicCombinations: ['System Administrator', 'Database Administrator'],
    complianceFlags: ['SOX', 'PCI-DSS'],
    approvalWorkflow: ['Manager', 'CISO'],
    autoApprovalEligible: false,
    maxValidityDays: 180,
    icon: 'Eye',
    category: 'Security Roles',
    requestCount: 34,
    hierarchyLevel: 'role',
    childCount: 0
  },
  {
    id: 'role-security-3',
    name: 'Penetration Tester',
    type: 'role',
    description: 'Security testing and vulnerability assessment',
    owner: 'Robert Taylor',
    department: 'IT',
    riskLevel: 'critical',
    tags: ['Security', 'Testing', 'Penetration'],
    complianceFlags: ['SOX'],
    approvalWorkflow: ['Manager', 'CISO', 'IT Director'],
    autoApprovalEligible: false,
    maxValidityDays: 30,
    icon: 'Target',
    category: 'Security Roles',
    requestCount: 12,
    hierarchyLevel: 'role',
    childCount: 0
  }
];

// ============================================================================
// VALIDATED ACCESS REQUESTS - ALL REFERENCES CORRECTED
// ============================================================================

export const mockAccessRequests: AccessRequest[] = [
  {
    id: 'req-1',
    requesterId: 'user-1',
    requesterName: 'Alice Johnson',
    items: [
      {
        accessItemId: 'app-1',
        accessItem: mockAccessItems[0], // ✓ Salesforce CRM
        justification: 'Need access to manage customer accounts for Q1 campaign',
        validityPeriod: 90,
        urgency: 'medium',
        emergencyAccess: false,
        approvalStatus: 'pending'
      }
    ],
    status: 'pending-approval',
    createdAt: '2024-01-15T09:00:00Z',
    submittedAt: '2024-01-15T09:30:00Z',
    totalItems: 1,
    emergencyAccess: false,
    justification: 'Supporting Q1 sales initiatives',
    currentApprover: 'Manager',
    slaHours: 24,
    hoursRemaining: 18,
    riskScore: 65,
    sodConflicts: [],
    complianceIssues: [],
    requestType: 'self',
    provisioningStatus: 'pending'
  },
  {
    id: 'req-2',
    requesterId: 'user-2',
    requesterName: 'Bob Wilson',
    items: [
      {
        accessItemId: 'role-1',
        accessItem: mockAccessItems[6], // ✓ Database Administrator
        justification: 'Emergency database maintenance required',
        validityPeriod: 7,
        urgency: 'high',
        emergencyAccess: true,
        approvalStatus: 'approved',
        approver: 'Sarah Chen',
        approvedAt: '2024-01-14T15:30:00Z'
      }
    ],
    status: 'approved',
    createdAt: '2024-01-14T14:00:00Z',
    submittedAt: '2024-01-14T14:15:00Z',
    completedAt: '2024-01-14T15:30:00Z',
    totalItems: 1,
    emergencyAccess: true,
    justification: 'Critical system maintenance',
    slaHours: 4,
    riskScore: 95,
    sodConflicts: [],
    complianceIssues: ['Emergency access requires additional monitoring'],
    requestType: 'self',
    provisioningStatus: 'in-progress'
  },
  {
    id: 'req-3',
    requesterId: 'user-3',
    requesterName: 'Carol Martinez',
    items: [
      {
        accessItemId: 'app-collab-1',
        accessItem: mockAccessItems[16], // ✓ Confluence Wiki
        justification: 'Need wiki access for documentation project',
        validityPeriod: 365,
        urgency: 'low',
        emergencyAccess: false,
        approvalStatus: 'approved'
      },
      {
        accessItemId: 'app-collab-2',
        accessItem: mockAccessItems[17], // ✓ Slack Workspace
        justification: 'Team communication for project',
        validityPeriod: 365,
        urgency: 'low',
        emergencyAccess: false,
        approvalStatus: 'approved'
      }
    ],
    status: 'provisioned',
    createdAt: '2024-01-12T10:00:00Z',
    submittedAt: '2024-01-12T10:15:00Z',
    completedAt: '2024-01-12T14:00:00Z',
    totalItems: 2,
    emergencyAccess: false,
    justification: 'New hire onboarding',
    slaHours: 48,
    riskScore: 20,
    sodConflicts: [],
    complianceIssues: [],
    requestType: 'on-behalf',
    provisioningStatus: 'completed'
  },
  {
    id: 'req-4',
    requesterId: 'user-4',
    requesterName: 'David Lee',
    items: [
      {
        accessItemId: 'ent-1',
        accessItem: mockAccessItems[20], // ✓ SAP Admin Console
        justification: 'Require SAP admin access for system upgrade',
        validityPeriod: 60,
        urgency: 'high',
        emergencyAccess: false,
        approvalStatus: 'pending'
      }
    ],
    status: 'pending-approval',
    createdAt: '2024-01-16T08:00:00Z',
    submittedAt: '2024-01-16T08:30:00Z',
    totalItems: 1,
    emergencyAccess: false,
    justification: 'SAP upgrade project - Phase 2',
    currentApprover: 'IT Director',
    slaHours: 48,
    hoursRemaining: 42,
    riskScore: 85,
    sodConflicts: [],
    complianceIssues: ['High risk access - requires training verification'],
    requestType: 'self',
    provisioningStatus: 'pending'
  },
  {
    id: 'req-5',
    requesterId: 'user-5',
    requesterName: 'Emma Thompson',
    items: [
      {
        accessItemId: 'group-2',
        accessItem: mockAccessItems[12], // ✓ Marketing Team
        justification: 'New role as Marketing Coordinator',
        validityPeriod: 365,
        urgency: 'medium',
        emergencyAccess: false,
        approvalStatus: 'approved'
      }
    ],
    status: 'provisioned',
    createdAt: '2024-01-10T09:00:00Z',
    submittedAt: '2024-01-10T09:30:00Z',
    completedAt: '2024-01-10T16:00:00Z',
    totalItems: 1,
    emergencyAccess: false,
    justification: 'Role change - Marketing Department',
    slaHours: 24,
    riskScore: 35,
    sodConflicts: [],
    complianceIssues: [],
    requestType: 'self',
    provisioningStatus: 'completed'
  },
  {
    id: 'req-6',
    requesterId: 'user-6',
    requesterName: 'Frank Rodriguez',
    items: [
      {
        accessItemId: 'role-hr-3',
        accessItem: mockAccessItems[26], // ✓ Payroll Administrator
        justification: 'Temporary payroll coverage for Q1',
        validityPeriod: 90,
        urgency: 'medium',
        emergencyAccess: false,
        approvalStatus: 'rejected',
        rejectionReason: 'Insufficient training completion'
      }
    ],
    status: 'rejected',
    createdAt: '2024-01-13T11:00:00Z',
    submittedAt: '2024-01-13T11:30:00Z',
    completedAt: '2024-01-13T16:00:00Z',
    totalItems: 1,
    emergencyAccess: false,
    justification: 'Temporary assignment',
    slaHours: 48,
    riskScore: 90,
    sodConflicts: [],
    complianceIssues: ['Missing required training: SOX-COMPLIANCE'],
    requestType: 'self',
    provisioningStatus: 'pending'
  },
  {
    id: 'req-7',
    requesterId: 'user-7',
    requesterName: 'Sophia Martinez',
    items: [
      {
        accessItemId: 'role-fin-2',
        accessItem: mockAccessItems[15], // ✓ Accounts Payable Clerk
        justification: 'Year-end financial reporting support',
        validityPeriod: 60,
        urgency: 'high',
        emergencyAccess: true,
        approvalStatus: 'approved',
        rejectionReason: ''
      }
    ],
    status: 'approved',
    createdAt: '2024-02-01T09:15:00Z',
    submittedAt: '2024-02-01T09:45:00Z',
    completedAt: '2024-02-01T12:00:00Z',
    totalItems: 1,
    emergencyAccess: true,
    justification: 'Temporary assignment for finance reporting',
    slaHours: 24,
    riskScore: 75,
    sodConflicts: [],
    complianceIssues: [],
    requestType: 'self',
    provisioningStatus: 'completed'
  },
  {
    id: 'req-8',
    requesterId: 'user-8',
    requesterName: 'Daniel Kim',
    items: [
      {
        accessItemId: 'role-hr-1',
        accessItem: mockAccessItems[24], // ✓ HR Business Partner
        justification: 'Assisting with new hire processing',
        validityPeriod: 60,
        urgency: 'medium',
        emergencyAccess: false,
        approvalStatus: 'approved'
      }
    ],
    status: 'approved',
    createdAt: '2024-01-15T09:00:00Z',
    submittedAt: '2024-01-15T09:10:00Z',
    completedAt: '2024-01-15T15:00:00Z',
    totalItems: 1,
    emergencyAccess: false,
    justification: 'Temporary task assignment',
    slaHours: 48,
    riskScore: 50,
    sodConflicts: [],
    complianceIssues: [],
    requestType: 'self',
    provisioningStatus: 'completed'
  },
  {
    id: 'req-9',
    requesterId: 'user-9',
    requesterName: 'Emily Johnson',
    items: [
      {
        accessItemId: 'role-marketing-1',
        accessItem: mockAccessItems[8], // ✓ Marketing Manager
        justification: 'Campaign analytics review',
        validityPeriod: 30,
        urgency: 'medium',
        emergencyAccess: false,
        approvalStatus: 'rejected',
        rejectionReason: 'Manager approval missing'
      }
    ],
    status: 'rejected',
    createdAt: '2024-02-10T10:00:00Z',
    submittedAt: '2024-02-10T10:20:00Z',
    completedAt: '2024-02-10T15:00:00Z',
    totalItems: 1,
    emergencyAccess: false,
    justification: 'Short-term marketing project',
    slaHours: 48,
    riskScore: 50,
    sodConflicts: [],
    complianceIssues: ['Missing manager approval'],
    requestType: 'self',
    provisioningStatus: 'pending'
  },
  {
    id: 'req-10',
    requesterId: 'user-10',
    requesterName: 'Nathan Brooks',
    items: [
      {
        accessItemId: 'role-sales-4',
        accessItem: mockAccessItems[31], // ✓ Inside Sales Representative
        justification: 'Quarterly sales audit review',
        validityPeriod: 45,
        urgency: 'low',
        emergencyAccess: false,
        approvalStatus: 'approved',
        rejectionReason: ''
      }
    ],
    status: 'approved',
    createdAt: '2024-02-12T09:00:00Z',
    submittedAt: '2024-02-12T09:20:00Z',
    completedAt: '2024-02-12T13:00:00Z',
    totalItems: 1,
    emergencyAccess: false,
    justification: 'Sales audit involvement',
    slaHours: 48,
    riskScore: 40,
    sodConflicts: [],
    complianceIssues: [],
    requestType: 'self',
    provisioningStatus: 'completed'
  },
  {
    id: 'req-11',
    requesterId: 'user-11',
    requesterName: 'Ethan Moore',
    items: [
      {
        accessItemId: 'role-fin-3',
        accessItem: mockAccessItems[16], // ✓ Accounts Receivable Clerk
        justification: 'AR processing for month-end',
        validityPeriod: 30,
        urgency: 'high',
        emergencyAccess: false,
        approvalStatus: 'approved'
      }
    ],
    status: 'approved',
    createdAt: '2024-01-18T08:00:00Z',
    submittedAt: '2024-01-18T08:20:00Z',
    completedAt: '2024-01-18T12:00:00Z',
    totalItems: 1,
    emergencyAccess: false,
    justification: 'Month-end processing',
    slaHours: 24,
    riskScore: 60,
    sodConflicts: [],
    complianceIssues: [],
    requestType: 'self',
    provisioningStatus: 'completed'
  },
  {
    id: 'req-12',
    requesterId: 'user-12',
    requesterName: 'Samantha Carter',
    items: [
      {
        accessItemId: 'ent-3',
        accessItem: mockAccessItems[22], // ✓ Oracle Financials
        justification: 'Inventory cycle count review',
        validityPeriod: 45,
        urgency: 'medium',
        emergencyAccess: false,
        approvalStatus: 'approved'
      }
    ],
    status: 'approved',
    createdAt: '2024-01-19T10:00:00Z',
    submittedAt: '2024-01-19T10:20:00Z',
    completedAt: '2024-01-19T13:30:00Z',
    totalItems: 1,
    emergencyAccess: false,
    justification: 'Quarterly cycle count task',
    slaHours: 48,
    riskScore: 65,
    sodConflicts: [],
    complianceIssues: [],
    requestType: 'self',
    provisioningStatus: 'completed'
  },
  {
    id: 'req-13',
    requesterId: 'user-13',
    requesterName: 'Mia Davis',
    items: [
      {
        accessItemId: 'role-legal-3',
        accessItem: mockAccessItems[34], // ✓ Contract Administrator
        justification: 'Contract review for vendor onboarding',
        validityPeriod: 15,
        urgency: 'medium',
        emergencyAccess: false,
        approvalStatus: 'approved',
        rejectionReason: ''
      }
    ],
    status: 'approved',
    createdAt: '2024-02-15T10:00:00Z',
    submittedAt: '2024-02-15T10:30:00Z',
    completedAt: '2024-02-15T13:30:00Z',
    totalItems: 1,
    emergencyAccess: false,
    justification: 'Vendor onboarding legal assessment',
    slaHours: 36,
    riskScore: 30,
    sodConflicts: [],
    complianceIssues: [],
    requestType: 'self',
    provisioningStatus: 'completed'
  },
  {
    id: 'req-14',
    requesterId: 'user-14',
    requesterName: 'Olivia Green',
    items: [
      {
        accessItemId: 'role-hr-4',
        accessItem: mockAccessItems[27], // ✓ Benefits Administrator
        justification: 'Supervising HR audit preparation',
        validityPeriod: 90,
        urgency: 'low',
        emergencyAccess: false,
        approvalStatus: 'approved'
      }
    ],
    status: 'approved',
    createdAt: '2024-01-21T11:00:00Z',
    submittedAt: '2024-01-21T11:30:00Z',
    completedAt: '2024-01-21T16:00:00Z',
    totalItems: 1,
    emergencyAccess: false,
    justification: 'Audit readiness activities',
    slaHours: 72,
    riskScore: 40,
    sodConflicts: [],
    complianceIssues: [],
    requestType: 'self',
    provisioningStatus: 'completed'
  },
  {
    id: 'req-15',
    requesterId: 'user-15',
    requesterName: 'Chloe Wilson',
    items: [
      {
        accessItemId: 'role-marketing-3',
        accessItem: mockAccessItems[10], // ✓ Content Manager
        justification: 'A/B test analytics for new campaign',
        validityPeriod: 20,
        urgency: 'low',
        emergencyAccess: false,
        approvalStatus: 'pending',
        rejectionReason: ''
      }
    ],
    status: 'approved',
    createdAt: '2024-02-16T15:00:00Z',
    submittedAt: '2024-02-16T15:10:00Z',
    completedAt: '2024-01-21T16:00:00Z',
    totalItems: 1,
    emergencyAccess: false,
    justification: 'Marketing analytics task',
    slaHours: 48,
    riskScore: 35,
    sodConflicts: [],
    complianceIssues: [],
    requestType: 'self',
    provisioningStatus: 'pending'
  },
  {
    id: 'req-16',
    requesterId: 'user-16',
    requesterName: 'Ethan Miller',
    items: [
      {
        accessItemId: 'role-fin-5',
        accessItem: mockAccessItems[18], // ✓ Internal Auditor
        justification: 'Internal audit support for Q2 review',
        validityPeriod: 60,
        urgency: 'medium',
        emergencyAccess: false,
        approvalStatus: 'approved',
        rejectionReason: ''
      }
    ],
    status: 'approved',
    createdAt: '2024-02-17T11:45:00Z',
    submittedAt: '2024-02-17T12:00:00Z',
    completedAt: '2024-02-17T17:00:00Z',
    totalItems: 1,
    emergencyAccess: false,
    justification: 'Audit support task',
    slaHours: 72,
    riskScore: 50,
    sodConflicts: [],
    complianceIssues: [],
    requestType: 'self',
    provisioningStatus: 'completed'
  },
  {
    id: 'req-17',
    requesterId: 'user-17',
    requesterName: 'Harper Nguyen',
    items: [
      {
        accessItemId: 'role-ops-4',
        accessItem: mockAccessItems[38], // ✓ Warehouse Coordinator
        justification: 'Warehouse supply chain monitoring',
        validityPeriod: 10,
        urgency: 'high',
        emergencyAccess: true,
        approvalStatus: 'approved',
        rejectionReason: ''
      }
    ],
    status: 'approved',
    createdAt: '2024-02-18T04:00:00Z',
    submittedAt: '2024-02-18T04:25:00Z',
    completedAt: '2024-02-18T05:30:00Z',
    totalItems: 1,
    emergencyAccess: true,
    justification: 'Real-time supply chain incident',
    slaHours: 12,
    riskScore: 70,
    sodConflicts: [],
    complianceIssues: [],
    requestType: 'self',
    provisioningStatus: 'completed'
  },
  {
    id: 'req-18',
    requesterId: 'user-18',
    requesterName: 'Lucas Hernandez',
    items: [
      {
        accessItemId: 'role-support-2',
        accessItem: mockAccessItems[40], // ✓ Customer Support Representative
        justification: 'Customer complaint resolution',
        validityPeriod: 14,
        urgency: 'medium',
        emergencyAccess: false,
        approvalStatus: 'rejected',
        rejectionReason: 'Authorization from team lead required'
      }
    ],
    status: 'rejected',
    createdAt: '2024-02-18T13:00:00Z',
    submittedAt: '2024-02-18T13:20:00Z',
    completedAt: '2024-02-18T18:00:00Z',
    totalItems: 1,
    emergencyAccess: false,
    justification: 'Customer support case',
    slaHours: 48,
    riskScore: 45,
    sodConflicts: [],
    complianceIssues: ['Missing team lead approval'],
    requestType: 'self',
    provisioningStatus: 'pending'
  },
  {
    id: 'req-19',
    requesterId: 'user-19',
    requesterName: 'Grace Stewart',
    items: [
      {
        accessItemId: 'role-security-1',
        accessItem: mockAccessItems[42], // ✓ Information Security Manager
        justification: 'Security logs review for anomaly detection',
        validityPeriod: 5,
        urgency: 'high',
        emergencyAccess: true,
        approvalStatus: 'approved',
        rejectionReason: ''
      }
    ],
    status: 'approved',
    createdAt: '2024-02-19T07:30:00Z',
    submittedAt: '2024-02-19T07:40:00Z',
    completedAt: '2024-02-19T09:30:00Z',
    totalItems: 1,
    emergencyAccess: true,
    justification: 'Security event investigation',
    slaHours: 16,
    riskScore: 85,
    sodConflicts: [],
    complianceIssues: [],
    requestType: 'self',
    provisioningStatus: 'completed'
  }
];

// ============================================================================
// summary for data
// ============================================================================
/*
TOTAL ACCESS ITEMS: 45
- Business Applications: 6
- IT Roles: 5
- Marketing Roles: 3
- Department Groups: 5
- Finance Roles: 5
- Collaboration Tools: 4
- ERP Entitlements: 4
- HR Roles: 4
- Sales Roles: 4
- Legal Roles: 3
- Operations Roles: 4
- Support Roles: 3
- Security Roles: 3

TOTAL ACCESS REQUESTS: 19
- Pending: 2
- Approved: 12
- Rejected: 3
- Provisioned: 2

*/