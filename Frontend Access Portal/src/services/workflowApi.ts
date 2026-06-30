/**
 * Workflow API Service
 * Handles all workflow CRUD operations with the backend
 */

import { Node, Edge } from '@xyflow/react';
import { WorkflowNodeData } from '@/types/workflow';

// Use Next.js API routes (/api) which are handled by catch-all route
// The catch-all route converts cookies to Authorization headers and forwards to API Gateway
const API_BASE_URL = '/api';

// Types matching backend expectations
export interface WorkflowCreateRequest {
  // Basic Info
  name: string;
  description: string;
  category: string;
  owner?: string; // For future owner assignment feature
  
  // Trigger & Scope
  triggerType: string;
  triggerConditions?: string; // For future advanced trigger conditions
  eventConfig?: {
    services: string[];
    eventTypes: string[];
  };
  cronSchedule?: string;
  applicationScope?: string[];
  businessJustification?: string; // For audit/compliance purposes
  tags?: string[];
  complianceFrameworks?: string[];
  
  // Risk & Compliance
  riskScore?: number;
  riskLevel?: 'low' | 'medium' | 'high'; // Alternative to riskScore
  hasTimeLogic?: boolean;
  hasSodViolation?: boolean;
  roleSensitivity?: string;
  policyCompliance?: string;
  sensitiveData?: boolean; // For future data classification
  externalIntegration?: boolean; // For future integration tracking
  
  // Graph data
  nodes: any[];
  edges: any[];
  
  // Template metadata
  sourceTemplateId?: string;
  templateName?: string; // For reference only
  templateVersion?: string; // For reference only
  permissions?: Record<string, boolean>;
}

