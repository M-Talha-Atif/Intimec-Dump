// utils/decisionColors.ts

/**
 * Get decision color classes for approval steps
 * Returns Tailwind classes for background, text, and border colors
 */
export const getDecisionColor = (decision: string) => {
  const decisionMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    approved: {
      bg: "bg-green-100 dark:bg-green-900/20",
      text: "text-green-700 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
      dot: "bg-green-500"
    },
    rejected: {
      bg: "bg-red-100 dark:bg-red-900/20",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
      dot: "bg-red-500"
    },
    pending: {
      bg: "bg-primary/10 dark:bg-primary/20",
      text: "text-primary dark:text-primary",
      border: "border-primary/20 dark:border-primary/30",
      dot: "bg-primary"
    },
    // For backward compatibility with uppercase values
    APPROVED: {
      bg: "bg-green-100 dark:bg-green-900/20",
      text: "text-green-700 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
      dot: "bg-green-500"
    },
    REJECTED: {
      bg: "bg-red-100 dark:bg-red-900/20",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
      dot: "bg-red-500"
    },
    PENDING: {
      bg: "bg-primary/10 dark:bg-primary/20",
      text: "text-primary dark:text-primary",
      border: "border-primary/20 dark:border-primary/30",
      dot: "bg-primary"
    },
    default: {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-700 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-700",
      dot: "bg-gray-500"
    }
  };

  const normalizedDecision = decision?.toUpperCase() || 'DEFAULT';
  
  return decisionMap[normalizedDecision] || decisionMap.default;
};

/**
 * Get badge variant for decision
 * Maps decision to shadcn/ui badge variants
 */
export const getDecisionBadgeVariant = (decision: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (decision?.toUpperCase()) {
    case 'APPROVED':
      return 'default';
    case 'REJECTED':
      return 'destructive';
    case 'PENDING':
      return 'secondary';
    default:
      return 'secondary';
  }
};

/**
 * Get decision icon color
 * Returns Tailwind classes for icon colors
 */
export const getDecisionIconColor = (decision: string) => {
  const decisionMap: Record<string, string> = {
    approved: "text-green-600 dark:text-green-400",
    rejected: "text-red-600 dark:text-red-400",
    pending: "text-primary dark:text-primary",
    APPROVED: "text-green-600 dark:text-green-400",
    REJECTED: "text-red-600 dark:text-red-400",
    PENDING: "text-primary dark:text-primary",
    default: "text-muted-foreground"
  };

  const normalizedDecision = decision?.toUpperCase() || 'DEFAULT';
  return decisionMap[normalizedDecision] || decisionMap.default;
};