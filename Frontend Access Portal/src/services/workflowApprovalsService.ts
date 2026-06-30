/**
 * Service for fetching workflow approval details
 */

// Use Next.js API proxy to handle auth cookies automatically
const API_BASE_URL = '/api';

export interface ApprovalAction {
  actionId: string;
  label: string;
  actionType: 'APPROVE' | 'REJECT' | 'DELEGATE';
  apiEndpoint: string;
  httpMethod: string;
  style: 'primary' | 'danger' | 'secondary';
  requiresComment: boolean;
}

export interface WorkflowApprovalDetails {
  id: string;
  executionId: string;
  nodeExecutionId: string;
  approverId: string;
  approverType: string;
  decision: 'PENDING' | 'APPROVED' | 'REJECTED' | 'TIMEOUT' | 'DELEGATED';
  comments?: string;
  delegatedTo?: string;
  requestedAt: string;
  respondedAt?: string;
  timeoutAt?: string;
  approvalContext: {
    workflowName?: string;
    requestedBy?: string;
    triggeredBy?: string;
    [key: string]: any;
  };
  evidenceBundle?: Record<string, any>;
}

class WorkflowApprovalsService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    console.log('[WorkflowApprovalsService] Auth check:', { 
      hasToken: !!token, 
      hasUserId: !!userId,
      tokenLength: token?.length 
    });
    
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(userId ? { 'X-User-ID': userId } : {}),
    };
  }

  /**
   * Get pending approvals for the current user
   */
  async getPendingApprovals(approverId: string): Promise<WorkflowApprovalDetails[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/approvals/by-approver/${approverId}/pending`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
          credentials: 'include', // Send cookies
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch approvals: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return [];
    }
  }

  /**
   * Get a specific approval by ID
   */
  async getApprovalById(approvalId: string): Promise<WorkflowApprovalDetails | null> {
    try {
      const headers = this.getAuthHeaders();
      console.log('[WorkflowApprovalsService] Fetching approval:', approvalId);
      console.log('[WorkflowApprovalsService] Headers:', headers);
      console.log('[WorkflowApprovalsService] URL:', `${API_BASE_URL}/approvals/${approvalId}`);
      
      const response = await fetch(
        `${API_BASE_URL}/approvals/${approvalId}`,
        {
          method: 'GET',
          headers,
          credentials: 'include', // Send cookies
        }
      );

      console.log('[WorkflowApprovalsService] Response status:', response.status);

      if (!response.ok) {
        // 404 is expected for deleted/stale approvals - don't log as error
        if (response.status === 404) {
          console.log('[WorkflowApprovalsService] Approval not found (deleted or stale):', approvalId);
        } else if (response.status === 500) {
          // Check if it's actually a "not found" wrapped in 500 (legacy behavior)
          const errorText = await response.text();
          if (errorText.includes('not found') || errorText.includes('Not found')) {
            console.log('[WorkflowApprovalsService] Approval not found (deleted or stale):', approvalId);
          } else {
            console.error('[WorkflowApprovalsService] Server error:', errorText);
          }
        } else {
          const errorText = await response.text();
          console.error('[WorkflowApprovalsService] Error response:', errorText);
        }
        return null; // Return null for any error instead of throwing
      }

      const data = await response.json();
      console.log('[WorkflowApprovalsService] Approval data:', data);
      return data;
    } catch (error) {
      console.error('[WorkflowApprovalsService] Error fetching approval:', error);
      return null;
    }
  }

  /**
   * Approve an approval request
   */
  async approveRequest(approvalId: string, comments?: string): Promise<void> {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(
        `${API_BASE_URL}/approvals/${approvalId}/approve`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ comments: comments || '' }),
          credentials: 'include', // Send cookies
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to approve' }));
        throw new Error(error.message || 'Failed to approve');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  }

  /**
   * Reject an approval request
   */
  async rejectRequest(approvalId: string, comments: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/approvals/${approvalId}/reject`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ comments }),
          credentials: 'include', // Send cookies
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to reject' }));
        throw new Error(error.message || 'Failed to reject');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  }

  /**
   * Delegate an approval request
   */
  async delegateRequest(approvalId: string, delegateToUserId: string): Promise<void> {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(
        `${API_BASE_URL}/approvals/${approvalId}/delegate`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            currentApproverId: userId,
            delegateToUserId,
          }),
          credentials: 'include', // Send cookies
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to delegate' }));
        throw new Error(error.message || 'Failed to delegate');
      }
    } catch (error) {
      console.error('Error delegating request:', error);
      throw error;
    }
  }

  /**
   * Generate action buttons for an approval
   */
  generateActions(approvalId: string): ApprovalAction[] {
    return [
      {
        actionId: 'approve',
        label: 'Approve',
        actionType: 'APPROVE',
        apiEndpoint: `${API_BASE_URL}/approvals/${approvalId}/approve`,
        httpMethod: 'POST',
        style: 'primary',
        requiresComment: false,
      },
      {
        actionId: 'reject',
        label: 'Reject',
        actionType: 'REJECT',
        apiEndpoint: `${API_BASE_URL}/approvals/${approvalId}/reject`,
        httpMethod: 'POST',
        style: 'danger',
        requiresComment: true,
      },
      {
        actionId: 'delegate',
        label: 'Delegate',
        actionType: 'DELEGATE',
        apiEndpoint: `${API_BASE_URL}/approvals/${approvalId}/delegate`,
        httpMethod: 'POST',
        style: 'secondary',
        requiresComment: false,
      },
    ];
  }
}

export const workflowApprovalsService = new WorkflowApprovalsService();
