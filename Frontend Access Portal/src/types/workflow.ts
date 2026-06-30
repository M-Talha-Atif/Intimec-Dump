
import { LucideIcon } from 'lucide-react';

export interface WorkflowStep {
  id: string;
  type: 'trigger' | 'provisioning' | 'approval' | 'notification' | 'condition' | 'wait' | 'webhook' | 'database';
  name: string;
  description: string;
  config: Record<string, any>;
  position: number;
  conditions: string[];
  timeLogic: string | null;
  riskLevel: 'low' | 'medium' | 'high';
}

// This is the data payload for nodes - must extend Record<string, unknown>
export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  stepType: string;
  icon: LucideIcon;
  risk: 'low' | 'medium' | 'high';
  description?: string;
  timeLogic?: string;
  appTarget?: string;
  approvers?: string[];
  conditions?: string[];
  slaTimeout?: number;
  notifications?: boolean;
  notificationTemplate?: string;
  auditLog?: boolean;
  alertOnFailure?: boolean;
  riskFlag?: boolean;
  metadata?: {
    estimatedDuration?: string;
    roleType?: string;
    realLifePurpose?: string;
    complianceFramework?: string[];
  };
}

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'greater_than' | 'less_than';
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

export interface WorkflowApproval {
  id: string;
  approverType: 'manager' | 'role' | 'specific_user';
  approver: string;
  fallbackApprover?: string;
  timeoutHours: number;
  escalationLogic?: string;
}

export interface WorkflowNotification {
  id: string;
  type: 'email' | 'sms' | 'webhook';
  recipient: string;
  template: string;
  conditions?: WorkflowCondition[];
}

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  ruleType: 'javascript' | 'condition_builder' | 'template';
  content: string;
  variables: Record<string, any>;
  testCases?: Array<{
    input: any;
    expectedOutput: any;
  }>;
}

export interface TemplateMetadata {
  id?: string;
  name: string;
  description?: string;
  version: string;
  tags: string[];
  category?: string;
  isConnectedToTemplate: boolean;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
  sourceTemplate?: string;
}
