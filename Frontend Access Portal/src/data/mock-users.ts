export type Account = {
  id: string;
  appName: string;
  accountName: string;
  status: "Active" | "Disabled";
  lastSync: string;
  details?: {
    type: "Permission" | "Group" | "Role";
    name: string;
    description: string;
  }[];
};

export type AccessItem = {
  id: string;
  type: "Role" | "Entitlement";
  name: string;
  description: string;
  source: "Direct" | "Inherited" | "Nested";
  risk: "Low" | "Medium" | "High";
  provisioningSource?:
    | "Birthright"
    | "Manager Assignment"
    | "Automated Rule"
    | "User Request"
    | "Exception";
  classifications?: ("PII" | "SOX" | "High Risk")[];
  lastUsed?: string;
  requestable?: boolean;
  peerDeviation?: boolean;
  roleId?: string;
  roleName?: string;
  owner?: string;
};

export type ActivityEvent = {
  id: string;
  timestamp: string;
  type: "Assignment" | "Revocation" | "Review" | "Request";
  description: string;
  actor: string;
};

export type PolicyViolation = {
  id: string;
  timestamp: string;
  policyName: string;
  description: string;
  status: "Open" | "Resolved";
};

export type RiskContributor = {
  source:
    | "Role"
    | "Entitlement"
    | "Policy"
    | "Certification Age"
    | "Identity Attribute";
  description: string;
  level: "Low" | "Medium" | "High";
};

export type User = {
  id: string;
  name: string;
  department: string;
  manager: string;
  type: "Employee" | "Contractor" | "Service Account" | "Partner";
  team: number;
  status: "Active" | "Inactive" | "Suspended" | "Pending" | "Terminated" | "Expired" | "Archived";
  lastUpdated: string;
  riskLevel: "Low" | "Medium" | "High";
  aiAnalysis: "AI Analytics" | "Pending Review" | "Flagged";
  isPrivileged?: boolean;
  isOrphan?: boolean;
  accounts?: Account[];
  access?: AccessItem[];
  activity?: ActivityEvent[];
  riskFactors?: string[];
  riskContributors?: RiskContributor[];
  policyViolations?: PolicyViolation[];
  accessVisibility?: {
    actor: string;
    role: string;
    reason: string;
    timestamp: string;
  }[];
};

export interface UserAccess {
  name: string;
  type: "role" | "group" | "entitlement";
  application: string;
  grantedDate: string;
  risk: "Low" | "Medium" | "High";
  provisioningSource:
    | "Birthright"
    | "Manager Assignment"
    | "Automated Rule"
    | "User Request"
    | "Exception";
  status: "Active" | "Pending" | "Inactive";
}

import { getIdentityProfile } from "./mock-identity-profiles";

