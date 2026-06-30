import type { UpdateAccessRoleRequest } from "@/types/access-roles";
import type { Role } from "@/types/roles";

/**
 * Converts the UI role model into the backend update request payload.
 *
 * This mapper is intentionally kept as a pure function:
 * - no hooks
 * - no side effects
 * - easy to test
 *
 * It normalizes UI-specific values into the exact backend API contract.
 *
 * @param role the edited role from the UI
 * @returns normalized update payload for the access role update API
 */
export function mapRoleToUpdatePayload(role: Role): UpdateAccessRoleRequest {
  const r = role as any;

  let classificationTags: string[];
  if (Array.isArray(role.classification)) {
    classificationTags = role.classification;
  } else if (typeof role.classification === "string" && role.classification) {
    classificationTags = [role.classification];
  } else {
    classificationTags = [];
  }

  const complianceTags: string[] = Array.isArray(r.complianceTags) ? r.complianceTags : [];
  const riskLevel: string = r.riskLevel || "";

  return {
    name: role.name.trim(),
    description: role.description.trim(),
    type: role.type.toLowerCase().replace(" role", ""),
    status: role.status.toLowerCase(),
    businessUnit: role.businessUnit || undefined,
    businessFunction: role.businessFunction || undefined,
    classification: classificationTags.length > 0 ? classificationTags : undefined,
    complianceTags: complianceTags.length > 0 ? complianceTags : undefined,
    riskLevel: riskLevel || undefined,
    ownerId: r.ownerId || role.owner || undefined,
    requestable: r.requestable,
    requireApproval: r.requireApproval,
    certificationSchedule: r.certSchedule,
  };
}