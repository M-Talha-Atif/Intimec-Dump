import { createEnhancedMockHierarchicalData } from "@/lib/enhanced-delegation-inheritance";

// Feature flag simulation
export const FEATURES = {
  delegation: {
    hierarchical: true, // Set to true to enable hierarchical view
  },
};

// Initial hierarchical data
export const initialHierarchicalData = createEnhancedMockHierarchicalData();

// Type filters for scopes
export const SCOPE_TYPE_FILTERS = [
  { value: "all", label: "All Scope Types" },
  { value: "organizational", label: "Organizational" },
  { value: "geographical", label: "Geographical" },
  { value: "application", label: "Application" },
  { value: "identity", label: "Identity" },
] as const;

// View modes
export const VIEW_MODES = {
  TREE: "tree" as const,
  LEGACY: "legacy" as const,
};

// Status colors mapping
export const STATUS_COLORS = {
  active: "default",
  pending: "secondary",
  expired: "destructive",
} as const;

// Type icons mapping
export const TYPE_ICONS = {
  organizational: "Building",
  geographical: "MapPin",
  application: "Users",
  identity: "Users",
} as const;
