import type { Member, MemberFilters } from "../types";

/**
 * Apply search and filters to members array
 */
export const applyMemberFilters = (
  members: Member[],
  filters: MemberFilters
): Member[] => {
  return members.filter((member) => {
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        member.name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower);
      if (!matchesSearch) {
        return false;
      }
    }

    // Apply source filter
    if (filters.source !== "All Sources" && member.source !== filters.source) {
      return false;
    }

    // Apply risk filter
    if (filters.risk !== "All Risk" && member.risk !== filters.risk) {
      return false;
    }

    // Apply status filter
    if (filters.status !== "All Status" && member.status !== filters.status) {
      return false;
    }

    return true;
  });
};

/**
 * Get the appropriate styling for risk levels
 */
export const getRiskColor = (risk: string): string => {
  switch (risk) {
    case "HIGH":
      return "bg-red-100 text-red-800 border-red-200";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "LOW":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

/**
 * Get the appropriate styling for status
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800 border-green-200";
    case "Disabled":
      return "bg-red-100 text-red-800 border-red-200";
    case "Out-of-scope":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};
