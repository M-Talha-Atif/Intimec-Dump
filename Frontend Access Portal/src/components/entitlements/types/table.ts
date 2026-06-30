import type { Entitlement } from "../data/mock-entitlements";

export type SortConfig = {
  key: string;
  direction: "ascending" | "descending";
};

export type EntitlementsTableProps = {
  entitlements: Entitlement[];
  sortConfig: SortConfig;
  onSort: (config: SortConfig) => void;
  onEntitlementSelect: (entitlement: Entitlement) => void;
};

export type BadgeLevel = "Read" | "Write" | "Admin";
export type LifecycleStatus = "Active" | "Deprecated" | "Orphaned" | "Inactive";
