import { useQuery } from "@tanstack/react-query";
import { TaskDetails, WorkflowTaskDetails, RiskLevel } from "@/types/tasks";

/**
 * Fetches task details from the real API.
 * Returns actual approval data from workflows-service.
 */
const fetchTaskDetails = async (taskId: string): Promise<WorkflowTaskDetails> => {
  const response = await fetch(`/api/responsibilities/my-tasks/${taskId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch task details');
  }

  const data = await response.json();
  
  // Map backend TaskDetailsDTO to frontend TaskDetails type
  return mapBackendToFrontend(data);
};

/**
 * Maps backend TaskDetailsDTO to frontend WorkflowTaskDetails.
 * Only includes fields that have actual data.
 */
function mapBackendToFrontend(data: any): WorkflowTaskDetails {
  const context = data.approvalContext || {};
  
  // Calculate SLA status based on dueAt
  const slaStatus = calculateSlaStatus(data.dueAt);
  
  // Map risk level
  const risk: RiskLevel = mapRiskLevel(data.risk || context.riskLevel);
  
  // Build requester from context data
  const requester = buildRequester(data, context);
  
  // Build timeline from data
  const timeline = buildTimeline(data);
  
  return {
    id: data.id,
    type: 'Workflow',
    title: data.title || buildTitle(context),
    status: mapStatus(data.status),
    createdAt: data.createdAt,
    dueAt: data.dueAt,
    risk,
    requester,
    assignee: data.assignee?.id ? { id: data.assignee.id, name: data.assignee.name || 'Approver' } : undefined,
    sla: slaStatus,
    justification: data.justification || context.justification,
    
    // Role info
    role: data.role?.id ? {
      id: data.role.id,
      name: data.role.name,
      type: data.role.type,
    } : context.roleName ? {
      id: context.roleId,
      name: context.roleName,
      type: context.roleType,
    } : undefined,
    
    // Application info (only if present)
    application: data.applicationName ? {
      id: context.applicationId || '',
      name: data.applicationName,
    } : undefined,
    
    // Workflow-specific fields
    tileName: data.tileName || context.tileName,
    roleName: data.role?.name || context.roleName,
    applicationName: data.applicationName || context.applicationName,
    workflowName: data.workflowName || context.workflowName,
    workflowInstanceId: data.workflowInstanceId || context.executionId,
    approvalId: data.approvalId || data.id,
    requestType: data.eventType || context.eventType,
    
    // Multi-approval info (if present)
    approvalPolicy: data.approvalPolicy,
    requiredApprovals: data.requiredApprovals,
    
    // Timeline events
    timeline,
    
    // Evidence bundle (actual data from workflow)
    evidenceBundle: data.evidenceBundle,
    
    // Dynamic event-based fields (for conditional UI rendering)
    eventType: data.eventType,
    singlePermission: data.singlePermission,
    permissionList: data.permissionList,
    targetUsersList: data.targetUsersList,
    approvalContext: data.approvalContext,
    
    // No fake data - these are empty unless actually present
    changes: undefined,
    sodFindings: undefined,
    comments: undefined,
    attachments: undefined,
  };
}

function buildTitle(context: any): string {
  const roleName = context.roleName;
  const workflowName = context.workflowName;
  const tileName = context.tileName;
  
  if (tileName && roleName) {
    return `Approve ${tileName} access for ${roleName}`;
  }
  if (roleName) {
    return `Approve ${roleName} role assignment`;
  }
  if (workflowName) {
    return `Approve ${workflowName}`;
  }
  return 'Approval Request';
}

function mapStatus(status: string): 'Pending' | 'InProgress' | 'Completed' | 'Expired' {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'Pending';
    case 'in_progress':
    case 'inprogress':
      return 'InProgress';
    case 'completed':
    case 'approved':
    case 'rejected':
      return 'Completed';
    case 'expired':
    case 'timeout':
      return 'Expired';
    default:
      return 'Pending';
  }
}

function mapRiskLevel(risk: string | undefined): RiskLevel {
  switch (risk?.toLowerCase()) {
    case 'critical':
      return 'critical';
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    case 'low':
      return 'low';
    default:
      return 'medium';
  }
}

function calculateSlaStatus(dueAt: string | undefined): { status: 'ok' | 'dueSoon' | 'overdue'; secondsRemaining?: number } | undefined {
  if (!dueAt) return undefined;
  
  const due = new Date(dueAt);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const secondsRemaining = Math.floor(diffMs / 1000);
  
  if (secondsRemaining < 0) {
    return { status: 'overdue', secondsRemaining: 0 };
  }
  if (secondsRemaining < 86400) { // Less than 24 hours
    return { status: 'dueSoon', secondsRemaining };
  }
  return { status: 'ok', secondsRemaining };
}

function buildRequester(data: any, context: any): { id: string; name: string; email?: string } | undefined {
  // Try data.requester first
  if (data.requester?.name) {
    return {
      id: data.requester.id || context.userId || '',
      name: data.requester.name,
      email: data.requester.email,
    };
  }
  
  // Fall back to context
  if (context.createdBy || context.triggeredBy) {
    return {
      id: context.userId || context.triggeredBy || '',
      name: context.createdBy || 'Unknown',
      email: context.requesterEmail,
    };
  }
  
  return undefined;
}

function buildTimeline(data: any): { at: string; actor: string; action: string; note?: string }[] {
  const timeline: { at: string; actor: string; action: string; note?: string }[] = [];
  
  // Use timeline from backend if available
  if (data.timeline && Array.isArray(data.timeline) && data.timeline.length > 0) {
    return data.timeline.map((event: any) => ({
      at: event.timestamp || event.at,
      actor: event.actor || 'System',
      action: event.type || event.action || event.description,
      note: event.description || event.note,
    }));
  }
  
  // Build minimal timeline from approval lifecycle
  if (data.createdAt) {
    timeline.push({
      at: data.createdAt,
      actor: 'System',
      action: 'Created',
      note: 'Approval request created',
    });
  }
  
  return timeline;
}

export function useTaskDetails(taskId?: string) {
  return useQuery({
    queryKey: ['task', 'details', taskId],
    enabled: !!taskId,
    queryFn: () => fetchTaskDetails(taskId!),
    staleTime: 30000,
  });
}
