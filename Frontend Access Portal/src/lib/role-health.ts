
import { Role } from "@/types/roles";
import { differenceInMonths } from "date-fns";

export type HealthIssue = {
  key: string;
  message: string;
  severity: 'warning' | 'info';
};

export const getRoleHealthIssues = (role: Role): HealthIssue[] => {
  if (!role) return [];
  
  const issues: HealthIssue[] = [];
  const now = new Date();

  // Check 1: Not certified in over 12 months
  if (differenceInMonths(now, new Date(role.lastReviewed)) >= 12) {
    issues.push({
      key: 'stale-review',
      message: 'This role has not been reviewed in over a year and may contain outdated or excessive permissions.',
      severity: 'warning'
    });
  }

  // Check 2: No users assigned (and not deprecated)
  if (role.userCount === 0 && role.status !== 'Deprecated') {
    issues.push({
      key: 'no-users',
      message: 'This role has no users assigned. It could be a candidate for deprecation to reduce role sprawl.',
      severity: 'info'
    });
  }

  return issues;
}
