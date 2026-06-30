import { IdentityType, RiskLevel } from "@/types/shared";

export type ReviewHistoryItem = {
  campaign: string;
  date: string;
  reviewer: string;
  outcome: "Approved" | "Certified";
  timestamp: number; // Timestamp in milliseconds
};

export type ActivityHistoryItem = {
  timestamp: number; // Timestamp in milliseconds
  activity: string; // Description of the activity
  user: string; // User who performed the activity
  details?: string; // Optional details about the activity
};

export type UsageHistoryItem = {
  usageCount: number;
  timestamp: number; // Timestamp in milliseconds
};

export type EntitlementType =
  | "Group"
  | "Role"
  | "Responsibility"
  | "Policy"
  | "Permission";
export type EntitlementLifecycle =
  | "Active"
  | "Deprecated"
  | "Orphaned"
  | "Inactive";
export type EntitlementPrivilegeLevel = "Read" | "Write" | "Admin";

export type Entitlement = {
  id: string;
  name: string;
  description: string;
  applicationId: string;
  owner?: string;
  type: EntitlementType;
  lifecycle: EntitlementLifecycle;
  requestable: boolean;
  classification: string[];
  lastUsed: number; // Timestamp in milliseconds
  riskLevel: RiskLevel;
  riskReason?: string;
  privilegeLevel?: EntitlementPrivilegeLevel; // New field for privilege level
  identityType: IdentityType;
  requireApproval?: boolean;
  AutoExpireDurationMs?: number; // Timestamp in milliseconds
  MaximumDurationMs?: number; // Timestamp in milliseconds
  AllowedAutomatedGrant: boolean;
  assignedUsersCount: number;
  createdAt: number; // Timestamp in milliseconds
  updatedAt: number; // Timestamp in milliseconds
  usageHistory?: UsageHistoryItem[];
  reviewHistory?: ReviewHistoryItem[];
  activityHistory?: ActivityHistoryItem[];
  includedEntitlementIds?: Entitlement["id"][]; // For nested entitlements
};