export interface WorkflowResponse {
  id: string;
  name: string;
  description: string;
  status: string;
  version: string;
  category: string;
  nodes: any[];
  edges: any[];
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

class WorkflowApiService {
  private getAuthToken(): string | null {
    // Get token from cookie (auth_token)
    if (typeof window !== 'undefined') {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];
      return cookieValue || null;
    }
    return null;
  }

  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  }

  private getUserInfoFromToken(): { userId?: string; username?: string; tenantId?: string } {
    const token = this.getAuthToken();
    if (!token) return {};

    const decoded = this.decodeJWT(token);
    if (!decoded) return {};

    return {
      userId: decoded.sub || decoded.userId,
      username: decoded.username || decoded.sub,
      tenantId: decoded.tenantId
    };
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    // Next.js API routes automatically handle auth from cookies
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Log request for debugging
    console.log('API Request:', {
      endpoint,
      method: options.method || 'GET',
      body: options.body ? JSON.parse(options.body as string) : undefined
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 204 No Content responses first (e.g., from DELETE)
    // 204 responses have no body, so we return immediately
    if (response.status === 204) {
      return undefined as T;
    }

    if (!response.ok) {
      // For 403 errors, let the global interceptor handle the toast
      // Return null to signal permission denial without throwing
      if (response.status === 403) {
        return null as T;
      }
      
      const errorText = await response.text();
      let errorMessage = `API Error: ${response.status}`;
      let validationErrors: string[] = [];
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
        
        // Extract validation errors from backend ApiResponse format
        if (errorJson.errors) {
          if (typeof errorJson.errors === 'object' && !Array.isArray(errorJson.errors)) {
            validationErrors = Object.entries(errorJson.errors).map(
              ([field, msg]) => `${field}: ${msg}`
            );
          } else if (Array.isArray(errorJson.errors)) {
            validationErrors = errorJson.errors.map((err: any) => 
              typeof err === 'string' ? err : (err.defaultMessage || err.message || String(err))
            );
          }
        }
        
        // Only log non-validation errors (validation errors show as toasts)
        if (response.status !== 400) {
          console.error('API Error:', {
            endpoint,
            status: response.status,
            message: errorMessage,
            errorData: errorJson
          });
        }
      } catch (parseError) {
        errorMessage = errorText || errorMessage;
        // Only log non-validation parse errors
        if (response.status !== 400) {
          console.error('API Error (non-JSON):', {
            endpoint,
            status: response.status,
            errorText
          });
        }
      }
      
      // Create enhanced error with validation details
      const error = new Error(errorMessage) as any;
      error.status = response.status;
      error.validationErrors = validationErrors;
      
      throw error;
    }

    const json = await response.json();
    
    // Unwrap response if it's wrapped in { success, data } envelope
    if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
      console.log('Unwrapping API response envelope');
      return json.data as T;
    }
    
    return json as T;
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(data: WorkflowCreateRequest): Promise<WorkflowResponse> {
    console.log('Creating workflow:', data);
    
    return this.makeRequest<WorkflowResponse>('/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get a workflow by ID
   */
  async getWorkflow(id: string): Promise<WorkflowResponse> {
    return this.makeRequest<WorkflowResponse>(`/workflows/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Update an existing workflow
   */
  async updateWorkflow(id: string, data: Partial<WorkflowCreateRequest>): Promise<WorkflowResponse> {
    console.log('Updating workflow:', id, data);
    
    return this.makeRequest<WorkflowResponse>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Partial update (for auto-save)
   */
  async partialUpdateWorkflow(id: string, updates: { nodes?: any[]; edges?: any[] }): Promise<WorkflowResponse> {
    return this.makeRequest<WorkflowResponse>(`/workflows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(id: string): Promise<void> {
    return this.makeRequest<void>(`/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * List all workflows
   */
  async listWorkflows(params?: {
    status?: string;
    category?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: WorkflowResponse[]; totalElements: number }> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/workflows${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<{ content: WorkflowResponse[]; totalElements: number }>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Get all workflows (alias for listWorkflows with default params)
   */
  async getWorkflows(): Promise<{ content: WorkflowResponse[]; totalElements: number }> {
    return this.listWorkflows({ size: 100 });
  }

  /**
   * Update workflow status (draft -> enabled/active)
   * Frontend uses "draft" and "enabled", backend uses "DRAFT" and "ACTIVE"
   */
  async updateWorkflowStatus(id: string, status: 'draft' | 'enabled' | 'archived'): Promise<WorkflowResponse> {
    // Map frontend status to backend status
    const backendStatus = status === 'enabled' ? 'ACTIVE' : 
                         status === 'archived' ? 'DEPRECATED' :
                         status.toUpperCase();
    
    // Use existing PATCH endpoint with just status field
    return this.partialUpdateWorkflow(id, { status: backendStatus } as any);
  }

  /**
   * Transform frontend status to backend format
   */
  private transformStatusToBackend(status?: string): string {
    if (!status) return 'DRAFT';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'enabled') return 'ACTIVE';
    if (lowerStatus === 'archived') return 'DEPRECATED';
    return 'DRAFT';
  }

  /**
   * Map frontend stepType to backend semantic type
   */
  private mapStepTypeToSemanticType(stepType: string): string {
    // If stepType already contains a dot, it's already in backend format (e.g., trigger.start, approval.single)
    if (stepType.includes('.')) {
      return stepType;
    }
    
    // Legacy mappings for old stepType values without dots
    const typeMap: Record<string, string> = {
      'trigger': 'trigger.start',
      'approval': 'approval.single',
      'condition': 'condition.if',
      'provisioning': 'action.provision',
      'notification': 'notification.email',
      'wait': 'wait.duration',
      'webhook': 'integration.webhook',
      'database': 'action.database',
      'script': 'action.script',
      'api': 'integration.api',
      'validation': 'validation.check'
    };
    
    // Return mapped value or use as-is (don't add "action." prefix)
    return typeMap[stepType] || stepType;
  }

  /**
   * Prepare workflow data for API submission
   * Converts ReactFlow nodes/edges to backend format
   */
  prepareWorkflowData(
    formData: any,
    nodes: Node<WorkflowNodeData>[],
    edges: Edge[]
  ): WorkflowCreateRequest {
    console.log('prepareWorkflowData received:', {
      formData,
      formDataName: formData?.name,
      formDataNameLength: formData?.name?.length,
      nodes: nodes.length,
      edges: edges.length
    });
    
    return {
      // Basic Info
      name: formData.name,
      description: formData.description,
      category: formData.category?.toUpperCase().replace(/-/g, '_') || 'ACCESS_REQUEST', // Backend expects UPPER_CASE with underscores
      // Note: status is not sent on create - backend sets initial status automatically
      
      // Trigger & Scope
      triggerType: formData.triggerType?.toUpperCase().replace(/-/g, '_') || 'MANUAL',
      eventConfig: formData.eventConfig,
      cronSchedule: formData.cronSchedule,
      applicationScope: formData.applicationScope || [],
      tags: formData.tags || [],
      complianceFrameworks: formData.complianceFrameworks || [],
      
      // Risk & Compliance
      riskScore: formData.riskScore || 0,
      hasTimeLogic: formData.hasTimeLogic || false,
      hasSodViolation: formData.hasSodViolation || false,
      roleSensitivity: formData.roleSensitivity?.toUpperCase(),
      policyCompliance: formData.policyCompliance?.toUpperCase(),
      
      // Graph data - separate UI from execution config
      nodes: nodes.map(node => {
        const { label, stepType, icon, risk, description, metadata, ...executionConfig } = node.data;
        
        // Map stepType to semantic execution type
        const semanticType = this.mapStepTypeToSemanticType(stepType as string);
        
        return {
          id: node.id,
          type: semanticType, // Use semantic type for execution
          position: node.position,
          data: {
            // Execution configuration
            ...executionConfig,
            
            // UI metadata (preserved for designer)
            ui: {
              label,
              stepType,
              icon: typeof icon === 'function' ? icon.name || 'Settings' : icon || 'Settings',
              risk,
              description,
              metadata
            }
          }
        };
      }),
      edges: edges.map(edge => {
        // Determine if edge should be conditional based on label or data
        const isConditional = edge.label?.toLowerCase().includes('if') || 
                            edge.label?.toLowerCase().includes('when') ||
                            edge.data?.condition;
        
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          type: isConditional ? 'conditional' : 'default', // Semantic edge type
          label: edge.label,
          condition: edge.data?.condition || (isConditional ? { 
            field: 'status',
            operator: 'EQUALS',
            value: 'SUCCESS' 
          } : undefined),
          data: {
            ...edge.data,
            ui: {
              type: edge.type, // Preserve ReactFlow type for UI
              label: edge.label
            }
          }
        };
      }),
      
      // Template metadata
      sourceTemplateId: formData.templateId,
    };
    
    console.log('✅ prepareWorkflowData - sourceTemplateId:', formData.templateId);
    console.log('✅ Complete prepared data:', JSON.stringify(result, null, 2));
    
    return result;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string, context?: Record<string, any>): Promise<any> {
    const userInfo = this.getUserInfoFromToken();
    
    const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({
        triggeredBy: userInfo.username || userInfo.userId || 'system',
        context: context || {},
        triggerType: 'MANUAL',
        dryRun: false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to execute workflow');
    }

    return response.json();
  }

  /**
   * Simulate a workflow (dry run with real-time WebSocket updates)
   */
  async simulateWorkflow(workflowId: string, context?: Record<string, any>): Promise<any> {
    const userInfo = this.getUserInfoFromToken();
    
    // Ensure context is a valid object
    const validContext = context && typeof context === 'object' ? context : {};
    
    const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        triggeredBy: userInfo.username || userInfo.userId || 'system',
        context: validContext,
        triggerType: 'MANUAL'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to simulate workflow';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Approve or reject a simulation approval node
   */
  async approveSimulation(executionId: string, approved: boolean, reason?: string): Promise<any> {
    const params = new URLSearchParams({
      approved: String(approved),
      ...(reason && { reason }),
    });

    const url = `${API_BASE_URL}/simulations/${executionId}/approve?${params}`;
    console.log('[API] Calling approval endpoint:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    console.log('[API] Approval response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Approval error response:', errorText);
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.message || `Failed to process approval (${response.status})`);
      } catch (e) {
        throw new Error(`Failed to process approval (${response.status}): ${errorText}`);
      }
    }

    return response.json();
  }

  /**
   * Get execution status
   */
  async getExecution(executionId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/executions/${executionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get execution status');
    }

    return response.json();
  }

  /**
   * Get execution trace (path through workflow)
   */
  async getExecutionTrace(executionId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/executions/${executionId}/trace`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get execution trace');
    }

    return response.json();
  }

  /**
   * Cancel a running execution
   */
  async cancelExecution(executionId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/executions/${executionId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel execution');
    }

    return response.json();
  }

  /**
   * Retry a failed execution
   */
  async retryExecution(executionId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/executions/${executionId}/retry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to retry execution');
    }

    return response.json();
  }

  /**
   * Get global execution statistics
   */
  async getExecutionStatistics(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/executions/statistics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get execution statistics');
    }

    return response.json();
  }

  /**
   * List workflow executions with filters
   */
  async listExecutions(params?: {
    page?: number;
    size?: number;
    workflowId?: string;
    status?: string;
    includeDetails?: boolean;
  }): Promise<any> {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.includeDetails !== undefined) queryParams.append('includeDetails', String(params.includeDetails));
    
    let url = `${API_BASE_URL}/executions`;
    
    // If workflowId is provided, use the workflow-specific endpoint
    if (params?.workflowId) {
      url = `${API_BASE_URL}/workflows/${params.workflowId}/executions`;
    }
    
    // Append query parameters if any
    if (queryParams.toString()) {
      url += '?' + queryParams.toString();
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to list executions');
    }

    return response.json();
  }

  // ============================================
  // Template API Methods
  // ============================================

  async listTemplates(systemOnly?: boolean): Promise<any> {
    const params = new URLSearchParams();
    if (systemOnly !== undefined) {
      params.append('systemOnly', systemOnly.toString());
    }
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/templates${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to list templates');
    }

    return response.json();
  }

  async getTemplate(templateId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get template');
    }

    return response.json();
  }

  async createTemplate(templateData: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create template');
    }

    return response.json();
  }

  async updateTemplate(templateId: string, templateData: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update template');
    }

    return response.json();
  }

  async deleteTemplate(templateId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete template');
    }
  }

  async instantiateTemplate(templateId: string, workflowName: string, variableValues: Record<string, any>): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}/instantiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        workflowName,
        variableValues,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to instantiate template');
    }

    return response.json();
  }

  async listPopularTemplates(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/templates/popular`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to list popular templates');
    }

    return response.json();
  }

  async listTopRatedTemplates(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/templates/top-rated`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to list top-rated templates');
    }

    return response.json();
  }
}

export const workflowApi = new WorkflowApiService();
