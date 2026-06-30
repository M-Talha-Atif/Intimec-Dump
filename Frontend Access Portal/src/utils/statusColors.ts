/**
 * Get status color classes for different request/approval statuses
 * Returns Tailwind classes for background and text colors
 */
export const getStatusColor = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; dot: string }> = {
        // Submitted / Pending Initial Review
        submitted: {
            bg: "bg-purple-100 dark:bg-purple-900/30",
            text: "text-purple-700 dark:text-purple-400",
            dot: "bg-purple-500"
        },
        // Pending Approval / In Review
        pending: {
            bg: "bg-yellow-100 dark:bg-yellow-900/30",
            text: "text-yellow-700 dark:text-yellow-400",
            dot: "bg-yellow-500"
        },
        // Approved / Completed
        approved: {
            bg: "bg-green-100 dark:bg-green-900/30",
            text: "text-green-700 dark:text-green-400",
            dot: "bg-green-500"
        },
        // Rejected / Denied
        rejected: {
            bg: "bg-red-100 dark:bg-red-900/30",
            text: "text-red-700 dark:text-red-400",
            dot: "bg-red-500"
        },
        // Provisioned / Granted
        provisioned: {
            bg: "bg-blue-100 dark:bg-blue-900/30",
            text: "text-blue-700 dark:text-blue-400",
            dot: "bg-blue-500"
        },
        // Partially Approved
        partial: {
            bg: "bg-orange-100 dark:bg-orange-900/30",
            text: "text-orange-700 dark:text-orange-400",
            dot: "bg-orange-500"
        },
        // Withdrawn / Cancelled
        withdrawn: {
            bg: "bg-gray-100 dark:bg-gray-800",
            text: "text-gray-700 dark:text-gray-400",
            dot: "bg-gray-500"
        },
        // In Progress / Processing
        inProgress: {
            bg: "bg-blue-100 dark:bg-blue-900/30",
            text: "text-blue-700 dark:text-blue-400",
            dot: "bg-blue-500"
        },
        // Failed / Error
        failed: {
            bg: "bg-red-100 dark:bg-red-900/30",
            text: "text-red-700 dark:text-red-400",
            dot: "bg-red-500"
        },
        // Default fallback
        default: {
            bg: "bg-gray-100 dark:bg-gray-800",
            text: "text-gray-700 dark:text-gray-400",
            dot: "bg-gray-500"
        }
    };

    const normalizedStatus = status?.toLowerCase() || 'default';

    // Handle variations of status names
    if (normalizedStatus.includes('submitted')) return statusMap.submitted;
    if (normalizedStatus.includes('pending') || normalizedStatus.includes('awaiting')) return statusMap.pending;
    if (normalizedStatus.includes('approved')) return statusMap.approved;
    if (normalizedStatus.includes('reject') || normalizedStatus.includes('denied')) return statusMap.rejected;
    if (normalizedStatus.includes('partially')) return statusMap.partial;
    if (normalizedStatus.includes('provision') || normalizedStatus.includes('granted')) return statusMap.provisioned;

    if (normalizedStatus.includes('withdraw') || normalizedStatus.includes('cancel')) return statusMap.withdrawn;
    if (normalizedStatus.includes('progress') || normalizedStatus.includes('processing')) return statusMap.inProgress;
    if (normalizedStatus.includes('fail') || normalizedStatus.includes('error')) return statusMap.failed;

    return statusMap[normalizedStatus] || statusMap.default;
};

/**
 * Get badge variant for status
 * Maps status to shadcn/ui badge variants
 */
export const getStatusBadgeVariant = (status: string) => {
    const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        submitted: "secondary",
        pending: "outline",
        approved: "default",
        rejected: "destructive",
        provisioned: "default",
        partial: "secondary",
        withdrawn: "outline",
        inProgress: "secondary",
        failed: "destructive"
    };

    const normalizedStatus = status?.toLowerCase() || 'default';

    if (normalizedStatus.includes('submitted')) return statusMap.submitted;
    if (normalizedStatus.includes('pending')) return statusMap.pending;
    if (normalizedStatus.includes('approved')) return statusMap.approved;
    if (normalizedStatus.includes('reject')) return statusMap.rejected;
    if (normalizedStatus.includes('partially')) return statusMap.partial;
    if (normalizedStatus.includes('provision')) return statusMap.provisioned;
    if (normalizedStatus.includes('withdraw')) return statusMap.withdrawn;
    if (normalizedStatus.includes('progress')) return statusMap.inProgress;
    if (normalizedStatus.includes('fail')) return statusMap.failed;

    return statusMap[normalizedStatus] || "secondary";
};