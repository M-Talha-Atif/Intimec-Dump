import type { IdentityType } from "../types/index";

export const TRANSFORMATIONS = [
  "none",
  "uppercase",
  "lowercase",
  "trim",
  "concat",
  "substring",
  "regex",
  "script",
] as const;

export const TARGET_ATTRIBUTES_BY_TYPE: Record<IdentityType, string[]> = {
  employee: [
    // Fields from HumanIdentity base class
    "username",
    "email",
    "firstName",
    "lastName",
    "displayName",
    // Fields from Employee class
    "employeeId",
    "jobTitle",
    "department",
    "manager",
    "hireDate",
    "terminationDate",
    "managerRef",
    // Legacy / extra values kept for backward compatibility
    "employmentType",
    "location",
    "status",
    "probationPeriod",
  ],
  "non-human": [
    "serviceAccountId",
    "name",
    "owner",
    "identityType",
    "provider",
    "lastUsed",
    "keyRotationStatus",
    "status",
  ],
  "non-employee": [
    "contractorId",
    "email",
    "firstName",
    "lastName",
    "sponsor",
    "contractPeriod",
    "contractType",
    "accessExpiry",
    "status",
  ],
};

export const SYNC_STATUSES = {
  SYNCED: "synced",
  OUT_OF_SYNC: "out-of-sync",
  NOT_CONFIGURED: "not-configured",
} as const;
