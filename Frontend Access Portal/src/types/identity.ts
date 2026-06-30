/**
 * Identity Governance types matching the backend IdentityResponseDto,
 * IdentityStatisticsDto, ShadowResponse, and related enums.
 *
 * These types are the canonical frontend contract for identity data.
 * All identity hooks and components should reference these rather than
 * defining their own ad-hoc shapes.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** Maps to backend IdentityType enum. */
export type IdentityType = "EMPLOYEE" | "NON_EMPLOYEE" | "NON_HUMAN";

/** Maps to backend IdentityStatus enum. */
export type IdentityStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "TERMINATED"
  | "PENDING"
  | "EXPIRED"
  | "ARCHIVED";

/** Maps to Shadow.SynchronizationSituation enum. */
export type SynchronizationSituation =
  | "LINKED"
  | "UNLINKED"
  | "UNMATCHED"
  | "DISPUTED"
  | "DELETED";

// ---------------------------------------------------------------------------
// Core DTOs
// ---------------------------------------------------------------------------

/**
 * Matches backend `IdentityResponseDto` — the unified response for all
 * identity CRUD operations.
 *
 * `coreAttributes` carry type-specific fields (Employee: username, email,
 * department, jobTitle, etc.; NonHuman: serviceName, ownerTeam, etc.).
 * `extendedAttributes` carry tenant-defined custom attributes.
 */
export interface IdentityDTO {
  id: string;
  dgraphNodeId: string | null;
  tenantId: string;
  identityType: IdentityType;
  status: IdentityStatus;
  coreAttributes: Record<string, unknown>;
  extendedAttributes: Record<string, unknown>;
  /** ISO-8601 string or epoch-milliseconds number, depending on Jackson config. Use toInstantString() to normalise. */
  createdAt: string | number;
  updatedAt: string | number;
}

// ---------------------------------------------------------------------------
// Shadow (Resource Account) DTOs
// ---------------------------------------------------------------------------

export interface ShadowMetadata {
  /** ISO-8601 string serialized by Jackson (OffsetDateTime). Use formatTs() to display. */
  createdAt: string | null;
  updatedAt: string | null;
  lastSynchronizedAt: string | null;
  lastProvisionedAt: string | null;
  lastSyncRunId: string | null;
}

/** Application metadata injected by the shadows proxy (not from the backend ShadowDTO). */
export interface ShadowAppMeta {
  name: string | null;
  ownerName: string | null;
  isAuthoritative: boolean;
  riskLevel: string | null;
  connectorId: string | null;
}

/**
 * Matches backend `ShadowResponse` — a single resource account/entitlement
 * linked (or pending linking) to an identity.
 */
export interface ShadowDTO {
  id: string;
  resourceId: string; // Application UUID
  resourceUid: string; // Unique ID in external system (DN, username, etc.)
  objectClass: string; // __ACCOUNT__ or __GROUP__
  kind: string | null;
  linkedIdentityId: string | null;
  synchronizationSituation: SynchronizationSituation;
  attributes: Record<string, unknown>;
  metadata: ShadowMetadata | null;
  /** Injected by the /api/identity/shadows proxy from the application catalog. */
  _appMeta?: ShadowAppMeta;
}

/**
 * Matches backend `GetShadowsByIdentityResponse`.
 */
export interface ShadowsByIdentityResponse {
  identityId: string;
  shadows: ShadowDTO[];
  totalCount: number;
}

// ---------------------------------------------------------------------------
// Entitlement DTOs
// ---------------------------------------------------------------------------

/**
 * Matches backend `ShadowEntitlementDto` — the projection returned by
 * GET /api/v1/entitlements/by-shadow/{shadowId}.
 * NOTE: This is a JOIN projection, NOT the full EntitlementResponseDto.
 */
export interface EntitlementDTO {
  assignmentId: string;
  entitlementId: string;
  entitlementName: string | null;  // Entitlement.displayName
  entitlementType: string | null;  // Entitlement.kind — e.g. "group", "role", "entitlement"
  objectClass: string | null;      // ConnID objectClass — e.g. "__GROUP__", "__ROLE__" — more reliable
  riskLevel: string | null;
  source: string | null;           // e.g. "Direct Assignment", "From Role"
  assignedAt: number | null;
}

// ---------------------------------------------------------------------------
// Statistics DTOs
// ---------------------------------------------------------------------------

export interface IdentityTypeStatistics {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  suspendedCount: number;
  terminatedCount: number;
  pendingCount: number;
  expiredCount: number;
  archivedCount: number;
  extendedAttributesCount: number;
  extendedAttributeUsage: Record<string, number>;
}

/**
 * Matches backend `IdentityStatisticsDto`.
 */
export interface IdentityStatistics {
  totalIdentities: number;
  identitiesByType: Record<IdentityType, number>;
  statisticsByType: Record<IdentityType, IdentityTypeStatistics>;
  totalExtendedAttributes: number;
  extendedAttributeUsage: Record<string, number>;
  activeIdentities: number;
  inactiveIdentities: number;
}

// ---------------------------------------------------------------------------
// Convenience helpers for extracting flat fields from coreAttributes
// ---------------------------------------------------------------------------

/** Type-safe accessor for common Employee coreAttributes. */
export interface EmployeeCoreAttributes {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  employeeId?: string;
  jobTitle?: string;
  department?: string;
  managerId?: string;
  managerRef?: string;
  hireDate?: string;
  terminationDate?: string;
}

/** Type-safe accessor for common NonHuman coreAttributes. */
export interface NonHumanCoreAttributes {
  serviceName?: string;
  description?: string;
  ownerTeam?: string;
  riskLevel?: string;
}

/**
 * Extracts a typed value from the generic coreAttributes map.
 * Avoids scattering `as unknown as string` casts across components.
 */
export function attr<T = string>(
  identity: IdentityDTO,
  key: string,
): T | undefined {
  return identity.coreAttributes[key] as T | undefined;
}

/**
 * Normalises a Java Instant value (ISO-8601 string or epoch number) to
 * an ISO-8601 string. Returns empty string if the value is nullish.
 * Handles epoch seconds (< 10^11) by converting to millis first.
 */
export function toInstantString(value: string | number | null | undefined): string {
  if (value == null) return '';
  if (typeof value === 'number') {
    // Values below 10^11 are epoch seconds; multiply to get millis
    const millis = value < 100_000_000_000 ? value * 1000 : value;
    return new Date(millis).toISOString();
  }
  return value;
}

/**
 * Extracts the YYYY-MM-DD date portion from a Java Instant value.
 */
export function toDateString(value: string | number | null | undefined): string {
  const iso = toInstantString(value);
  return iso ? iso.split('T')[0] : '';
}

/**
 * Builds a display name from an identity's core attributes.
 * Falls back through displayName → firstName+lastName → username → email → id.
 */
export function displayName(identity: IdentityDTO): string {
  const dn = attr(identity, "displayName");
  if (dn) return dn;

  const first = attr(identity, "firstName");
  const last = attr(identity, "lastName");
  if (first || last) return [first, last].filter(Boolean).join(" ");

  return (
    attr(identity, "username") ??
    attr(identity, "serviceName") ??
    attr(identity, "email") ??
    identity.id
  );
}
