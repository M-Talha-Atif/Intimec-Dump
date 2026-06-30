import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Request item details from backend
 */
export interface RequestItemDetails {
  itemId: string;
  itemType: string;
  itemName: string;
  itemDescription?: string;
  requestTarget: string;
  beneficiaryUserIds?: string[];
  beneficiaryUserNames?: string[];
  validityDays: number;
  urgency: string;
  justification: string;
  tileId?: string;
  tileName?: string;
  //  ADDED: Provisioning statuses (array)
  provisioningStatuses?: Array<{
    provisioningId: string;
    targetUserId: string;
    status: string;
    provisioningStartedAt?: string;
    provisioningCompletedAt?: string;
    targetSystem?: string;
    externalTicketId?: string;
    errorMessage?: string;
    accessExpiresAt?: string;
  }>;

  //  ADDED: Approval steps nested in item
  approvalSteps?: ApprovalStepDetails[];
}

/**
 * Approval step details
 */
export interface ApprovalStepDetails {
  stepId: string;
  stepOrder: number;
  approverRole: string;
  assignedApproverId?: string;
  assignedApproverName?: string;
  assignedApproverEmail?: string;
  targetUserName?: string;
  status: string;
  assignedAt?: string;
  createdAt?: string;  
  respondedAt?: string;
  decision: string;
  comments?: string;
  delegatedToUserId?: string;
  delegatedToUserName?: string;
  delegatedAt?: string;
}

/**
 * Request comment details
 */
export interface RequestCommentDetails {
  commentId: string;
  commentedByUserId: string;
  commentedByUserName: string;
  commentText: string;
  commentType: string;
  parentCommentId?: string;
  commentedAt: string;
  isInternal?: boolean;
  mentionedUserId?: string;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  logId: string;
  action: string;
  performedByUserId?: string;
  performedByUserName?: string;
  performedBy: string;
  performedAt: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

/**
 * Request metadata
 */
export interface RequestMetadata {
  totalItems: number;
  approvedItems: number;
  rejectedItems: number;
  pendingItems: number;
  riskScore: number;
  hasSODConflicts: boolean;
  hasComplianceFlags: boolean;
  isEmergencyRequest: boolean;
  totalApprovalSteps: number;
  completedApprovalSteps: number;
  currentApprovalStep?: string;
}

/**
 * Complete request details
 */
export interface RequestDetails {
  requestId: string;
  requestedByUserId: string;
  requestedByUserName: string;
  overallJustification: string;
  status: string;
  requestedAt: string;
  lastUpdatedAt: string;
  items: RequestItemDetails[];
  comments: RequestCommentDetails[];
  auditLog: AuditLogEntry[];
  metadata: RequestMetadata;
}

/**
 * Extract user-friendly error message
 */
function getErrorMessage(error: any): string {
  if (error?.error) return error.error;
  if (error?.message) return error.message;
  if (typeof error === 'string') return error;
  return 'Failed to fetch request details. Please try again.';
}

/**
 * Hook for fetching request details
 */
export const useRequestDetails = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches detailed information for a specific request
   */
  const fetchRequestDetails = useCallback(async (
    requestId: string
  ): Promise<RequestDetails | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('[useRequestDetails] Fetching details for:', requestId);

      const response = await fetch(`/api/access-portal/requests/${requestId}/details`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = getErrorMessage(errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      console.log('[useRequestDetails] Success:', {
        requestId: data.data?.requestId || 'unknown',
        itemsCount: data.data?.items?.length || 0,
        approvalStepsCount: data.data?.approvalSteps?.length || 0,

      });

      return data.data as RequestDetails;
    } catch (err) {
      console.error('[useRequestDetails] Error:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);

      toast.error('Failed to load request details', {
        description: errorMessage,
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fetchRequestDetails,
    loading,
    error,
  };
};