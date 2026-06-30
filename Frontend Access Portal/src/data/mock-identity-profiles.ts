export interface IdentityProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  jobTitle: string;
  manager: string;
  startDate: string;
  workLocation: string;
  lastLogin: string;
  probationEndDate?: string;
  type: "Employee" | "Contractor" | "Service Account" | "Partner";
  status: "Active" | "Inactive" | "Suspended" | "Pending" | "Terminated" | "Expired" | "Archived";
  riskLevel: "Low" | "Medium" | "High";
  accounts: IdentityAccount[];
  access: IdentityAccess[];
  activity: IdentityActivity[];
  riskEvents: RiskEvent[];
  policies: PolicyCompliance[];
  aiInsights: AIInsight[];
}

export interface IdentityAccount {
  id: string;
  application: string;
  accountId: string;
  status: "Active" | "Suspended" | "Disabled";
  provisionedOn: string;
  lastSynced: string;
  authType: "LDAP" | "OAuth" | "SAML" | "Local";
  lastUsed?: string;
}

export interface IdentityAccess {
  id: string;
  roleName: string;
  type: "Business" | "Technical" | "Administrative";
  entitlements: string[];
  status: "Active" | "Pending Review" | "Suspended";
  assignedOn: string;
  source: "Manual Request" | "Role-Based" | "Rule-Based" | "Birthright";
  expiresOn?: string;
  owner?: string;
}

export interface IdentityActivity {
  id: string;
  timestamp: string;
  eventType:
    | "Login"
    | "Access Request"
    | "Role Assignment"
    | "Entitlement Revoked"
    | "Policy Violation";
  source: string;
  description: string;
  ipAddress?: string;
  riskScore?: number;
}

export interface RiskEvent {
  id: string;
  riskType: string;
  detectedOn: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  source: string;
  actionTaken: string;
  status: "Open" | "In Progress" | "Resolved";
  description: string;
}

export interface PolicyCompliance {
  id: string;
  policyName: string;
  status: "Compliant" | "Violated" | "Under Review";
  evaluationDate: string;
  complianceImpact: "None" | "Low" | "Medium" | "High";
  linkedObject: string;
  description: string;
}

export interface AIInsight {
  id: string;
  type: "Insight" | "Recommendation" | "Anomaly";
  title: string;
  description: string;
  confidence: number;
  generatedOn: string;
  category: "Access" | "Risk" | "Compliance" | "Optimization";
}

