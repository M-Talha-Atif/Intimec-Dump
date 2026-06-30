import type { AccessRoleResponse } from "@/types/access-roles";
import type { Role } from "@/types/roles";

/**
 * Maps role type from backend (e.g., "business") to UI label (e.g., "Business Role").
 */
const TYPE_LABEL_MAP: Record<string, Role["type"]> = {
  business: "Business Role",
  technical: "Technical Role",
  functional: "Functional Role",
  application: "Application Role",
};

/**
 * Maps role status from backend to UI label.
 */
const STATUS_LABEL_MAP: Record<string, Role["status"]> = {
  active: "enabled",
  draft: "enabled",
  enabled: "enabled",
  under_review: "enabled",
  disabled: "disabled",
  deprecated: "disabled",
  archived: "disabled",
};
/**
 * Maps risk level string to the UI risk score format.
 */
const RISK_SCORE_MAP: Record<string, "Low" | "Medium" | "High"> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "High",
};

/**
 * Valid business units for the Role type.
 */
const VALID_BUSINESS_UNITS = new Set<Role["businessUnit"]>([
  "Finance",
  "Human Resources",
  "Engineering",
  "Marketing",
]);

/**
 * Adapts an AccessRoleResponse from the API into the UI Role type.
 *
 * Fields not yet available from the API (entitlements, childRoles, members,
 * aiSummary, etc.) are filled with sensible defaults so the UI renders
 * without errors.
 */
export function apiRoleToUiRole(apiRole: AccessRoleResponse): Role {
  const riskLevelRaw = apiRole.riskLevel || "";
  const riskScore = riskLevelRaw
    ? RISK_SCORE_MAP[riskLevelRaw.toLowerCase()] ?? "Low"
    : "Low";

  // Resolve business unit — map to valid enum or default to "Engineering"
  const rawBu = apiRole.businessUnit || "";
  const businessUnit: Role["businessUnit"] = VALID_BUSINESS_UNITS.has(rawBu as Role["businessUnit"])
    ? (rawBu as Role["businessUnit"])
    : "Engineering";

  // Classification — backend sends string[], Role type now supports string[]
  // Keep as array for classificationTags, set first item as legacy classification string
  const classificationArray: string[] = Array.isArray(apiRole.classification)
    ? apiRole.classification
    : [];

  return {
    id: apiRole.id,
    name: apiRole.displayName || apiRole.name,
    description: apiRole.description || "",
    type: TYPE_LABEL_MAP[apiRole.type?.toLowerCase()] ?? "Business Role",
    status: STATUS_LABEL_MAP[apiRole.status?.toLowerCase()] ?? "Enabled",
    businessFunction: apiRole.businessFunction,
    businessUnit,
    owner: apiRole.ownerId || "",

    // Classification — array for editor, also set legacy field
    classification: classificationArray,

    // Risk level — both the string and the nested risk object
    riskLevel: apiRole.riskLevel || "",
    risk: {
      score: riskScore,
      entitlementRisks: [],
    },

    // Compliance tags — direct pass-through
    complianceTags: apiRole.complianceTags || [],

    // Governance fields
    requestable: apiRole.requestable,
    requireApproval: apiRole.requireApproval,
    certificationSchedule: apiRole.certificationSchedule || "quarterly",

    // Owner ID — keep for editor
    ownerId: apiRole.ownerId || "",
    entitlementCount: apiRole.entitlementCount || 0,

    // Timestamps
    lastReviewed: apiRole.updatedAt || new Date().toISOString(),
    updatedAt: apiRole.updatedAt || new Date().toISOString(),

    // Fields not yet returned by API — defaults
    aiSummary: undefined,
    entitlements: [],
    userCount: 0,
    membershipRule: undefined,
    changelog: [],
    certificationHistory: [],
  } as Role;
}

/**
 * Converts a list of API roles to UI roles.
 */
export function toUiRoles(apiRoles: AccessRoleResponse[]): Role[] {
  return apiRoles.map(apiRoleToUiRole);
}