import { User } from "@/types/user";
import { Account, SynchronizationSituation } from "@/types/account";
import { CustomBadgeColor } from "./CustomBadge";
import { RiskLevel } from "@/types/shared";

export const riskBadgeMap: Record<RiskLevel | "Unknown", CustomBadgeColor> = {
  High: "red",
  Medium: "yellow",
  Low: "green",
  Unknown: "gray",
};

export const accountStatusBadgeMap: Record<
  Account["status"] | "Unknown",
  CustomBadgeColor
> = {
  Active: "green",
  Disabled: "red",
  Unknown: "gray",
};

export const userStatusBadgeMap: Record<
  User["status"] | "Unknown",
  CustomBadgeColor
> = {
  Active: "green",
  Inactive: "red",
  Suspended: "yellow",
  Pending: "blue",
  Terminated: "red",
  Expired: "gray",
  Archived: "gray",
  Unknown: "gray",
};

export const situationBadgeMap: Record<
  SynchronizationSituation | "Unknown",
  CustomBadgeColor
> = {
  LINKED: "green",
  UNMATCHED: "yellow",
  UNLINKED: "blue",
  DISPUTED: "red",
  DELETED: "gray",
  Unknown: "gray",
};
