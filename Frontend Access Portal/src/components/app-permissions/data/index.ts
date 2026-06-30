export * from "./attributePermissionsData";
export * from "./delegatedAdministrationData";
import { Role } from "../types";

export const roles: Role[] = [
  { id: "app-owner", name: "Application Owner", type: "admin", userCount: 3 },
  {
    id: "campaign-reviewer",
    name: "Campaign Reviewer",
    type: "reviewer",
    userCount: 8,
  },
  {
    id: "helpdesk-admin",
    name: "Helpdesk Admin",
    type: "operator",
    userCount: 12,
  },
  {
    id: "read-only-auditor",
    name: "Read-Only Auditor",
    type: "viewer",
    userCount: 5,
  },
];

// Mock permission data - in real implementation, this would come from API
export const defaultPermissions = {
  "app-owner": {
    "dashboard-view": {
      moduleId: "dashboard",
      action: "view",
      effect: "allow",
      source: "direct",
    },
    "dashboard-export": {
      moduleId: "dashboard",
      action: "export",
      effect: "allow",
      source: "direct",
    },
    "applications-view": {
      moduleId: "applications",
      action: "view",
      effect: "allow",
      source: "direct",
    },
    "applications-create": {
      moduleId: "applications",
      action: "create",
      effect: "allow",
      source: "direct",
    },
    "applications-edit": {
      moduleId: "applications",
      action: "edit",
      effect: "allow",
      source: "direct",
    },
    "identities-view": {
      moduleId: "identities",
      action: "view",
      effect: "allow",
      source: "direct",
    },
    "identities-edit": {
      moduleId: "identities",
      action: "edit",
      effect: "conditional",
      source: "direct",
      hasConditions: true,
    },
  },
} as const;
