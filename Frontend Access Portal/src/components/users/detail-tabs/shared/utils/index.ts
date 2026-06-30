import { RiskLevelColors, AnyAccount, UnifiedAccount } from "../types";
import { type User } from "@/data/mock-users";
import { Node, Edge } from "@xyflow/react";

export const riskLevelColors: RiskLevelColors = {
  High: "text-red-600",
  Medium: "text-yellow-600",
  Low: "text-green-600",
};

export const statusColors = {
  Active: "bg-green-100 text-green-800 border-green-200",
  Inactive: "bg-slate-100 text-slate-800 border-slate-200",
  Suspended: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Stale: "bg-orange-100 text-orange-800 border-orange-200",
} as const;

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getRiskBadgeVariant = (level: string) => {
  switch (level) {
    case "High":
      return "destructive";
    case "Medium":
      return "secondary";
    case "Low":
      return "outline";
    default:
      return "outline";
  }
};

// Utility to normalize different account types into a unified format
export const normalizeAccount = (
  account: AnyAccount,
  index: number
): UnifiedAccount => {
  return {
    id: account.id || `account-${index}`,
    appName: account.appName || account.application || "Unknown",
    accountName: account.accountName || account.accountId || "Unknown",
    status:
      (account.status === "Suspended" ? "Disabled" : account.status) ||
      "Active",
    lastSync: account.lastSync || account.lastSynced || "Never",
  };
};

// Identity Relationships Tab Utilities
export const getNodeIcon = (type: string) => {
  switch (type) {
    case "identity":
      return "Users";
    case "application":
      return "Shield";
    case "role":
      return "Bot";
    case "entitlement":
      return "Shield";
    case "account":
      return "Settings";
    case "risk":
      return "AlertTriangle";
    default:
      return "Target";
  }
};

export const getNodeColor = (riskLevel?: string, type?: string) => {
  switch (riskLevel?.toLowerCase()) {
    case "critical":
    case "high":
      return "bg-red-100 border-red-500 text-red-800";
    case "medium":
      return "bg-yellow-100 border-yellow-500 text-yellow-800";
    case "low":
      return "bg-green-100 border-green-500 text-green-800";
    default:
      switch (type) {
        case "identity":
          return "bg-blue-100 border-blue-500 text-blue-800";
        case "application":
          return "bg-yellow-100 border-yellow-500 text-yellow-800";
        case "account":
          return "bg-orange-100 border-orange-500 text-orange-800";
        case "role":
          return "bg-purple-100 border-purple-500 text-purple-800";
        case "entitlement":
          return "bg-emerald-100 border-emerald-500 text-emerald-800";
        case "risk":
          return "bg-red-100 border-red-500 text-red-800";
        default:
          return "bg-gray-100 border-gray-500 text-gray-800";
      }
  }
};

export const getRiskColor = (risk?: string) => {
  switch (risk?.toLowerCase()) {
    case "high":
    case "critical":
      return "bg-red-100 text-red-800 border-red-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "low":
      return "bg-green-100 text-green-800 border-green-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

export const generateAISummary = (
  user: User,
  nodes: Node[],
  riskNodes: Node[],
  conflictNodes: Node[]
) => {
  const visibleNodes = nodes.filter((node) => node.data.type !== "identity");

  return `${user.name} has ${
    visibleNodes.length
  } connected relationships including ${riskNodes.length} high-risk items and ${
    conflictNodes.length
  } SoD conflicts. Key insights: ${
    riskNodes.length > 0
      ? "Review high-risk entitlements immediately."
      : "Access levels appear appropriate."
  } ${
    conflictNodes.length > 0
      ? "Resolve policy violations to maintain compliance."
      : ""
  }`;
};

export const exportGraph = (
  format: "png" | "pdf" | "json",
  nodes: Node[],
  edges: Edge[]
) => {
  if (format === "json") {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "identity-relationships.json";
    a.click();
    URL.revokeObjectURL(url);
  } else {
    console.log(`Exporting as ${format} - not implemented yet`);
  }
};

export const getViewModeIcon = (mode: string) => {
  switch (mode) {
    case "hierarchy":
      return "GitBranch";
    case "direct":
      return "ArrowRight";
    case "conflicts":
      return "AlertTriangle";
    default:
      return "GitBranch";
  }
};