export const mockUsers: User[] = [
  {
    id: "usr_1",
    name: "Sarah Johnson",
    department: "Engineering",
    manager: "Jane Smith",
    type: "Employee",
    team: 4,
    status: "Active",
    lastUpdated: "2025-01-26",
    riskLevel: "High",
    aiAnalysis: "AI Analytics",
    isPrivileged: true,
    accounts: [
      {
        id: "acc_1",
        appName: "Active Directory",
        accountName: "sjohnson",
        status: "Active",
        lastSync: "2025-01-25",
        details: [
          {
            type: "Group",
            name: "Domain Users",
            description: "Default group for all users.",
          },
          {
            type: "Group",
            name: "Engineering-All",
            description: "Access to engineering file shares.",
          },
        ],
      },
      {
        id: "acc_2",
        appName: "GitHub Enterprise",
        accountName: "sarah.j",
        status: "Disabled",
        lastSync: "2025-01-20",
        details: [
          {
            type: "Role",
            name: "Suspended",
            description: "Account temporarily suspended.",
          },
        ],
      },
      {
        id: "acc_3",
        appName: "AWS Console",
        accountName: "sjohn-engineer",
        status: "Active",
        lastSync: "2025-01-26",
      },
      {
        id: "acc_4",
        appName: "Jira",
        accountName: "sarah.johnson",
        status: "Active",
        lastSync: "2025-01-26",
      },
    ],
    access: [
      {
        id: "role_1",
        type: "Role",
        name: "Engineering Developer",
        description: "Standard engineering role",
        source: "Direct",
        risk: "Low",
        owner: "Jane Smith",
        lastUsed: "2025-01-26",
        peerDeviation: true,
        provisioningSource: "Manager Assignment",
      },
      {
        id: "ent_1",
        type: "Entitlement",
        name: "Privileged Access Reviewer",
        description: "Access to review privileged accounts",
        source: "Direct",
        risk: "High",
        roleId: "role_1",
        classifications: ["High Risk"],
        requestable: false,
        lastUsed: "2025-01-24",
        provisioningSource: "User Request",
      },
      {
        id: "ent_2",
        type: "Entitlement",
        name: "Production Support",
        description: "Access to production systems",
        source: "Inherited",
        risk: "High",
        roleId: "role_1",
        lastUsed: "2024-06-20",
        provisioningSource: "Automated Rule",
      },
      {
        id: "ent_3",
        type: "Entitlement",
        name: "VPN Access",
        description: "Corporate VPN access",
        source: "Inherited",
        risk: "Low",
        provisioningSource: "Birthright",
      },
      {
        id: "ent_4",
        type: "Entitlement",
        name: "GitHub RW",
        description: "GitHub read-write access",
        source: "Direct",
        risk: "Medium",
        provisioningSource: "Automated Rule",
      },
    ],
    activity: [
      {
        id: "act_1",
        timestamp: "2025-01-26 09:30 AM",
        type: "Assignment",
        description: "Login success from corporate network",
        actor: "System",
      },
      {
        id: "act_2",
        timestamp: "2025-01-25 05:12 PM",
        type: "Request",
        description: "Requested AWS Console ReadOnly access",
        actor: "Sarah Johnson",
      },
      {
        id: "act_3",
        timestamp: "2025-01-24 01:48 PM",
        type: "Assignment",
        description: "Assigned: Privileged Access Reviewer",
        actor: "Auto Rule",
      },
      {
        id: "act_4",
        timestamp: "2025-01-20 02:33 PM",
        type: "Revocation",
        description: "GitHub Admin Access removed post review",
        actor: "Security Team",
      },
    ],
    riskFactors: [
      "SoD violation: holds both development and reviewer privileges",
      "Privileged access retained for 14+ months without review",
      "GitHub access suspended but AWS usage increased 40%",
      "Access overlaps 82% with peer engineers - role optimization needed",
    ],
    riskContributors: [
      {
        source: "Entitlement",
        description: 'Has "Privileged Access Reviewer" entitlement',
        level: "High",
      },
      {
        source: "Role",
        description: 'Peer group deviation for "Engineering Developer" role',
        level: "Medium",
      },
      {
        source: "Policy",
        description: "Active SoD violation detected",
        level: "High",
      },
      {
        source: "Certification Age",
        description: "Privileged access not reviewed in 14 months",
        level: "Medium",
      },
    ],
    policyViolations: [
      {
        id: "pol_1",
        timestamp: "2025-01-20",
        policyName: "SoD Policy 4.5 – Dev vs Reviewer",
        description:
          "Users cannot hold both development and approval privileges simultaneously.",
        status: "Open",
      },
    ],
    accessVisibility: [
      {
        actor: "Jane Smith",
        role: "Manager",
        reason: "Direct line manager",
        timestamp: "2025-01-15",
      },
      {
        actor: "IT Security",
        role: "Security Admin",
        reason: 'Member of "Global Security" group',
        timestamp: "2025-01-01",
      },
      {
        actor: "System",
        role: "Auditor",
        reason: "Quarterly access certification campaign",
        timestamp: "2025-01-20",
      },
    ],
  },
  {
    id: "usr_2",
    name: "Michael Chen",
    department: "Marketing",
    manager: "Bob Brown",
    type: "Employee",
    team: 2,
    status: "Active",
    lastUpdated: "2025-01-25",
    riskLevel: "Medium",
    aiAnalysis: "Pending Review",
    accounts: [
      {
        id: "acc_5",
        appName: "Active Directory",
        accountName: "mchen",
        status: "Active",
        lastSync: "2025-01-25",
      },
      {
        id: "acc_6",
        appName: "Salesforce",
        accountName: "michael.chen",
        status: "Active",
        lastSync: "2025-01-25",
      },
      {
        id: "acc_7",
        appName: "HubSpot",
        accountName: "mchen",
        status: "Active",
        lastSync: "2025-01-24",
      },
    ],
    access: [
      {
        id: "role_2",
        type: "Role",
        name: "Marketing Manager",
        description: "Full marketing access",
        source: "Direct",
        risk: "Medium",
        owner: "Bob Brown",
        provisioningSource: "Automated Rule",
      },
      {
        id: "ent_5",
        type: "Entitlement",
        name: "Customer Data Export",
        description: "Ability to export customer data",
        source: "Direct",
        risk: "High",
        roleId: "role_2",
        classifications: ["PII"],
        provisioningSource: "User Request",
      },
      {
        id: "ent_6",
        type: "Entitlement",
        name: "CRM Full Access",
        description: "Full CRM system access",
        source: "Inherited",
        risk: "Medium",
        roleId: "role_2",
        provisioningSource: "Automated Rule",
      },
      {
        id: "ent_7",
        type: "Entitlement",
        name: "Marketing Automation",
        description: "Access to marketing automation tools",
        source: "Inherited",
        risk: "Low",
        roleId: "role_2",
        provisioningSource: "Automated Rule",
      },
    ],
    activity: [
      {
        id: "act_5",
        timestamp: "2025-01-25 02:15 PM",
        type: "Assignment",
        description: "Login success from home office",
        actor: "System",
      },
      {
        id: "act_6",
        timestamp: "2025-01-24 04:30 PM",
        type: "Request",
        description: "Requested additional HubSpot integrations",
        actor: "Michael Chen",
      },
      {
        id: "act_7",
        timestamp: "2025-01-23 09:22 AM",
        type: "Assignment",
        description: "Granted temporary admin access for Q1 campaign",
        actor: "Bob Brown",
      },
    ],
    riskFactors: [
      "Unusual volume of customer data exports detected",
      "Remote access pattern from new geographic location",
      "Marketing campaign access pattern changes",
    ],
    riskContributors: [
      {
        source: "Entitlement",
        description: 'Has "Customer Data Export" capability',
        level: "High",
      },
      {
        source: "Identity Attribute",
        description: "Remote work location increases risk profile",
        level: "Low",
      },
      {
        source: "Certification Age",
        description: "Data export privileges not recently reviewed",
        level: "Medium",
      },
    ],
    policyViolations: [],
    accessVisibility: [
      {
        actor: "Bob Brown",
        role: "Manager",
        reason: "Direct line manager",
        timestamp: "2025-01-15",
      },
      {
        actor: "Data Team",
        role: "Data Admin",
        reason: "Oversees data export activities",
        timestamp: "2025-01-01",
      },
    ],
  },
  {
    id: "usr_3",
    name: "Emily Rodriguez",
    department: "Finance",
    manager: "David Kim",
    type: "Employee",
    team: 3,
    status: "Active",
    lastUpdated: "2025-01-26",
    riskLevel: "Low",
    aiAnalysis: "AI Analytics",
    accounts: [
      {
        id: "acc_8",
        appName: "Active Directory",
        accountName: "erodriguez",
        status: "Active",
        lastSync: "2025-01-26",
      },
      {
        id: "acc_9",
        appName: "SAP",
        accountName: "emily.r",
        status: "Active",
        lastSync: "2025-01-26",
      },
      {
        id: "acc_10",
        appName: "Workday",
        accountName: "erodriguez",
        status: "Active",
        lastSync: "2025-01-25",
      },
    ],
    access: [
      {
        id: "role_3",
        type: "Role",
        name: "Financial Analyst",
        description: "Financial analysis and reporting",
        source: "Direct",
        risk: "Low",
        owner: "David Kim",
        provisioningSource: "Birthright",
      },
      {
        id: "ent_8",
        type: "Entitlement",
        name: "Financial Reports",
        description: "Access to financial reporting tools",
        source: "Inherited",
        risk: "Low",
        roleId: "role_3",
        provisioningSource: "Birthright",
      },
      {
        id: "ent_9",
        type: "Entitlement",
        name: "Budget Access",
        description: "Budget planning and tracking access",
        source: "Inherited",
        risk: "Medium",
        roleId: "role_3",
        provisioningSource: "Birthright",
      },
    ],
    activity: [
      {
        id: "act_8",
        timestamp: "2025-01-26 08:45 AM",
        type: "Assignment",
        description: "Login success from office workstation",
        actor: "System",
      },
      {
        id: "act_9",
        timestamp: "2025-01-25 03:22 PM",
        type: "Request",
        description: "Requested access to month-end reports",
        actor: "Emily Rodriguez",
      },
      {
        id: "act_10",
        timestamp: "2025-01-24 11:15 AM",
        type: "Assignment",
        description: "Granted temporary access to quarterly forecasting",
        actor: "David Kim",
      },
    ],
    riskFactors: [
      "New employee access patterns under standard monitoring",
      "Rapid learning curve - showing accelerated access adoption",
    ],
    riskContributors: [
      {
        source: "Identity Attribute",
        description: "New employee under probation period",
        level: "Low",
      },
      {
        source: "Certification Age",
        description: "Recent hire with fresh access reviews",
        level: "Low",
      },
    ],
    policyViolations: [],
    accessVisibility: [
      {
        actor: "David Kim",
        role: "Manager",
        reason: "Direct line manager",
        timestamp: "2025-01-15",
      },
      {
        actor: "HR Team",
        role: "HR Admin",
        reason: "New employee probation oversight",
        timestamp: "2025-01-01",
      },
    ],
  },
  {
    id: "usr_4",
    name: "API Service",
    department: "Backend",
    manager: "N/A",
    type: "Service Account",
    team: 3,
    status: "Active",
    lastUpdated: "2025-06-15",
    riskLevel: "High",
    aiAnalysis: "Flagged",
    isPrivileged: true,
    isOrphan: true,
    accounts: [
      {
        id: "acc_4",
        appName: "AWS",
        accountName: "svc-api-prod",
        status: "Active",
        lastSync: "2025-06-15",
      },
      {
        id: "acc_5",
        appName: "GCP",
        accountName: "api-service@project.iam.gserviceaccount.com",
        status: "Active",
        lastSync: "2025-06-15",
      },
      {
        id: "acc_19",
        appName: "GitHub",
        accountName: "svc-github-actions",
        status: "Active",
        lastSync: "2025-06-15",
      },
    ],
    access: [
      {
        id: "ent_3",
        type: "Entitlement",
        name: "compute.admin",
        description: "Full control over compute instances",
        source: "Direct",
        risk: "High",
      },
      {
        id: "ent_4",
        type: "Entitlement",
        name: "storage.objectAdmin",
        description: "Full control over storage buckets",
        source: "Direct",
        risk: "High",
      },
    ],
    riskFactors: [
      "Orphaned account with no listed owner.",
      "High-impact privileged permissions in cloud environments.",
      "Service account, difficult to trace activity to a human user.",
    ],
  },
  {
    id: "usr_5",
    name: "Charlie Davis",
    department: "Sales",
    manager: "Bob Brown",
    type: "Employee",
    team: 2,
    status: "Suspended",
    lastUpdated: "2025-06-01",
    riskLevel: "High",
    aiAnalysis: "Flagged",
    accounts: [
      {
        id: "acc_9",
        appName: "Active Directory",
        accountName: "charlied",
        status: "Disabled",
        lastSync: "2025-06-01",
      },
      {
        id: "acc_10",
        appName: "Salesforce",
        accountName: "cdavis",
        status: "Disabled",
        lastSync: "2025-06-01",
      },
    ],
    access: [
      {
        id: "role_3",
        type: "Role",
        name: "Sales Executive",
        description: "Standard sales role",
        source: "Direct",
        risk: "Medium",
      },
      {
        id: "ent_sf_3",
        type: "Entitlement",
        name: "Sales Manager Profile",
        description: "Access to sales dashboards and team reports.",
        source: "Direct",
        risk: "Medium",
        provisioningSource: "Manager Assignment",
      },
      {
        id: "ent_sf_del",
        type: "Entitlement",
        name: "Delete Accounts",
        description: "Allows users to delete account records.",
        source: "Direct",
        risk: "High",
        provisioningSource: "User Request",
      },
      {
        id: "ent_ad_8",
        type: "Entitlement",
        name: "VPN Access",
        description: "Allows users to connect to the corporate VPN.",
        source: "Inherited",
        risk: "Medium",
        provisioningSource: "Birthright",
      },
      {
        id: "ent_ad_9",
        type: "Entitlement",
        name: "All-Employees",
        description: "Default group for all active employees.",
        source: "Inherited",
        risk: "Low",
        provisioningSource: "Birthright",
      },
    ],
    activity: [
      {
        id: "act_8",
        timestamp: "2025-06-01",
        type: "Revocation",
        description: "Account suspended due to policy violation",
        actor: "IT Security",
      },
      {
        id: "act_9",
        timestamp: "2025-06-01",
        type: "Review",
        description:
          "Alert: Multiple failed login attempts from unrecognized IP",
        actor: "System",
      },
    ],
    riskFactors: [
      "Account suspended due to suspicious activity.",
      "Multiple failed login attempts detected.",
    ],
  },
  {
    id: "usr_6",
    name: "Diana Prince",
    department: "HR",
    manager: "Jane Smith",
    type: "Employee",
    team: 1,
    status: "Expired",
    lastUpdated: "2025-02-15",
    riskLevel: "Medium",
    aiAnalysis: "Pending Review",
    accounts: [
      {
        id: "acc_11",
        appName: "Workday",
        accountName: "dprince",
        status: "Active",
        lastSync: "2025-02-10",
      },
      {
        id: "acc_12",
        appName: "Active Directory",
        accountName: "dianap",
        status: "Active",
        lastSync: "2025-02-15",
      },
      {
        id: "acc_21",
        appName: "Salesforce",
        accountName: "diana.prince",
        status: "Active",
        lastSync: "2025-02-15",
      },
    ],
    access: [
      {
        id: "role_4",
        type: "Role",
        name: "HR Business Partner",
        description: "Access to sensitive employee data",
        source: "Direct",
        risk: "High",
      },
      {
        id: "ent_sf_4",
        type: "Entitlement",
        name: "Standard User",
        description: "Standard user profile with basic access.",
        source: "Direct",
        risk: "Low",
        provisioningSource: "Birthright",
      },
      {
        id: "ent_ad_10",
        type: "Entitlement",
        name: "VPN Access",
        description: "Allows users to connect to the corporate VPN.",
        source: "Inherited",
        risk: "Medium",
        provisioningSource: "Birthright",
      },
      {
        id: "ent_ad_11",
        type: "Entitlement",
        name: "All-Employees",
        description: "Default group for all active employees.",
        source: "Inherited",
        risk: "Low",
        provisioningSource: "Birthright",
      },
    ],
    activity: [
      {
        id: "act_10",
        timestamp: "2025-02-15",
        type: "Assignment",
        description: "Password changed",
        actor: "Diana Prince",
      },
    ],
    riskFactors: [
      "Stale identity: No activity in over 120 days.",
      "Retains high-privilege access to HR data despite inactivity.",
    ],
  },
  {
    id: "usr_7",
    name: "Orphaned Account",
    department: "Unknown",
    manager: "N/A",
    type: "Employee",
    team: 0,
    status: "Active",
    lastUpdated: "2024-10-01",
    riskLevel: "High",
    aiAnalysis: "Flagged",
    isOrphan: true,
    accounts: [
      {
        id: "acc_13",
        appName: "Active Directory",
        accountName: "temp-adm-01",
        status: "Active",
        lastSync: "2024-10-01",
      },
    ],
    access: [
      {
        id: "ent_6",
        type: "Entitlement",
        name: "Local Administrator",
        description: "Admin access on a legacy server",
        source: "Direct",
        risk: "High",
      },
    ],
    riskFactors: [
      "Orphaned account with no listed owner or manager.",
      "Active privileged access on a legacy system.",
      "No activity or updates in over 6 months.",
    ],
  },
  {
    id: "usr_8",
    name: "Brenda Wallace",
    department: "Sales",
    manager: "Bob Brown",
    type: "Partner",
    team: 2,
    status: "Active",
    lastUpdated: "2025-06-15",
    riskLevel: "Low",
    aiAnalysis: "AI Analytics",
    accounts: [
      {
        id: "acc_14",
        appName: "Partner Portal",
        accountName: "brenda.wallace@partnerco.com",
        status: "Active",
        lastSync: "2025-06-15",
      },
      {
        id: "acc_20",
        appName: "Salesforce",
        accountName: "bwallace_partner",
        status: "Active",
        lastSync: "2025-06-14",
      },
    ],
    access: [
      {
        id: "role_5",
        type: "Role",
        name: "Partner Sales",
        description: "Access to partner sales resources",
        source: "Direct",
        risk: "Low",
      },
      {
        id: "ent_sf_5",
        type: "Entitlement",
        name: "Standard User",
        description: "Standard user profile with basic access.",
        source: "Direct",
        risk: "Low",
        provisioningSource: "Birthright",
      },
    ],
    activity: [
      {
        id: "act_11",
        timestamp: "2025-06-14",
        type: "Request",
        description: "Downloaded Q2 Partner Sales Kit",
        actor: "Brenda Wallace",
      },
    ],
  },
];
