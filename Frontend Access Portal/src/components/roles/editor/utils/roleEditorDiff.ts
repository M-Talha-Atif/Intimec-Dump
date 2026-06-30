import type { UpdateAccessRoleRequest } from "@/types/access-roles";

/**
 * Normalizes a string array for stable equality comparison.
 *
 * - removes falsy values
 * - converts all values to strings
 * - sorts alphabetically
 *
 * @param values input values
 * @returns normalized sorted string array
 */
export function normalizeStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .filter(Boolean)
    .map(String)
    .sort();
}

/**
 * Compares two arrays of IDs irrespective of order.
 *
 * @param left first ID array
 * @param right second ID array
 * @returns true if both arrays contain the same values
 */
export function areIdListsEqual(left: unknown, right: unknown): boolean {
  const a = normalizeStringArray(left);
  const b = normalizeStringArray(right);
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Determines whether entitlement assignments changed.
 *
 * @param originalEntitlementIds original persisted entitlement IDs
 * @param currentEntitlementIds currently edited entitlement IDs
 * @returns true if changed
 */
export function haveEntitlementsChanged(
  originalEntitlementIds: string[],
  currentEntitlementIds: string[]
): boolean {
  return !areIdListsEqual(originalEntitlementIds, currentEntitlementIds);
}

/**
 * Determines whether child role assignments changed.
 *
 * @param originalChildIds original persisted child role IDs
 * @param currentChildIds currently edited child role IDs
 * @returns true if changed
 */
export function haveChildrenChanged(
  originalChildIds: string[],
  currentChildIds: string[]
): boolean {
  return !areIdListsEqual(originalChildIds, currentChildIds);
}

/**
 * Performs a stable deep comparison between two role update payloads.
 *
 * This is used to detect whether metadata has changed.
 * Array fields are normalized so ordering differences do not trigger
 * unnecessary metadata update calls.
 *
 * @param original original payload derived from persisted role
 * @param edited edited payload derived from current UI state
 * @returns true if any metadata field differs
 */
export function hasMetadataChanged(
  original: UpdateAccessRoleRequest,
  edited: UpdateAccessRoleRequest
): boolean {
  const normalizePayload = (payload: UpdateAccessRoleRequest) => ({
    ...payload,
    classification: normalizeStringArray(payload.classification),
    complianceTags: normalizeStringArray(payload.complianceTags),
  });

  return JSON.stringify(normalizePayload(original)) !== JSON.stringify(normalizePayload(edited));
}