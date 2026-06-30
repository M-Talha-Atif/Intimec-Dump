export const statusColors = {
  Active: "bg-green-100 text-green-800 border-green-200",
  Inactive: "bg-slate-100 text-slate-800 border-slate-200",
  Suspended: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Stale: "bg-orange-100 text-orange-800 border-orange-200",
} as const;

export const TAB_CONFIG = [
  { value: "overview", label: "Overview" },
  { value: "accounts", label: "Accounts" },
  { value: "access", label: "Access" },
  { value: "relationships", label: "Relationships" },
  { value: "explorer", label: "Explorer" },
  { value: "risk", label: "Risk" },
  { value: "activity", label: "Activity" },
  { value: "policy", label: "Policy" },
  { value: "ai-analysis", label: "AI Analysis", hasIcon: true },
] as const;
