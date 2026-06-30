import { RiskLevel } from "./shared";
import { Entitlement } from "./entitlement";

// export type RoleEntitlement = {
//   id: string;
//   name: string;
//   description: string;
//   application: string;
//   privilegeLevel?: 'Read' | 'Write' | 'Admin';
//   isRisky?: boolean;
//   lastUsed?: string;
//   usageCount?: number;
//   aiTooltip?: string;
// };

export type RoleRisk = {
  score: RiskLevel;
  entitlementRisks: {
    entitlementName: string;
    reason: string;
  }[];
  peerBenchmark?: string;
  conflict?: {
    roleName: string;
    overlap: number;
  };
};

export type ChangeLogEntry = {
  date: string;
  change: string;
  by: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  owner: string;
  backupOwner?: string;
  lastReviewedBy?: string;
  riskLevel?: string;
  businessUnit: "Finance" | "Human Resources" | "Engineering" | "Marketing";
  businessFunction?: string;
  type:
    | "Functional Role"
    | "Business Role"
    | "Technical Role"
    | "Application Role";
  status: "enabled" | "disabled";
  classification?: string[];
  complianceTags?: string[];
  aiSummary?: string;
  entitlements: Entitlement[];
  lastReviewed: string;
  updatedAt: string;
  userCount: number;
  userCountHistory?: { month: string; count: number }[];
  inactiveUserCount?: number;
  entitlementCount?: number;
  membershipRule?: string;
  risk?: RoleRisk;
  changelog?: ChangeLogEntry[];
  certificationHistory?: {
    campaignName: string;
    status: "Complete" | "Overdue" | "In Progress";
    date: string;
    reviewer: string;
  }[];
  aiMembershipSuggestion?: string;
  // New fields for lineage and objectives
  derivedFrom?: string;
  composedOf?: string[];
  objectives?: string[];
  inlcudedRoles?: Role[];
};

export type RoleFilterState = {
  types: Array<Role['type']>;
  statuses: Array<Role['status']>;
  risks: Array<NonNullable<Role['risk']>['score']>;
  classifications: Array<Role['classification']>;
  businessUnits: Array<Role['businessUnit']>;
};


const applicationRolesTypes = [
  "administrator",
  "reviewer",
  "operator",
  "viewer",
] as const;

const businessRolesTypes = [
  "Functional Role",
  "Business Role",
  "Technical Role",
  "Application Role",
] as const;

export type ApplicationRoleType = (typeof applicationRolesTypes)[number];
export type BusinessRoleType =
  | "Functional Role"
  | "Business Role"
  | "Technical Role"
  | "Application Role";

export const isApplicationType = (type: string): type is ApplicationRoleType =>
  applicationRolesTypes.includes(type as ApplicationRoleType);

export const isBusinessType = (type: string): type is BusinessRoleType =>
  businessRolesTypes.includes(type as BusinessRoleType);

export type MetaRole = {
  id: string;
  name: string;
  description: string;
  userCount: number;
} & (
  | {
      type: ApplicationRoleType;
      permissionCount: number;
    }
  | {
      type: BusinessRoleType;
      entitlementCount: number;
    }
);
