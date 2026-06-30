import { RiskLevel } from "./shared";

export type AccessItem = {
  id: string;
  type: "Role" | "Entitlement";
  name: string; // Display name of the role or entitlement
  description: string; // Description of the role or entitlement
  source: "Direct" | "Inherited" | "Nested";
  risk: RiskLevel;
  provisioningSource?:
    | "Birthright"
    | "Manager Assignment"
    | "Automated Rule"
    | "User Request";
  classifications?: string[];
  lastUsed?: number;
  requestable?: boolean;
  peerDeviation?: boolean;
  roleId?: string;
  roleName?: string;
  owner?: string;
};

export type ActivityEvent = {
  id: string;
  accountId?: string; // ID of the account if applicable
  description: string;
  type: "Assignment" | "Revocation" | "Review" | "Request";
  timestamp: number;
  actor: string;
};

export type PolicyViolation = {
  id: string;
  timestamp: number;
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
  level: RiskLevel;
};

export type AccessVisibility = {
  actor: string;
  role: string;
  reason: string;
  timestamp: number;
};

export type UserStatus = "Active" | "Inactive" | "Suspended" | "Pending" | "Terminated" | "Expired" | "Archived";
export type IdentityType = "employee" | "non-employee" | "non-human";

export type User = {
  id: string;
  name: string;
  department: string;
  manager: string;
  // type: "Employee" | "Contractor" | "Service Account" | "Partner";
  type: string;
  team: number;
  status: UserStatus;
  riskLevel: RiskLevel;
  identityType: IdentityType;
  // aiAnalysis: "AI Analytics" | "Pending Review" | "Flagged";
  isPrivileged: boolean;
  // isOrphan?: boolean;
  // access?: AccessItem[];
  activity?: ActivityEvent[];

  createdAt: number; // Timestamp in milliseconds
  updatedAt: number; // Timestamp in milliseconds

  // Risks
  riskFactors?: string[];
  riskContributors?: RiskContributor[];

  policyViolations?: PolicyViolation[];
  accessVisibility?: AccessVisibility[];
};

export type IdentityGroup = {
  id: string;
  name: string;
  description: string;
  type: "static" | "dynamic";
  memberCount: number;
  email?: string;
  owner: string;
  tags: string[];
  createdAt: string;
  usedIn: string[];
  riskLevel: RiskLevel;
};