export const mockIdentityProfiles: IdentityProfile[] = [
  {
    id: "usr_1",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    department: "Engineering",
    jobTitle: "Senior Software Engineer",
    manager: "Jane Smith",
    startDate: "2023-01-15",
    workLocation: "Hybrid",
    lastLogin: "2025-01-26 09:30 AM",
    type: "Employee",
    status: "Active",
    riskLevel: "High",
    accounts: [
      {
        id: "acc_1",
        application: "Active Directory",
        accountId: "sjohnson",
        status: "Active",
        provisionedOn: "2023-01-15",
        lastSynced: "2025-01-25 10:00 AM",
        authType: "LDAP",
        lastUsed: "2025-01-26 09:30 AM",
      },
      {
        id: "acc_2",
        application: "GitHub Enterprise",
        accountId: "sarah.j",
        status: "Suspended",
        provisionedOn: "2023-01-16",
        lastSynced: "2025-01-20 02:33 PM",
        authType: "OAuth",
        lastUsed: "2025-01-19 04:22 PM",
      },
      {
        id: "acc_3",
        application: "AWS Console",
        accountId: "sjohn-engineer",
        status: "Active",
        provisionedOn: "2023-01-18",
        lastSynced: "2025-01-26 08:55 AM",
        authType: "SAML",
        lastUsed: "2025-01-26 08:55 AM",
      },
      {
        id: "acc_4",
        application: "Jira",
        accountId: "sarah.johnson",
        status: "Active",
        provisionedOn: "2023-01-16",
        lastSynced: "2025-01-26 07:12 AM",
        authType: "SAML",
        lastUsed: "2025-01-25 02:18 PM",
      },
    ],
    access: [
      {
        id: "role_1",
        roleName: "Engineering Developer",
        type: "Business",
        entitlements: [
          "VPN Access",
          "GitHub RW",
          "AWS Console Access",
          "Jira Developer",
        ],
        status: "Active",
        assignedOn: "2023-01-15",
        source: "Role-Based",
        owner: "Jane Smith",
      },
      {
        id: "role_2",
        roleName: "Privileged Access Reviewer",
        type: "Technical",
        entitlements: ["IAM:ViewLogs", "IAM:EditUsers", "Security Dashboard"],
        status: "Pending Review",
        assignedOn: "2025-01-10",
        source: "Manual Request",
        expiresOn: "2025-04-10",
        owner: "Security Team",
      },
      {
        id: "role_3",
        roleName: "Production Support",
        type: "Technical",
        entitlements: [
          "Production Logs",
          "Database ReadOnly",
          "Monitoring Tools",
        ],
        status: "Active",
        assignedOn: "2024-06-20",
        source: "Rule-Based",
        owner: "DevOps Team",
      },
    ],
    activity: [
      {
        id: "act_1",
        timestamp: "2025-01-26 09:30 AM",
        eventType: "Login",
        source: "AD",
        description: "Login success from corporate network",
        ipAddress: "192.168.1.12",
        riskScore: 10,
      },
      {
        id: "act_2",
        timestamp: "2025-01-25 05:12 PM",
        eventType: "Access Request",
        source: "Portal",
        description: "Requested AWS Console ReadOnly access",
        riskScore: 25,
      },
      {
        id: "act_3",
        timestamp: "2025-01-24 01:48 PM",
        eventType: "Role Assignment",
        source: "Auto Rule",
        description: "Assigned: Privileged Access Reviewer",
        riskScore: 60,
      },
      {
        id: "act_4",
        timestamp: "2025-01-20 02:33 PM",
        eventType: "Entitlement Revoked",
        source: "GitHub",
        description: "GitHub Admin Access removed post review",
        riskScore: 40,
      },
      {
        id: "act_5",
        timestamp: "2025-01-19 11:22 AM",
        eventType: "Policy Violation",
        source: "Compliance Engine",
        description: "SoD violation detected: Dev & Reviewer roles",
        riskScore: 85,
      },
    ],
    riskEvents: [
      {
        id: "risk_1",
        riskType: "SoD Violation: Dev & Reviewer",
        detectedOn: "2025-01-20",
        severity: "High",
        source: "SoD Policy 4.5",
        actionTaken: "Review Scheduled",
        status: "In Progress",
        description:
          "User holds both development and reviewer privileges creating segregation of duties conflict",
      },
      {
        id: "risk_2",
        riskType: "Privilege Creep Detected",
        detectedOn: "2025-01-18",
        severity: "Medium",
        source: "Access AI Engine",
        actionTaken: "Manager Notified",
        status: "Open",
        description:
          "User has accumulated 3 additional privileged entitlements over 6 months",
      },
      {
        id: "risk_3",
        riskType: "Orphan Entitlement Risk",
        detectedOn: "2025-01-17",
        severity: "Low",
        source: "Governance Scan",
        actionTaken: "Under Review",
        status: "Open",
        description: "Production Support role has not been used in 30 days",
      },
    ],
    policies: [
      {
        id: "pol_1",
        policyName: "SoD Policy 4.5 – Dev vs Reviewer",
        status: "Violated",
        evaluationDate: "2025-01-20",
        complianceImpact: "High",
        linkedObject: "Privileged Reviewer",
        description:
          "Users cannot hold both development and approval privileges simultaneously",
      },
      {
        id: "pol_2",
        policyName: "Account Termination SLA",
        status: "Compliant",
        evaluationDate: "2025-01-15",
        complianceImpact: "None",
        linkedObject: "AD Account",
        description:
          "Account termination processes must complete within 24 hours",
      },
      {
        id: "pol_3",
        policyName: "Role Expiry Enforcement",
        status: "Compliant",
        evaluationDate: "2025-01-25",
        complianceImpact: "None",
        linkedObject: "Engineering Developer",
        description:
          "All roles must have defined expiration dates and renewal processes",
      },
    ],
    aiInsights: [
      {
        id: "ai_1",
        type: "Insight",
        title: "Long-term Privileged Access",
        description:
          "Sarah Johnson has retained 2 privileged entitlements for over 14 months without review",
        confidence: 0.89,
        generatedOn: "2025-01-26",
        category: "Access",
      },
      {
        id: "ai_2",
        type: "Recommendation",
        title: "Peer-based Role Optimization",
        description:
          "Current access overlaps 82% with 3 peer engineers; opportunity to optimize role assignment",
        confidence: 0.76,
        generatedOn: "2025-01-25",
        category: "Optimization",
      },
      {
        id: "ai_3",
        type: "Recommendation",
        title: "SoD Enforcement Window",
        description:
          "Reevaluate SoD enforcement window to prevent future violations",
        confidence: 0.92,
        generatedOn: "2025-01-24",
        category: "Compliance",
      },
      {
        id: "ai_4",
        type: "Anomaly",
        title: "Unusual Access Pattern",
        description:
          "GitHub access suspended but AWS usage increased 40% - investigate correlation",
        confidence: 0.68,
        generatedOn: "2025-01-23",
        category: "Risk",
      },
    ],
  },
  {
    id: "usr_2",
    name: "Michael Chen",
    email: "michael.chen@company.com",
    department: "Marketing",
    jobTitle: "Marketing Manager",
    manager: "Bob Brown",
    startDate: "2022-03-10",
    workLocation: "Remote",
    lastLogin: "2025-01-25 02:15 PM",
    type: "Employee",
    status: "Active",
    riskLevel: "Medium",
    accounts: [
      {
        id: "acc_5",
        application: "Active Directory",
        accountId: "mchen",
        status: "Active",
        provisionedOn: "2022-03-10",
        lastSynced: "2025-01-25 02:15 PM",
        authType: "LDAP",
        lastUsed: "2025-01-25 02:15 PM",
      },
      {
        id: "acc_6",
        application: "Salesforce",
        accountId: "michael.chen",
        status: "Active",
        provisionedOn: "2022-03-11",
        lastSynced: "2025-01-25 01:45 PM",
        authType: "SAML",
        lastUsed: "2025-01-25 01:45 PM",
      },
      {
        id: "acc_7",
        application: "HubSpot",
        accountId: "mchen",
        status: "Active",
        provisionedOn: "2022-03-12",
        lastSynced: "2025-01-24 04:30 PM",
        authType: "OAuth",
        lastUsed: "2025-01-24 04:30 PM",
      },
    ],
    access: [
      {
        id: "role_4",
        roleName: "Marketing Manager",
        type: "Business",
        entitlements: [
          "CRM Full Access",
          "Marketing Automation",
          "Analytics Dashboard",
          "Campaign Management",
        ],
        status: "Active",
        assignedOn: "2022-03-10",
        source: "Role-Based",
        owner: "Bob Brown",
      },
      {
        id: "role_5",
        roleName: "Data Export Specialist",
        type: "Technical",
        entitlements: [
          "Customer Data Export",
          "Report Generation",
          "Data Privacy Tools",
        ],
        status: "Active",
        assignedOn: "2023-08-15",
        source: "Manual Request",
        owner: "Data Team",
      },
    ],
    activity: [
      {
        id: "act_6",
        timestamp: "2025-01-25 02:15 PM",
        eventType: "Login",
        source: "AD",
        description: "Login success from home office",
        ipAddress: "72.14.199.45",
        riskScore: 15,
      },
      {
        id: "act_7",
        timestamp: "2025-01-24 04:30 PM",
        eventType: "Access Request",
        source: "Portal",
        description: "Requested additional HubSpot integrations",
        riskScore: 20,
      },
      {
        id: "act_8",
        timestamp: "2025-01-23 09:22 AM",
        eventType: "Role Assignment",
        source: "Manager",
        description: "Temporary admin access for Q1 campaign",
        riskScore: 45,
      },
    ],
    riskEvents: [
      {
        id: "risk_4",
        riskType: "Data Access Anomaly",
        detectedOn: "2025-01-22",
        severity: "Medium",
        source: "DLP System",
        actionTaken: "Investigation Started",
        status: "In Progress",
        description: "Unusual volume of customer data exports detected",
      },
      {
        id: "risk_5",
        riskType: "Remote Access Pattern",
        detectedOn: "2025-01-20",
        severity: "Low",
        source: "Behavioral Analytics",
        actionTaken: "Monitoring Enabled",
        status: "Open",
        description: "Login pattern from new geographic location",
      },
    ],
    policies: [
      {
        id: "pol_4",
        policyName: "Data Export Compliance",
        status: "Under Review",
        evaluationDate: "2025-01-22",
        complianceImpact: "Medium",
        linkedObject: "Data Export Specialist",
        description: "Data export activities must be logged and approved",
      },
      {
        id: "pol_5",
        policyName: "Remote Work Policy",
        status: "Compliant",
        evaluationDate: "2025-01-20",
        complianceImpact: "None",
        linkedObject: "All Accounts",
        description: "Remote access must use approved VPN connections",
      },
    ],
    aiInsights: [
      {
        id: "ai_5",
        type: "Insight",
        title: "Marketing Campaign Access Pattern",
        description:
          "Access patterns correlate with quarterly campaign cycles - consider temporary role automation",
        confidence: 0.73,
        generatedOn: "2025-01-25",
        category: "Optimization",
      },
      {
        id: "ai_6",
        type: "Recommendation",
        title: "Data Export Monitoring",
        description:
          "Implement automated monitoring for data export activities exceeding baseline",
        confidence: 0.81,
        generatedOn: "2025-01-24",
        category: "Compliance",
      },
    ],
  },
  {
    id: "usr_3",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    department: "Finance",
    jobTitle: "Financial Analyst",
    manager: "David Kim",
    startDate: "2024-09-01",
    workLocation: "Office",
    lastLogin: "2025-01-26 08:45 AM",
    probationEndDate: "2025-03-01",
    type: "Employee",
    status: "Active",
    riskLevel: "Low",
    accounts: [
      {
        id: "acc_8",
        application: "Active Directory",
        accountId: "erodriguez",
        status: "Active",
        provisionedOn: "2024-09-01",
        lastSynced: "2025-01-26 08:45 AM",
        authType: "LDAP",
        lastUsed: "2025-01-26 08:45 AM",
      },
      {
        id: "acc_9",
        application: "SAP",
        accountId: "emily.r",
        status: "Active",
        provisionedOn: "2024-09-02",
        lastSynced: "2025-01-26 07:30 AM",
        authType: "SAML",
        lastUsed: "2025-01-26 07:30 AM",
      },
      {
        id: "acc_10",
        application: "Workday",
        accountId: "erodriguez",
        status: "Active",
        provisionedOn: "2024-09-01",
        lastSynced: "2025-01-25 05:00 PM",
        authType: "SAML",
        lastUsed: "2025-01-25 05:00 PM",
      },
    ],
    access: [
      {
        id: "role_6",
        roleName: "Financial Analyst",
        type: "Business",
        entitlements: [
          "Financial Reports",
          "Budget Access",
          "GL Inquiry",
          "Expense Management",
        ],
        status: "Active",
        assignedOn: "2024-09-01",
        source: "Birthright",
        owner: "David Kim",
      },
      {
        id: "role_7",
        roleName: "New Employee",
        type: "Administrative",
        entitlements: [
          "Basic IT Access",
          "Email",
          "File Shares",
          "Training Portal",
        ],
        status: "Active",
        assignedOn: "2024-09-01",
        source: "Birthright",
        expiresOn: "2025-03-01",
        owner: "HR Team",
      },
    ],
    activity: [
      {
        id: "act_9",
        timestamp: "2025-01-26 08:45 AM",
        eventType: "Login",
        source: "AD",
        description: "Login success from office workstation",
        ipAddress: "192.168.2.45",
        riskScore: 5,
      },
      {
        id: "act_10",
        timestamp: "2025-01-25 03:22 PM",
        eventType: "Access Request",
        source: "Portal",
        description: "Requested access to month-end reports",
        riskScore: 15,
      },
      {
        id: "act_11",
        timestamp: "2025-01-24 11:15 AM",
        eventType: "Role Assignment",
        source: "Manager",
        description: "Granted temporary access to quarterly forecasting",
        riskScore: 25,
      },
    ],
    riskEvents: [
      {
        id: "risk_6",
        riskType: "New Employee Monitoring",
        detectedOn: "2025-01-15",
        severity: "Low",
        source: "HR Policy",
        actionTaken: "Probation Review Scheduled",
        status: "Open",
        description: "New employee access patterns under standard monitoring",
      },
    ],
    policies: [
      {
        id: "pol_6",
        policyName: "New Employee Probation",
        status: "Compliant",
        evaluationDate: "2025-01-15",
        complianceImpact: "Low",
        linkedObject: "New Employee",
        description:
          "New employees under probation have restricted access levels",
      },
      {
        id: "pol_7",
        policyName: "Financial Data Access",
        status: "Compliant",
        evaluationDate: "2025-01-25",
        complianceImpact: "None",
        linkedObject: "Financial Analyst",
        description: "Financial data access must be logged and audited",
      },
    ],
    aiInsights: [
      {
        id: "ai_7",
        type: "Insight",
        title: "Rapid Learning Curve",
        description:
          "New employee showing accelerated access pattern adoption - consider advanced training",
        confidence: 0.67,
        generatedOn: "2025-01-25",
        category: "Optimization",
      },
      {
        id: "ai_8",
        type: "Recommendation",
        title: "Probation Period Optimization",
        description:
          "Access patterns suggest early probation completion consideration",
        confidence: 0.54,
        generatedOn: "2025-01-24",
        category: "Access",
      },
    ],
  },
  {
    id: "usr_4",
    name: "API Service",
    email: "api-service@company.com",
    department: "Backend",
    jobTitle: "Service Account",
    manager: "N/A",
    startDate: "2024-01-01",
    workLocation: "Cloud",
    lastLogin: "2025-01-26 11:00 AM",
    type: "Service Account",
    status: "Active",
    riskLevel: "High",
    accounts: [
      {
        id: "acc_4",
        application: "AWS",
        accountId: "svc-api-prod",
        status: "Active",
        provisionedOn: "2024-01-01",
        lastSynced: "2025-06-15 10:00 AM",
        authType: "Local",
        lastUsed: "2025-01-26 11:00 AM",
      },
      {
        id: "acc_5",
        application: "GCP",
        accountId: "api-service@project.iam.gserviceaccount.com",
        status: "Active",
        provisionedOn: "2024-01-01",
        lastSynced: "2025-06-15 10:00 AM",
        authType: "Local",
        lastUsed: "2025-01-26 11:00 AM",
      },
      {
        id: "acc_19",
        application: "GitHub",
        accountId: "svc-github-actions",
        status: "Active",
        provisionedOn: "2024-01-01",
        lastSynced: "2025-06-15 10:00 AM",
        authType: "Local",
        lastUsed: "2025-01-26 11:00 AM",
      },
    ],
    access: [
      {
        id: "role_svc_1",
        roleName: "Service Account - API",
        type: "Technical",
        entitlements: [
          "compute.admin",
          "storage.objectAdmin",
          "github.actions",
        ],
        status: "Active",
        assignedOn: "2024-01-01",
        source: "Rule-Based",
        owner: "DevOps Team",
      },
    ],
    activity: [
      {
        id: "act_svc_1",
        timestamp: "2025-01-26 11:00 AM",
        eventType: "Login",
        source: "API",
        description: "Automated service authentication",
        riskScore: 5,
      },
    ],
    riskEvents: [
      {
        id: "risk_svc_1",
        riskType: "Orphaned Service Account",
        detectedOn: "2025-01-20",
        severity: "High",
        source: "Governance Scan",
        actionTaken: "Review Required",
        status: "Open",
        description: "Service account with no clear owner or documentation",
      },
    ],
    policies: [
      {
        id: "pol_svc_1",
        policyName: "Service Account Governance",
        status: "Violated",
        evaluationDate: "2025-01-20",
        complianceImpact: "High",
        linkedObject: "Service Account - API",
        description:
          "Service accounts must have documented owners and regular reviews",
      },
    ],
    aiInsights: [
      {
        id: "ai_svc_1",
        type: "Insight",
        title: "Orphaned Service Account Risk",
        description:
          "This service account lacks proper ownership documentation and governance",
        confidence: 0.95,
        generatedOn: "2025-01-26",
        category: "Risk",
      },
    ],
  },
  {
    id: "usr_5",
    name: "Charlie Davis",
    email: "charlie.davis@company.com",
    department: "Sales",
    jobTitle: "Sales Executive",
    manager: "Bob Brown",
    startDate: "2023-05-15",
    workLocation: "Office",
    lastLogin: "2025-06-01 09:00 AM",
    type: "Employee",
    status: "Suspended",
    riskLevel: "High",
    accounts: [
      {
        id: "acc_9",
        application: "Active Directory",
        accountId: "charlied",
        status: "Disabled",
        provisionedOn: "2023-05-15",
        lastSynced: "2025-06-01 10:00 AM",
        authType: "LDAP",
        lastUsed: "2025-06-01 09:00 AM",
      },
      {
        id: "acc_10",
        application: "Salesforce",
        accountId: "cdavis",
        status: "Disabled",
        provisionedOn: "2023-05-16",
        lastSynced: "2025-06-01 10:00 AM",
        authType: "SAML",
        lastUsed: "2025-06-01 09:00 AM",
      },
    ],
    access: [
      {
        id: "role_3",
        roleName: "Sales Executive",
        type: "Business",
        entitlements: [
          "Sales Manager Profile",
          "Delete Accounts",
          "VPN Access",
          "All-Employees",
        ],
        status: "Suspended",
        assignedOn: "2023-05-15",
        source: "Role-Based",
        owner: "Bob Brown",
      },
    ],
    activity: [
      {
        id: "act_8",
        timestamp: "2025-06-01 09:00 AM",
        eventType: "Entitlement Revoked",
        source: "IT Security",
        description: "Account suspended due to policy violation",
        riskScore: 90,
      },
    ],
    riskEvents: [
      {
        id: "risk_susp_1",
        riskType: "Suspended Account Risk",
        detectedOn: "2025-06-01",
        severity: "High",
        source: "Security Team",
        actionTaken: "Account Suspended",
        status: "In Progress",
        description:
          "Account suspended due to suspicious activity and policy violations",
      },
    ],
    policies: [
      {
        id: "pol_susp_1",
        policyName: "Account Suspension Policy",
        status: "Violated",
        evaluationDate: "2025-06-01",
        complianceImpact: "High",
        linkedObject: "Sales Executive",
        description:
          "Account suspended due to multiple failed login attempts and suspicious activity",
      },
    ],
    aiInsights: [
      {
        id: "ai_susp_1",
        type: "Insight",
        title: "Suspension Risk Pattern",
        description: "User showed unusual access patterns before suspension",
        confidence: 0.88,
        generatedOn: "2025-06-01",
        category: "Risk",
      },
    ],
  },
  {
    id: "usr_6",
    name: "Diana Prince",
    email: "diana.prince@company.com",
    department: "HR",
    jobTitle: "HR Business Partner",
    manager: "Jane Smith",
    startDate: "2022-08-01",
    workLocation: "Office",
    lastLogin: "2025-02-15 10:00 AM",
    type: "Employee",
    status: "Expired",
    riskLevel: "Medium",
    accounts: [
      {
        id: "acc_11",
        application: "Workday",
        accountId: "dprince",
        status: "Active",
        provisionedOn: "2022-08-01",
        lastSynced: "2025-02-10 10:00 AM",
        authType: "SAML",
        lastUsed: "2025-02-15 10:00 AM",
      },
      {
        id: "acc_12",
        application: "Active Directory",
        accountId: "dianap",
        status: "Active",
        provisionedOn: "2022-08-01",
        lastSynced: "2025-02-15 10:00 AM",
        authType: "LDAP",
        lastUsed: "2025-02-15 10:00 AM",
      },
      {
        id: "acc_21",
        application: "Salesforce",
        accountId: "diana.prince",
        status: "Active",
        provisionedOn: "2022-08-02",
        lastSynced: "2025-02-15 10:00 AM",
        authType: "SAML",
        lastUsed: "2025-02-15 10:00 AM",
      },
    ],
    access: [
      {
        id: "role_4",
        roleName: "HR Business Partner",
        type: "Business",
        entitlements: [
          "Standard User",
          "VPN Access",
          "All-Employees",
          "HR Data Access",
        ],
        status: "Active",
        assignedOn: "2022-08-01",
        source: "Role-Based",
        owner: "Jane Smith",
      },
    ],
    activity: [
      {
        id: "act_10",
        timestamp: "2025-02-15 10:00 AM",
        eventType: "Login",
        source: "AD",
        description: "Password changed",
        riskScore: 10,
      },
    ],
    riskEvents: [
      {
        id: "risk_stale_1",
        riskType: "Stale Account Risk",
        detectedOn: "2025-01-20",
        severity: "Medium",
        source: "Access Review",
        actionTaken: "Monitoring",
        status: "Open",
        description:
          "Account inactive for over 120 days but retains high-privilege access",
      },
    ],
    policies: [
      {
        id: "pol_stale_1",
        policyName: "Account Activity Policy",
        status: "Under Review",
        evaluationDate: "2025-01-20",
        complianceImpact: "Medium",
        linkedObject: "HR Business Partner",
        description:
          "Accounts inactive for 120+ days should be reviewed for access removal",
      },
    ],
    aiInsights: [
      {
        id: "ai_stale_1",
        type: "Recommendation",
        title: "Stale Account Review",
        description:
          "Account has been inactive for extended period - consider access review",
        confidence: 0.82,
        generatedOn: "2025-01-26",
        category: "Access",
      },
    ],
  },
  {
    id: "usr_7",
    name: "Orphaned Account",
    email: "unknown@company.com",
    department: "Unknown",
    jobTitle: "Unknown",
    manager: "N/A",
    startDate: "2024-01-01",
    workLocation: "Unknown",
    lastLogin: "2024-10-01 12:00 PM",
    type: "Employee",
    status: "Active",
    riskLevel: "High",
    accounts: [
      {
        id: "acc_13",
        application: "Active Directory",
        accountId: "temp-adm-01",
        status: "Active",
        provisionedOn: "2024-01-01",
        lastSynced: "2024-10-01 12:00 PM",
        authType: "LDAP",
        lastUsed: "2024-10-01 12:00 PM",
      },
    ],
    access: [
      {
        id: "role_orphan_1",
        roleName: "Legacy Admin",
        type: "Administrative",
        entitlements: ["Local Administrator", "Legacy System Access"],
        status: "Active",
        assignedOn: "2024-01-01",
        source: "Manual Request",
        owner: "Unknown",
      },
    ],
    activity: [
      {
        id: "act_orphan_1",
        timestamp: "2024-10-01 12:00 PM",
        eventType: "Login",
        source: "Legacy System",
        description: "Last recorded activity",
        riskScore: 50,
      },
    ],
    riskEvents: [
      {
        id: "risk_orphan_1",
        riskType: "Orphaned Account",
        detectedOn: "2025-01-15",
        severity: "High",
        source: "Governance Scan",
        actionTaken: "Investigation Required",
        status: "Open",
        description: "Account with no identifiable owner or manager",
      },
    ],
    policies: [
      {
        id: "pol_orphan_1",
        policyName: "Account Ownership Policy",
        status: "Violated",
        evaluationDate: "2025-01-15",
        complianceImpact: "High",
        linkedObject: "Legacy Admin",
        description: "All accounts must have identifiable owners and managers",
      },
    ],
    aiInsights: [
      {
        id: "ai_orphan_1",
        type: "Insight",
        title: "Orphaned Account Risk",
        description:
          "This account lacks proper ownership and governance controls",
        confidence: 0.99,
        generatedOn: "2025-01-26",
        category: "Risk",
      },
    ],
  },
  {
    id: "usr_8",
    name: "Brenda Wallace",
    email: "brenda.wallace@partnerco.com",
    department: "Sales",
    jobTitle: "Partner Sales Representative",
    manager: "Bob Brown",
    startDate: "2024-03-01",
    workLocation: "Remote",
    lastLogin: "2025-06-15 02:00 PM",
    type: "Partner",
    status: "Active",
    riskLevel: "Low",
    accounts: [
      {
        id: "acc_14",
        application: "Partner Portal",
        accountId: "brenda.wallace@partnerco.com",
        status: "Active",
        provisionedOn: "2024-03-01",
        lastSynced: "2025-06-15 02:00 PM",
        authType: "OAuth",
        lastUsed: "2025-06-15 02:00 PM",
      },
      {
        id: "acc_20",
        application: "Salesforce",
        accountId: "bwallace_partner",
        status: "Active",
        provisionedOn: "2024-03-01",
        lastSynced: "2025-06-14 01:00 PM",
        authType: "SAML",
        lastUsed: "2025-06-14 01:00 PM",
      },
    ],
    access: [
      {
        id: "role_5",
        roleName: "Partner Sales",
        type: "Business",
        entitlements: [
          "Standard User",
          "Partner Portal Access",
          "Sales Resources",
        ],
        status: "Active",
        assignedOn: "2024-03-01",
        source: "Birthright",
        owner: "Bob Brown",
      },
    ],
    activity: [
      {
        id: "act_11",
        timestamp: "2025-06-14 01:00 PM",
        eventType: "Access Request",
        source: "Partner Portal",
        description: "Downloaded Q2 Partner Sales Kit",
        riskScore: 5,
      },
    ],
    riskEvents: [],
    policies: [
      {
        id: "pol_partner_1",
        policyName: "Partner Access Policy",
        status: "Compliant",
        evaluationDate: "2025-06-15",
        complianceImpact: "None",
        linkedObject: "Partner Sales",
        description: "Partner access must be limited to designated resources",
      },
    ],
    aiInsights: [
      {
        id: "ai_partner_1",
        type: "Insight",
        title: "Low Risk Partner Access",
        description:
          "Partner maintains appropriate access levels with regular usage",
        confidence: 0.75,
        generatedOn: "2025-06-15",
        category: "Access",
      },
    ],
  },
];

export const getIdentityProfile = (
  userId: string
): IdentityProfile | undefined => {
  return mockIdentityProfiles.find((profile) => profile.id === userId);
};

export const getIdentityQuickStats = (profile: IdentityProfile) => {
  const rolesCount = profile.access.length;
  const accountsCount = profile.accounts.length;
  const recentActivityCount = profile.activity.filter(
    (a) =>
      new Date(a.timestamp).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length;

  const getRiskScore = (risk: string) => {
    switch (risk) {
      case "High":
        return 85;
      case "Medium":
        return 55;
      case "Low":
        return 25;
      default:
        return 0;
    }
  };

  return {
    rolesCount,
    accountsCount,
    recentActivityCount,
    riskScore: getRiskScore(profile.riskLevel),
  };
};
