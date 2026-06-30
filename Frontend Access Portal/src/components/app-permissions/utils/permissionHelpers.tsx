import React from "react";
import { Check, X, Settings } from "lucide-react";
import { PermissionCell } from "../types";

export const getCellPermission = (
  permissions: Record<string, Record<string, PermissionCell>>,
  selectedRole: string,
  moduleId: string,
  action: string
): PermissionCell => {
  const key = `${moduleId}-${action}`;
  return (
    permissions[selectedRole]?.[key] || {
      moduleId,
      action,
      effect: "inherit",
      source: "default",
    }
  );
};

export const getCellIcon = (cell: PermissionCell) => {
  switch (cell.effect) {
    case "allow":
      return <Check className="h-4 w-4 text-green-600" />;
    case "deny":
      return <X className="h-4 w-4 text-red-600" />;
    case "conditional":
      return <Settings className="h-4 w-4 text-blue-600" />;
    default:
      return null;
  }
};

export const getCellColor = (cell: PermissionCell) => {
  switch (cell.effect) {
    case "allow":
      return "bg-green-100 hover:bg-green-200 border-green-300";
    case "deny":
      return "bg-red-100 hover:bg-red-200 border-red-300";
    case "conditional":
      return "bg-blue-100 hover:bg-blue-200 border-blue-300";
    default:
      return "bg-gray-100 hover:bg-gray-200 border-gray-300";
  }
};

// Conversion function to convert from RolePolicyRule to PermissionCell
export const convertRulePolicyToPermissionCell = (
  rule: import("@/types/permissions").RolePolicyRule
): PermissionCell => {
  return {
    moduleId: rule.moduleId,
    action: rule.action,
    effect: rule.effect,
    source: "direct", // Set a default source
    hasConditions: !!rule.conditions,
  };
};
