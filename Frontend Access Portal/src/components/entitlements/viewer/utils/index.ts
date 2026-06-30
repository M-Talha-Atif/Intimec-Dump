/**
 * Get the appropriate styling for risk levels
 */
export const getRiskColor = (risk: string): string => {
  switch (risk.toLowerCase()) {
    case "low":
      return "bg-green-50 text-green-700 border-green-200";
    case "medium":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "high":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "critical":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

/**
 * Get the appropriate styling for lifecycle status
 */
export const getLifecycleColor = (lifecycle: string): string => {
  return lifecycle === "Active"
    ? "border-green-300 bg-green-50 text-green-700"
    : "border-gray-300 bg-gray-50 text-gray-600";
};
