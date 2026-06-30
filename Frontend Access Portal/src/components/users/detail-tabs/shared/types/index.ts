import { type User } from "@/data/mock-users";

export interface TabProps {
  user: User;
}

export interface DetailItemProps {
  icon: React.ElementType;
  label: string;
  value: string | undefined;
}

export interface RiskLevelColors {
  High: string;
  Medium: string;
  Low: string;
}

export interface ExpandableRowProps<T> {
  item: T;
  isExpanded: boolean;
  onToggle: () => void;
}

export interface TabCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export type TabValue =
  | "overview"
  | "accounts"
  | "access"
  | "explorer"
  | "risk"
  | "activity"
  | "policy"
  | "ai-analysis";

export interface TabConfig {
  value: TabValue;
  label: string;
  hasIcon?: boolean;
}

export interface QuickStatsData {
  roles: number;
  accounts: number;
  riskScore: number;
  recentActions: number;
}

// Unified account interface that handles both Account and IdentityAccount
export interface UnifiedAccount {
  id: string;
  appName: string;
  accountName: string;
  status: "Active" | "Disabled";
  lastSync: string;
}

// Helper type to handle both account types from the data
export type AnyAccount = {
  id?: string;
  appName?: string;
  application?: string;
  accountName?: string;
  accountId?: string;
  status?: "Active" | "Disabled" | "Suspended";
  lastSync?: string;
  lastSynced?: string;
  [key: string]: unknown;
};

// Identity Relationships Tab Types
export type NodeType =
  | "identity"
  | "application"
  | "role"
  | "entitlement"
  | "account"
  | "risk";

export interface NodeDetailsData {
  id: string;
  type: NodeType;
  label: string;
  subtitle?: string;
  riskLevel?: string;
  riskCount?: number;
  conflictCount?: number;
  metadata: Record<string, unknown>;
}

export type ViewMode = "hierarchy" | "direct" | "conflicts";

export interface FilterState {
  applications: boolean;
  roles: boolean;
  entitlements: boolean;
  accounts: boolean;
  risks: boolean;
  sodPolicies: boolean;
  activity: boolean;
  riskyOnly: boolean;
}

export interface LegendItem {
  type: string;
  label: string;
  color: string;
  icon: React.ElementType;
}

export interface RelationshipType {
  type: string;
  label: string;
  style: string;
  pattern: "solid" | "dashed";
}
