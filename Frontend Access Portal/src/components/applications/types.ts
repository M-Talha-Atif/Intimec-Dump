import { Entitlement } from "@/types/entitlement";
import { Account } from "@/types/account";
import { User } from "@/types/user";

export type UserMeta = Pick<
  User,
  | "id"
  | "name"
  | "riskLevel"
  | "department"
  | "manager"
  | "status"
  | "type"
  | "isPrivileged"
>;
export type EntitlementMeta = Pick<
  Entitlement,
  "id" | "name" | "description" | "riskLevel" | "type"
>;

export type EntitlementWithUsersMeta = Entitlement & {
  users: UserMeta[] | null; // Users can be null if no accounts are linked
};

export type AccountWithEntitlements = Account & {
  entitlements: Entitlement[];
};

export type AccountWithUserAndEntitlements = Account & {
  user: UserMeta | null; // User can be null if no user is assigned
  entitlements: EntitlementMeta[]; // Entitlements with user metadata
};
