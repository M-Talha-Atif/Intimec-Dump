import { Crown, Users, Settings, Eye, Shield } from "lucide-react";

/**
 * Available role types with their corresponding icons
 */
export const roleTypeIcons = {
  ADMINISTRATOR: Crown,
  REVIEWER: Users,
  OPERATOR: Settings,
  VIEWER: Eye,
};

/**
 * Available scopes for role access
 */
export const availableScopes = [
  "Applications",
  "Workflows",
  "Configurations",
  "Access Reviews",
  "Audit Logs",
  "Identities",
  "Security Alerts",
  "Dashboard",
  "Analytics",
];

/**
 * Available tags for role categorization
 */
export const availableTags = [
  "critical",
  "temporary",
  "automated",
  "compliance",
  "privileged",
  "standard",
];

/**
 * Role type descriptions
 */
export const roleTypeDescriptions = {
  ADMINISTRATOR: "Full administrative access with all permissions",
  REVIEWER: "Can review and approve requests and campaigns",
  OPERATOR: "Can perform operations and manage day-to-day tasks",
  VIEWER: "Read-only access to view information and reports",
};

/**
 * Default form data for create role wizard
 */
export const defaultCreateRoleFormData = {
  name: "",
  type: "VIEWER" as const,
  riskLevel: "Low" as const,
  description: "",
  businessJustification: "",
  owner: "current-user@company.com",
  permissions: [],
  scopes: [],
  users: [],
  requiresApproval: false,
  isActive: true,
  complianceFrameworks: [],
  tags: [],
};

/**
 * Helper function to format role type display name
 * Converts "ADMINISTRATOR" to "Administrator", etc.
 */
export const formatRoleTypeDisplay = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};
