// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
// const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface ReportDefinition {
  id?: string;
  name: string;
  description: string;
  dataSource: string;
  fields: string[];
  filters: FilterGroup;
  sorting?: SortConfig[];
  grouping?: string[];
  visualizations?: VisualizationConfig[];
  category?: string;
  tags?: string[];
  isTemplate?: boolean;
}

export interface FilterGroup {
  operator: 'AND' | 'OR';
  conditions: FilterCondition[];
  groups?: FilterGroup[];
}

export interface FilterCondition {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'notIn' | 'isNull' | 'isNotNull' | 'regex';
  value: any;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface VisualizationConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap' | 'table';
  xAxis?: string;
  yAxis?: string;
  series?: string[];
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface ReportResult {
  data: any[];
  metadata: {
    totalRows: number;
    executionTime: number;
    generatedAt: string;
  };
  visualizations?: any[];
}

export interface Field {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  description?: string;
  category?: string;
  sample?: any;
}

export const reportService = {
  async executeReport(reportId: string, params?: Record<string, any>): Promise<ReportResult> {
    const startTime = Date.now();
    
    // Fetch report definition (mock for now - would be real Supabase in production)
    const report = {
      id: reportId,
      name: 'Sample Report',
      definition: {
        dataSource: 'identities',
        fields: ['id', 'email', 'status'],
        filters: { operator: 'AND' as const, conditions: [] },
      },
    };

    // Execute query based on report definition
    const data = await this.fetchReportData(report, params);
    
    const executionTime = Date.now() - startTime;

    return {
      data,
      metadata: {
        totalRows: data.length,
        executionTime,
        generatedAt: new Date().toISOString(),
      },
    };
  },

  async saveReport(definition: ReportDefinition): Promise<any> {
    // Store in localStorage for demo (would be Supabase in production)
    const reports = this.getStoredReports();
    const newReport = {
      id: crypto.randomUUID(),
      name: definition.name,
      description: definition.description,
      definition: definition,
      category: definition.category || 'Custom',
      tags: definition.tags || [],
      is_template: definition.isTemplate || false,
      created_at: new Date().toISOString(),
    };
    reports.push(newReport);
    localStorage.setItem('iga_reports', JSON.stringify(reports));
    return newReport;
  },

  async updateReport(reportId: string, definition: ReportDefinition): Promise<any> {
    const reports = this.getStoredReports();
    const index = reports.findIndex((r: any) => r.id === reportId);
    if (index === -1) throw new Error('Report not found');
    
    reports[index] = {
      ...reports[index],
      name: definition.name,
      description: definition.description,
      definition: definition,
      category: definition.category,
      tags: definition.tags,
      updated_at: new Date().toISOString(),
    };
    
    localStorage.setItem('iga_reports', JSON.stringify(reports));
    return reports[index];
  },

  async deleteReport(reportId: string): Promise<void> {
    const reports = this.getStoredReports();
    const filtered = reports.filter((r: any) => r.id !== reportId);
    localStorage.setItem('iga_reports', JSON.stringify(filtered));
  },

  async getReportData(reportId: string): Promise<any> {
    const reports = this.getStoredReports();
    const report = reports.find((r: any) => r.id === reportId);
    if (!report) throw new Error('Report not found');
    return report;
  },
  
  getStoredReports(): any[] {
    const stored = localStorage.getItem('iga_reports');
    return stored ? JSON.parse(stored) : [];
  },

  validateReportDefinition(definition: ReportDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!definition.name || definition.name.trim() === '') {
      errors.push('Report name is required');
    }

    if (!definition.dataSource) {
      errors.push('Data source is required');
    }

    if (!definition.fields || definition.fields.length === 0) {
      errors.push('At least one field must be selected');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  async getAvailableFields(dataSource: string): Promise<Field[]> {
    // Comprehensive field mappings for all IGA data sources
    const fieldMappings: Record<string, Field[]> = {
      identities: [
        { name: 'id', type: 'string', description: 'User ID', category: 'Identity' },
        { name: 'email', type: 'string', description: 'Email Address', category: 'Identity' },
        { name: 'first_name', type: 'string', description: 'First Name', category: 'Identity' },
        { name: 'last_name', type: 'string', description: 'Last Name', category: 'Identity' },
        { name: 'department', type: 'string', description: 'Department', category: 'Organization' },
        { name: 'title', type: 'string', description: 'Job Title', category: 'Organization' },
        { name: 'manager_id', type: 'string', description: 'Manager ID', category: 'Organization' },
        { name: 'location', type: 'string', description: 'Office Location', category: 'Organization' },
        { name: 'status', type: 'string', description: 'Account Status', category: 'Status' },
        { name: 'risk_score', type: 'number', description: 'Risk Score', category: 'Risk' },
        { name: 'entitlement_count', type: 'number', description: 'Entitlement Count', category: 'Access' },
        { name: 'high_risk_entitlements', type: 'number', description: 'High Risk Entitlements', category: 'Risk' },
        { name: 'last_login', type: 'date', description: 'Last Login Date', category: 'Audit' },
        { name: 'created_at', type: 'date', description: 'Created Date', category: 'Audit' },
        { name: 'updated_at', type: 'date', description: 'Updated Date', category: 'Audit' },
      ],
      access_reviews: [
        { name: 'id', type: 'string', description: 'Review ID', category: 'Review' },
        { name: 'campaign_name', type: 'string', description: 'Campaign Name', category: 'Review' },
        { name: 'reviewer_id', type: 'string', description: 'Reviewer ID', category: 'Review' },
        { name: 'reviewer_email', type: 'string', description: 'Reviewer Email', category: 'Review' },
        { name: 'status', type: 'string', description: 'Review Status', category: 'Status' },
        { name: 'decision', type: 'string', description: 'Decision', category: 'Review' },
        { name: 'total_items', type: 'number', description: 'Total Items', category: 'Metrics' },
        { name: 'completed_items', type: 'number', description: 'Completed Items', category: 'Metrics' },
        { name: 'completion_rate', type: 'number', description: 'Completion Rate %', category: 'Metrics' },
        { name: 'avg_completion_time', type: 'string', description: 'Avg Completion Time', category: 'Metrics' },
        { name: 'created_at', type: 'date', description: 'Created Date', category: 'Audit' },
        { name: 'completed_at', type: 'date', description: 'Completed Date', category: 'Audit' },
        { name: 'due_date', type: 'date', description: 'Due Date', category: 'Audit' },
      ],
      entitlements: [
        { name: 'id', type: 'string', description: 'Entitlement ID', category: 'Access' },
        { name: 'name', type: 'string', description: 'Entitlement Name', category: 'Access' },
        { name: 'type', type: 'string', description: 'Entitlement Type', category: 'Access' },
        { name: 'application_id', type: 'string', description: 'Application ID', category: 'Access' },
        { name: 'application_name', type: 'string', description: 'Application Name', category: 'Access' },
        { name: 'risk_level', type: 'string', description: 'Risk Level', category: 'Risk' },
        { name: 'is_privileged', type: 'boolean', description: 'Is Privileged', category: 'Risk' },
        { name: 'user_count', type: 'number', description: 'User Count', category: 'Metrics' },
        { name: 'data_classification', type: 'string', description: 'Data Classification', category: 'Compliance' },
        { name: 'granted_at', type: 'date', description: 'Granted Date', category: 'Audit' },
        { name: 'last_certified', type: 'date', description: 'Last Certified', category: 'Compliance' },
        { name: 'owner_id', type: 'string', description: 'Owner ID', category: 'Ownership' },
      ],
      audit_logs: [
        { name: 'id', type: 'string', description: 'Log ID', category: 'Audit' },
        { name: 'actor_id', type: 'string', description: 'Actor ID', category: 'Audit' },
        { name: 'actor_email', type: 'string', description: 'Actor Email', category: 'Audit' },
        { name: 'action', type: 'string', description: 'Action', category: 'Audit' },
        { name: 'resource_type', type: 'string', description: 'Resource Type', category: 'Audit' },
        { name: 'resource_id', type: 'string', description: 'Resource ID', category: 'Audit' },
        { name: 'timestamp', type: 'date', description: 'Timestamp', category: 'Audit' },
        { name: 'ip_address', type: 'string', description: 'IP Address', category: 'Security' },
        { name: 'user_agent', type: 'string', description: 'User Agent', category: 'Security' },
        { name: 'status', type: 'string', description: 'Status', category: 'Status' },
        { name: 'details', type: 'string', description: 'Details', category: 'Audit' },
      ],
      sod_violations: [
        { name: 'id', type: 'string', description: 'Violation ID', category: 'Violation' },
        { name: 'user_id', type: 'string', description: 'User ID', category: 'Identity' },
        { name: 'user_email', type: 'string', description: 'User Email', category: 'Identity' },
        { name: 'policy_name', type: 'string', description: 'Policy Name', category: 'Policy' },
        { name: 'conflicting_entitlements', type: 'object', description: 'Conflicting Entitlements', category: 'Violation' },
        { name: 'risk_level', type: 'string', description: 'Risk Level', category: 'Risk' },
        { name: 'status', type: 'string', description: 'Status', category: 'Status' },
        { name: 'detected_at', type: 'date', description: 'Detected Date', category: 'Audit' },
        { name: 'remediation_deadline', type: 'date', description: 'Remediation Deadline', category: 'Compliance' },
      ],
      roles: [
        { name: 'id', type: 'string', description: 'Role ID', category: 'Role' },
        { name: 'name', type: 'string', description: 'Role Name', category: 'Role' },
        { name: 'type', type: 'string', description: 'Role Type', category: 'Role' },
        { name: 'member_count', type: 'number', description: 'Member Count', category: 'Metrics' },
        { name: 'entitlement_count', type: 'number', description: 'Entitlement Count', category: 'Metrics' },
        { name: 'owner_id', type: 'string', description: 'Owner ID', category: 'Ownership' },
        { name: 'coverage', type: 'number', description: 'Coverage %', category: 'Metrics' },
        { name: 'last_certified', type: 'date', description: 'Last Certified', category: 'Compliance' },
        { name: 'created_at', type: 'date', description: 'Created Date', category: 'Audit' },
      ],
      applications: [
        { name: 'id', type: 'string', description: 'Application ID', category: 'Application' },
        { name: 'name', type: 'string', description: 'Application Name', category: 'Application' },
        { name: 'type', type: 'string', description: 'Application Type', category: 'Application' },
        { name: 'owner_id', type: 'string', description: 'Owner ID', category: 'Ownership' },
        { name: 'user_count', type: 'number', description: 'User Count', category: 'Metrics' },
        { name: 'entitlement_count', type: 'number', description: 'Entitlement Count', category: 'Metrics' },
        { name: 'sync_status', type: 'string', description: 'Sync Status', category: 'Status' },
        { name: 'last_sync', type: 'date', description: 'Last Sync', category: 'Audit' },
        { name: 'risk_level', type: 'string', description: 'Risk Level', category: 'Risk' },
      ],
      access_requests: [
        { name: 'request_id', type: 'string', description: 'Request ID', category: 'Request' },
        { name: 'requester', type: 'string', description: 'Requester', category: 'Identity' },
        { name: 'requested_item', type: 'string', description: 'Requested Item', category: 'Access' },
        { name: 'status', type: 'string', description: 'Request Status', category: 'Status' },
        { name: 'approver', type: 'string', description: 'Approver', category: 'Workflow' },
        { name: 'submitted_at', type: 'date', description: 'Submitted Date', category: 'Audit' },
        { name: 'completed_at', type: 'date', description: 'Completed Date', category: 'Audit' },
        { name: 'sla_met', type: 'boolean', description: 'SLA Met', category: 'Metrics' },
      ],
      workflow_executions: [
        { name: 'workflow_id', type: 'string', description: 'Workflow ID', category: 'Workflow' },
        { name: 'workflow_name', type: 'string', description: 'Workflow Name', category: 'Workflow' },
        { name: 'status', type: 'string', description: 'Execution Status', category: 'Status' },
        { name: 'started_at', type: 'date', description: 'Started Date', category: 'Audit' },
        { name: 'completed_at', type: 'date', description: 'Completed Date', category: 'Audit' },
        { name: 'step_count', type: 'number', description: 'Step Count', category: 'Metrics' },
        { name: 'failure_reason', type: 'string', description: 'Failure Reason', category: 'Status' },
      ],
      provisioning_tasks: [
        { name: 'task_id', type: 'string', description: 'Task ID', category: 'Task' },
        { name: 'identity_id', type: 'string', description: 'Identity ID', category: 'Identity' },
        { name: 'application', type: 'string', description: 'Application', category: 'Application' },
        { name: 'action', type: 'string', description: 'Action', category: 'Task' },
        { name: 'status', type: 'string', description: 'Task Status', category: 'Status' },
        { name: 'created_at', type: 'date', description: 'Created Date', category: 'Audit' },
        { name: 'completed_at', type: 'date', description: 'Completed Date', category: 'Audit' },
        { name: 'sla_hours', type: 'number', description: 'SLA Hours', category: 'Metrics' },
      ],
    };

    return fieldMappings[dataSource] || [];
  },

  async previewReport(definition: ReportDefinition, limit: number = 100): Promise<any[]> {
    return this.fetchReportData(definition, {}, limit);
  },

  async fetchReportData(definition: ReportDefinition | any, params?: Record<string, any>, limit?: number): Promise<any[]> {
    const def = definition.definition || definition;
    
    // Mock data for demo (would be real Supabase queries in production)
    const mockData = this.generateMockData(def.dataSource, limit || 100);
    
    // Apply filters if any
    let filtered = mockData;
    if (def.filters?.conditions) {
      filtered = mockData.filter((row: any) => {
        return def.filters.conditions.every((condition: FilterCondition) => {
          const value = row[condition.field];
          switch (condition.operator) {
            case 'equals':
              return value === condition.value;
            case 'contains':
              return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
            case 'gt':
              return value > condition.value;
            case 'lt':
              return value < condition.value;
            case 'gte':
              return value >= condition.value;
            case 'lte':
              return value <= condition.value;
            case 'in':
              return condition.value.includes(value);
            case 'isNull':
              return value === null || value === undefined;
            case 'isNotNull':
              return value !== null && value !== undefined;
            default:
              return true;
          }
        });
      });
    }
    
    // Apply sorting
    if (def.sorting?.length > 0) {
      filtered.sort((a: any, b: any) => {
        for (const sort of def.sorting) {
          const aVal = a[sort.field];
          const bVal = b[sort.field];
          if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered.slice(0, limit || 100);
  },
  
  generateMockData(dataSource: string, count: number): any[] {
    // Rich IGA mock data generation
    const data: any[] = [];
    for (let i = 0; i < count; i++) {
      switch (dataSource) {
        case 'identities':
          data.push({
            id: `id-${i + 1}`,
            email: `user${i + 1}@company.com`,
            first_name: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa'][i % 8],
            last_name: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'][i % 8],
            department: ['Engineering', 'Sales', 'HR', 'Finance', 'Operations', 'IT', 'Legal', 'Marketing'][i % 8],
            title: ['Engineer', 'Manager', 'Director', 'Analyst', 'Specialist', 'VP', 'Coordinator'][i % 7],
            status: ['active', 'inactive', 'suspended', 'pending'][i % 4],
            risk_score: Math.floor(Math.random() * 100),
            manager_id: i > 0 ? `id-${Math.floor(i / 5) + 1}` : null,
            location: ['US-NY', 'US-CA', 'UK-LON', 'DE-BER', 'JP-TKY'][i % 5],
            last_login: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            entitlement_count: Math.floor(Math.random() * 50),
            high_risk_entitlements: Math.floor(Math.random() * 10),
          });
          break;
        case 'access_reviews':
          data.push({
            id: `review-${i + 1}`,
            campaign_name: `Q${Math.floor(i / 8) + 1} ${['Access', 'SOD', 'Privileged', 'Compliance'][i % 4]} Review`,
            reviewer_id: `id-${(i % 10) + 1}`,
            reviewer_email: `manager${(i % 10) + 1}@company.com`,
            status: ['in_progress', 'completed', 'pending', 'overdue'][i % 4],
            decision: ['approved', 'revoked', 'pending', null][i % 4],
            total_items: Math.floor(Math.random() * 100) + 20,
            completed_items: Math.floor(Math.random() * 80),
            completion_rate: Math.round(Math.random() * 100),
            avg_completion_time: `${Math.floor(Math.random() * 72)}h`,
            created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            completed_at: i % 3 === 0 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
            due_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
          break;
        case 'entitlements':
          data.push({
            id: `ent-${i + 1}`,
            name: `${['Read', 'Write', 'Admin', 'Execute', 'Delete'][i % 5]} ${['Salesforce', 'SAP', 'Workday', 'GitHub', 'AWS'][i % 5]}`,
            type: ['role', 'permission', 'group'][i % 3],
            application_id: `app-${(i % 5) + 1}`,
            application_name: ['Salesforce', 'SAP', 'Workday', 'GitHub', 'AWS'][i % 5],
            risk_level: ['low', 'medium', 'high', 'critical'][i % 4],
            is_privileged: i % 4 === 0,
            user_count: Math.floor(Math.random() * 200),
            data_classification: ['public', 'internal', 'confidential', 'restricted'][i % 4],
            granted_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
            last_certified: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            owner_id: `id-${(i % 10) + 1}`,
          });
          break;
        case 'audit_logs':
          data.push({
            id: `audit-${i + 1}`,
            actor_id: `id-${(i % 20) + 1}`,
            actor_email: `user${(i % 20) + 1}@company.com`,
            action: ['login', 'logout', 'access_granted', 'access_revoked', 'data_export', 'config_change'][i % 6],
            resource_type: ['identity', 'entitlement', 'application', 'role', 'policy'][i % 5],
            resource_id: `res-${i + 1}`,
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            user_agent: 'Mozilla/5.0',
            status: ['success', 'failed', 'warning'][i % 3],
            details: `Action performed on ${['identity', 'entitlement', 'application'][i % 3]}`,
          });
          break;
        case 'sod_violations':
          data.push({
            id: `sod-${i + 1}`,
            user_id: `id-${(i % 15) + 1}`,
            user_email: `user${(i % 15) + 1}@company.com`,
            policy_name: `SOD-${['Finance', 'Procurement', 'IT Admin', 'Security'][i % 4]}-${i + 1}`,
            conflicting_entitlements: [
              `${['Create', 'Approve'][i % 2]} Purchase Orders`,
              `${['Execute', 'Audit'][i % 2]} Transactions`
            ],
            risk_level: ['medium', 'high', 'critical'][i % 3],
            status: ['active', 'remediated', 'exception_granted'][i % 3],
            detected_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
            remediation_deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
          break;
        case 'roles':
          data.push({
            id: `role-${i + 1}`,
            name: `${['Business', 'Technical', 'Application'][i % 3]} ${['Admin', 'User', 'Manager', 'Viewer'][i % 4]} Role`,
            type: ['business', 'technical', 'application'][i % 3],
            member_count: Math.floor(Math.random() * 100) + 10,
            entitlement_count: Math.floor(Math.random() * 30) + 5,
            owner_id: `id-${(i % 10) + 1}`,
            coverage: Math.round(Math.random() * 100),
            last_certified: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          });
          break;
        case 'applications':
          data.push({
            id: `app-${i + 1}`,
            name: ['Salesforce', 'SAP', 'Workday', 'ServiceNow', 'GitHub', 'AWS', 'Azure', 'Okta'][i % 8],
            type: ['cloud', 'on-premise', 'hybrid'][i % 3],
            owner_id: `id-${(i % 10) + 1}`,
            user_count: Math.floor(Math.random() * 500) + 50,
            entitlement_count: Math.floor(Math.random() * 100) + 20,
            sync_status: ['active', 'error', 'paused'][i % 3],
            last_sync: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            risk_level: ['low', 'medium', 'high'][i % 3],
          });
          break;
        case 'access_requests':
          data.push({
            request_id: `req-${i + 1}`,
            requester: `user${(i % 20) + 1}@company.com`,
            requested_item: `${['Read', 'Write', 'Admin'][i % 3]} Access - ${['Salesforce', 'SAP', 'Workday', 'GitHub', 'AWS'][i % 5]}`,
            status: ['pending', 'approved', 'rejected', 'provisioned', 'expired'][i % 5],
            approver: `manager${(i % 8) + 1}@company.com`,
            submitted_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            completed_at: i % 3 !== 0 ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString() : null,
            sla_met: i % 4 !== 3,
          });
          break;
        case 'workflow_executions':
          data.push({
            workflow_id: `wf-${i + 1}`,
            workflow_name: `${['Onboarding', 'Offboarding', 'Access Request', 'Role Assignment', 'Certification'][i % 5]} Workflow`,
            status: ['completed', 'failed', 'running', 'queued'][i % 4],
            started_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
            completed_at: i % 4 !== 2 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
            step_count: Math.floor(Math.random() * 8) + 3,
            failure_reason: i % 4 === 1 ? ['Timeout', 'Connector error', 'Validation failed', 'Target unavailable'][i % 4] : null,
          });
          break;
        case 'provisioning_tasks':
          data.push({
            task_id: `prov-${i + 1}`,
            identity_id: `id-${(i % 30) + 1}`,
            application: ['Salesforce', 'SAP', 'Workday', 'ServiceNow', 'GitHub', 'AWS', 'Azure', 'Okta'][i % 8],
            action: ['create_account', 'disable_account', 'grant_entitlement', 'revoke_entitlement', 'update_attributes'][i % 5],
            status: ['completed', 'failed', 'pending', 'in_progress'][i % 4],
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            completed_at: i % 4 < 2 ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString() : null,
            sla_hours: [4, 8, 24, 48, 72][i % 5],
          });
          break;
        default:
          data.push({ id: i, value: `Sample ${i}` });
      }
    }
    return data;
  },
};
