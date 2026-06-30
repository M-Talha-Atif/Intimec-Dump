import { PolicyViolation } from "@/types/user";

export type AccountDetail = {
  type: "Permission" | "Group" | "Role";
  name: string;
  description: string;
};

export type AccountStatus = "Active" | "Disabled";

export type SynchronizationSituation =
  | "UNMATCHED"
  | "UNLINKED"
  | "LINKED"
  | "DISPUTED"
  | "DELETED";

export type Account = {
  id: string;
  name: string; // Name of the account
  applicationId: string; // Optional, if appId is not available
  createdAt: number; // Timestamp in milliseconds
  updatedAt: number; // Timestamp in milliseconds
  status: AccountStatus;
  lastSync: number;
  details?: AccountDetail[];
  userId: string | null; // ID of the user or null if orphaned
  applicationAttributes?: {
    [key: string]: string | number | boolean | null | undefined; // Flexible attributes for application-specific data
  };
  policyViolations?: PolicyViolation[]; // Optional, if no policy violations
  synchronizationSituation?: SynchronizationSituation; // Sync situation from IGA pipeline
};
