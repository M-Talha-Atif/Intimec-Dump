import type { UserStatus } from "@/types/user";

/**
 * Identity Lifecycle State Machine — mirrors backend IdentityLifecycleStateMachine.java
 *
 * Defines valid status transitions for enterprise identity governance.
 * Used by the UI to show only valid transition options and prevent
 * invalid status changes before they reach the API.
 */

const VALID_TRANSITIONS: Record<UserStatus, UserStatus[]> = {
  Pending: ["Active", "Terminated"],
  Active: ["Inactive", "Suspended", "Terminated", "Expired"],
  Inactive: ["Active", "Terminated", "Expired"],
  Suspended: ["Active", "Terminated"],
  Terminated: ["Archived"],
  Expired: ["Archived"],
  Archived: [], // Terminal state
};

/**
 * Returns the list of valid target statuses from a given status.
 */
export function getValidTransitions(from: UserStatus): UserStatus[] {
  return VALID_TRANSITIONS[from] ?? [];
}

/**
 * Checks whether a specific status transition is valid.
 */
export function isValidTransition(from: UserStatus, to: UserStatus): boolean {
  if (from === to) return true;
  return getValidTransitions(from).includes(to);
}

/**
 * Human-readable labels for lifecycle transition actions.
 */
export const TRANSITION_LABELS: Partial<Record<UserStatus, string>> = {
  Active: "Activate",
  Inactive: "Deactivate",
  Suspended: "Suspend",
  Terminated: "Terminate",
  Expired: "Mark Expired",
  Archived: "Archive",
};

/**
 * Destructive transitions that require confirmation.
 */
export const DESTRUCTIVE_TRANSITIONS: UserStatus[] = [
  "Terminated",
  "Archived",
  "Expired",
];

/**
 * Whether a status represents a terminal/non-editable state.
 */
export function isTerminalStatus(status: UserStatus): boolean {
  return status === "Archived";
}
