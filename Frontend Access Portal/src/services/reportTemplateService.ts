import { ReportDefinition } from './reportService';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Compliance' | 'Certification' | 'Identity Lifecycle' | 'Role Governance' | 'Risk' | 'Operational' | 'IGA' | 'Audit' | 'Analytics' | 'Custom';
  complianceFramework?: 'SOX' | 'GDPR' | 'HIPAA' | 'SOC2' | 'PCI-DSS' | 'ISO 27001';
  definition: ReportDefinition;
  tags: string[];
  previewUrl?: string;
  rating?: number;
  usageCount?: number;
}

export const reportTemplateService = {
  getComplianceTemplates(): ReportTemplate[] {
    return [
      {
        id: 'sox-certification',
        name: 'SOX Access Certification Status',
        description: 'Track access certification progress for SOX compliance',
        category: 'Compliance',
        complianceFramework: 'SOX',
        tags: ['SOX', 'Certification', 'Compliance'],
        rating: 4.8,
        usageCount: 342,
        definition: {
          name: 'SOX Access Certification Status',
          description: 'Access certification campaign progress and completion status',
          dataSource: 'access_reviews',
          fields: ['campaign_name', 'reviewer_id', 'status', 'decision', 'completed_at'],
          filters: { operator: 'AND', conditions: [{ field: 'campaign_type', operator: 'equals', value: 'sox_compliance' }] },
          category: 'Compliance',
          tags: ['SOX', 'Certification'],
        },
      },
      {
        id: 'sox-sod-violations',
        name: 'SOX SoD Violations Report',
        description: 'Segregation of Duties violations requiring remediation',
        category: 'Compliance',
        complianceFramework: 'SOX',
        tags: ['SOX', 'SoD', 'Violations'],
        rating: 4.9,
        usageCount: 428,
        definition: {
          name: 'SOX SoD Violations Report',
          description: 'Active segregation of duties violations',
          dataSource: 'sod_violations',
          fields: ['user_id', 'policy_name', 'conflicting_entitlements', 'risk_level', 'detected_at'],
          filters: { operator: 'AND', conditions: [{ field: 'status', operator: 'equals', value: 'active' }, { field: 'risk_level', operator: 'in', value: ['high', 'critical'] }] },
          category: 'Compliance',
          tags: ['SOX', 'SoD'],
        },
      },
      {
        id: 'gdpr-data-access',
        name: 'GDPR Data Access Report',
        description: 'Track who has access to personal data for GDPR compliance',
        category: 'Compliance',
        complianceFramework: 'GDPR',
        tags: ['GDPR', 'Privacy', 'Data Access'],
        rating: 4.7,
        usageCount: 256,
        definition: {
          name: 'GDPR Data Access Report',
          description: 'Users with access to personal data',
          dataSource: 'entitlements',
          fields: ['user_id', 'entitlement_name', 'application_id', 'data_classification', 'granted_at'],
          filters: { operator: 'AND', conditions: [{ field: 'data_classification', operator: 'equals', value: 'personal_data' }] },
          category: 'Compliance',
          tags: ['GDPR', 'Privacy'],
        },
      },
      {
        id: 'hipaa-phi-access',
        name: 'HIPAA PHI Access Report',
        description: 'Audit trail of Protected Health Information access',
        category: 'Compliance',
        complianceFramework: 'HIPAA',
        tags: ['HIPAA', 'PHI', 'Healthcare'],
        rating: 4.9,
        usageCount: 189,
        definition: {
          name: 'HIPAA PHI Access Report',
          description: 'Access logs for Protected Health Information',
          dataSource: 'audit_logs',
          fields: ['actor_id', 'action', 'target_resource', 'timestamp', 'ip_address', 'justification'],
          filters: { operator: 'AND', conditions: [{ field: 'resource_type', operator: 'equals', value: 'phi' }] },
          sorting: [{ field: 'timestamp', direction: 'desc' }],
          category: 'Compliance',
          tags: ['HIPAA', 'PHI'],
        },
      },
      {
        id: 'governance-posture-summary',
        name: 'Governance Posture Summary',
        description: 'Executive overview of identity governance posture across all compliance frameworks',
        category: 'Compliance',
        tags: ['Governance', 'Executive', 'Posture'],
        rating: 4.8,
        usageCount: 267,
        definition: {
          name: 'Governance Posture Summary',
          description: 'Cross-framework compliance posture with risk indicators',
          dataSource: 'identities',
          fields: ['id', 'email', 'status', 'risk_score', 'entitlement_count', 'high_risk_entitlements'],
          filters: { operator: 'AND', conditions: [] },
          category: 'Compliance',
          tags: ['Governance', 'Executive'],
        },
      },
      {
        id: 'compliance-framework-scorecard',
        name: 'Compliance Framework Scorecard',
        description: 'Detailed compliance scoring per regulatory framework with control-level breakdown',
        category: 'Compliance',
        complianceFramework: 'SOX',
        tags: ['Compliance', 'Scorecard', 'Controls'],
        rating: 4.6,
        usageCount: 198,
        definition: {
          name: 'Compliance Framework Scorecard',
          description: 'Control-level compliance scoring',
          dataSource: 'audit_logs',
          fields: ['action', 'resource_type', 'status', 'timestamp'],
          filters: { operator: 'AND', conditions: [] },
          category: 'Compliance',
          tags: ['Scorecard', 'Controls'],
        },
      },
      {
        id: 'cross-app-risk-heatmap',
        name: 'Cross-Application Risk Heatmap',
        description: 'Visual risk assessment across all connected applications and their entitlements',
        category: 'Risk',
        tags: ['Risk', 'Applications', 'Heatmap'],
        rating: 4.7,
        usageCount: 215,
        definition: {
          name: 'Cross-Application Risk Heatmap',
          description: 'Risk distribution across applications',
          dataSource: 'applications',
          fields: ['name', 'type', 'user_count', 'entitlement_count', 'risk_level'],
          filters: { operator: 'AND', conditions: [] },
          category: 'Risk',
          tags: ['Risk', 'Heatmap'],
        },
      },
      {
        id: 'privileged-access-review-status',
        name: 'Privileged Access Review Status',
        description: 'Status of privileged account certifications and any overdue reviews',
        category: 'Risk',
        tags: ['Privileged', 'Review', 'PAM'],
        rating: 4.9,
        usageCount: 378,
        definition: {
          name: 'Privileged Access Review Status',
          description: 'Privileged access certification tracking',
          dataSource: 'entitlements',
          fields: ['user_id', 'name', 'application_name', 'risk_level', 'last_certified'],
          filters: { operator: 'AND', conditions: [{ field: 'is_privileged', operator: 'equals', value: true }] },
          category: 'Risk',
          tags: ['Privileged', 'PAM'],
        },
      },
    ];
  },

  getCertificationTemplates(): ReportTemplate[] {
    return [
      {
        id: 'campaign-completion-summary',
        name: 'Campaign Completion Summary',
        description: 'Comprehensive view of all certification campaigns with completion rates and decision breakdowns',
        category: 'Certification',
        tags: ['Certification', 'Campaigns', 'Summary'],
        rating: 4.8,
        usageCount: 456,
        definition: {
          name: 'Campaign Completion Summary',
          description: 'Campaign-level completion and decision analytics',
          dataSource: 'access_reviews',
          fields: ['campaign_name', 'status', 'total_items', 'completed_items', 'completion_rate', 'due_date'],
          filters: { operator: 'AND', conditions: [] },
          category: 'Certification',
          tags: ['Campaigns', 'Summary'],
        },
      },
      {
        id: 'reviewer-performance',
        name: 'Reviewer Performance Analysis',
        description: 'Evaluate reviewer response times, decision patterns, and compliance with review SLAs',
        category: 'Certification',
        tags: ['Reviewer', 'Performance', 'SLA'],
        rating: 4.5,
        usageCount: 312,
        definition: {
          name: 'Reviewer Performance Analysis',
          description: 'Reviewer efficiency and quality metrics',
          dataSource: 'access_reviews',
          fields: ['reviewer_id', 'reviewer_email', 'total_items', 'completed_items', 'avg_completion_time', 'decision'],
          filters: { operator: 'AND', conditions: [] },
          grouping: ['reviewer_id'],
          category: 'Certification',
          tags: ['Reviewer', 'Performance'],
        },
      },
      {
        id: 'revocation-tracking',
        name: 'Revocation Tracking Report',
        description: 'Track all access revocations from certification decisions through provisioning execution',
        category: 'Certification',
        tags: ['Revocation', 'Provisioning', 'Tracking'],
        rating: 4.7,
        usageCount: 289,
        definition: {
          name: 'Revocation Tracking Report',
          description: 'End-to-end revocation lifecycle tracking',
          dataSource: 'access_reviews',
          fields: ['campaign_name', 'reviewer_email', 'decision', 'completed_at'],
          filters: { operator: 'AND', conditions: [{ field: 'decision', operator: 'equals', value: 'revoked' }] },
          category: 'Certification',
          tags: ['Revocation', 'Tracking'],
        },
      },
      {
        id: 'overdue-reviews-aging',
        name: 'Overdue Reviews Aging Report',
        description: 'Aging analysis of overdue access reviews with escalation risk indicators',
        category: 'Certification',
        tags: ['Overdue', 'Aging', 'Escalation'],
        rating: 4.6,
        usageCount: 234,
        definition: {
          name: 'Overdue Reviews Aging Report',
          description: 'Overdue reviews with aging buckets',
          dataSource: 'access_reviews',
          fields: ['campaign_name', 'reviewer_email', 'status', 'due_date', 'total_items', 'completed_items'],
          filters: { operator: 'AND', conditions: [{ field: 'status', operator: 'equals', value: 'overdue' }] },
          sorting: [{ field: 'due_date', direction: 'asc' }],
          category: 'Certification',
          tags: ['Overdue', 'Aging'],
        },
      },
      {
        id: 'certification-decision-audit',
        name: 'Certification Decision Audit Trail',
        description: 'Complete audit trail of all certification decisions for compliance evidence',
        category: 'Certification',
        tags: ['Audit Trail', 'Decisions', 'Evidence'],
        rating: 4.9,
        usageCount: 367,
        definition: {
          name: 'Certification Decision Audit Trail',
          description: 'Decision-level audit log for certifications',
          dataSource: 'access_reviews',
          fields: ['campaign_name', 'reviewer_email', 'decision', 'status', 'completed_at'],
          filters: { operator: 'AND', conditions: [] },
          sorting: [{ field: 'completed_at', direction: 'desc' }],
          category: 'Certification',
          tags: ['Audit', 'Decisions'],
        },
      },
    ];
  },

  getLifecycleTemplates(): ReportTemplate[] {
    return [
      {
        id: 'jml-activity',
        name: 'Joiner/Mover/Leaver Activity Report',
        description: 'Track all identity lifecycle events including new hires, transfers, and terminations',
        category: 'Identity Lifecycle',
        tags: ['JML', 'Lifecycle', 'Onboarding'],
        rating: 4.7,
        usageCount: 423,
        definition: {
          name: 'Joiner/Mover/Leaver Activity Report',
          description: 'JML event tracking and analysis',
          dataSource: 'identities',
          fields: ['id', 'email', 'first_name', 'last_name', 'department', 'status', 'created_at', 'updated_at'],
          filters: { operator: 'AND', conditions: [] },
          sorting: [{ field: 'updated_at', direction: 'desc' }],
          category: 'Identity Lifecycle',
          tags: ['JML', 'Lifecycle'],
        },
      },
      {
        id: 'provisioning-sla',
        name: 'Provisioning SLA Compliance',
        description: 'Measure provisioning and de-provisioning performance against defined SLAs',
        category: 'Identity Lifecycle',
        tags: ['Provisioning', 'SLA', 'Performance'],
        rating: 4.6,
        usageCount: 298,
        definition: {
          name: 'Provisioning SLA Compliance',
          description: 'Provisioning task SLA adherence metrics',
          dataSource: 'provisioning_tasks',
          fields: ['task_id', 'identity_id', 'application', 'action', 'status', 'created_at', 'completed_at', 'sla_hours'],
          filters: { operator: 'AND', conditions: [] },
          category: 'Identity Lifecycle',
          tags: ['Provisioning', 'SLA'],
        },
      },
      {
        id: 'stale-accounts',
        name: 'Stale Account Detection Report',
        description: 'Identify accounts with no login activity for configurable periods (30/60/90 days)',
        category: 'Identity Lifecycle',
        tags: ['Stale', 'Dormant', 'Cleanup'],
        rating: 4.8,
        usageCount: 534,
        definition: {
          name: 'Stale Account Detection Report',
          description: 'Dormant accounts requiring review',
          dataSource: 'identities',
          fields: ['id', 'email', 'department', 'last_login', 'status', 'entitlement_count'],
          filters: { operator: 'AND', conditions: [{ field: 'status', operator: 'equals', value: 'active' }] },
          sorting: [{ field: 'last_login', direction: 'asc' }],
          category: 'Identity Lifecycle',
          tags: ['Stale', 'Dormant'],
        },
      },
      {
        id: 'identity-attribute-completeness',
        name: 'Identity Attribute Completeness',
        description: 'Data quality report showing missing or incomplete identity attributes across the directory',
        category: 'Identity Lifecycle',
        tags: ['Data Quality', 'Attributes', 'Completeness'],
        rating: 4.4,
        usageCount: 187,
        definition: {
          name: 'Identity Attribute Completeness',
          description: 'Identity data quality assessment',
          dataSource: 'identities',
          fields: ['id', 'email', 'first_name', 'last_name', 'department', 'title', 'manager_id', 'location'],
          filters: { operator: 'AND', conditions: [] },
          category: 'Identity Lifecycle',
          tags: ['Data Quality', 'Attributes'],
        },
      },
    ];
  },

  getRoleGovernanceTemplates(): ReportTemplate[] {
    return [
      {
        id: 'role-membership-analysis',
        name: 'Role Membership Analysis',
        description: 'Analyze role membership distribution, identify over/under-utilized roles',
        category: 'Role Governance',
        tags: ['Roles', 'Membership', 'Analysis'],
        rating: 4.6,
        usageCount: 345,
        definition: {
          name: 'Role Membership Analysis',
          description: 'Role utilization and membership metrics',
          dataSource: 'roles',
          fields: ['id', 'name', 'type', 'member_count', 'entitlement_count', 'coverage'],
          filters: { operator: 'AND', conditions: [] },
          sorting: [{ field: 'member_count', direction: 'desc' }],
          category: 'Role Governance',
          tags: ['Roles', 'Membership'],
        },
      },
      {
        id: 'entitlement-usage-waste',
        name: 'Entitlement Usage & Waste Report',
        description: 'Identify unused entitlements and access waste across the organization',
        category: 'Role Governance',
        tags: ['Entitlements', 'Usage', 'Waste'],
        rating: 4.7,
        usageCount: 412,
        definition: {
          name: 'Entitlement Usage & Waste Report',
          description: 'Entitlement utilization analysis',
          dataSource: 'entitlements',
          fields: ['name', 'application_name', 'user_count', 'risk_level', 'granted_at', 'last_certified'],
          filters: { operator: 'AND', conditions: [] },
          category: 'Role Governance',
          tags: ['Entitlements', 'Waste'],
        },
      },
      {
        id: 'role-entitlement-coverage',
        name: 'Role-Entitlement Coverage Matrix',
        description: 'Map which entitlements are covered by roles vs directly assigned (role mining input)',
        category: 'Role Governance',
        tags: ['Coverage', 'Matrix', 'Role Mining'],
        rating: 4.5,
        usageCount: 276,
        definition: {
          name: 'Role-Entitlement Coverage Matrix',
          description: 'Role coverage analysis for role mining',
          dataSource: 'roles',
          fields: ['name', 'type', 'entitlement_count', 'member_count', 'coverage'],
          filters: { operator: 'AND', conditions: [] },
          category: 'Role Governance',
          tags: ['Coverage', 'Role Mining'],
        },
      },
      {
        id: 'toxic-access-combinations',
        name: 'Toxic Access Combinations',
        description: 'Detect dangerous entitlement combinations that violate security policies',
        category: 'Role Governance',
        tags: ['Toxic', 'SoD', 'Risk'],
        rating: 4.9,
        usageCount: 389,
        definition: {
          name: 'Toxic Access Combinations',
          description: 'Dangerous entitlement pair detection',
          dataSource: 'sod_violations',
          fields: ['user_id', 'user_email', 'policy_name', 'conflicting_entitlements', 'risk_level', 'status'],
          filters: { operator: 'AND', conditions: [{ field: 'risk_level', operator: 'in', value: ['high', 'critical'] }] },
          category: 'Role Governance',
          tags: ['Toxic', 'SoD'],
        },
      },
    ];
  },

  getOperationalTemplates(): ReportTemplate[] {
    return [
      {
        id: 'access-request-trends',
        name: 'Access Request Trends Report',
        description: 'Analyze access request volumes, approval rates, and turnaround times',
        category: 'Operational',
        tags: ['Requests', 'Trends', 'Volume'],
        rating: 4.5,
        usageCount: 334,
        definition: {
          name: 'Access Request Trends Report',
          description: 'Request volume and approval analytics',
          dataSource: 'access_requests',
          fields: ['request_id', 'requester', 'requested_item', 'status', 'approver', 'submitted_at', 'completed_at', 'sla_met'],
          filters: { operator: 'AND', conditions: [] },
          sorting: [{ field: 'submitted_at', direction: 'desc' }],
          category: 'Operational',
          tags: ['Requests', 'Trends'],
        },
      },
      {
        id: 'approval-sla-compliance',
        name: 'Approval SLA Compliance',
        description: 'Measure approval workflow performance against defined service level agreements',
        category: 'Operational',
        tags: ['Approval', 'SLA', 'Workflow'],
        rating: 4.6,
        usageCount: 278,
        definition: {
          name: 'Approval SLA Compliance',
          description: 'Approval workflow SLA tracking',
          dataSource: 'access_requests',
          fields: ['request_id', 'requester', 'approver', 'status', 'submitted_at', 'completed_at', 'sla_met'],
          filters: { operator: 'AND', conditions: [] },
          category: 'Operational',
          tags: ['Approval', 'SLA'],
        },
      },
      {
        id: 'workflow-execution-performance',
        name: 'Workflow Execution Performance',
        description: 'Monitor automated workflow execution success rates and performance metrics',
        category: 'Operational',
        tags: ['Workflow', 'Automation', 'Performance'],
        rating: 4.4,
        usageCount: 245,
        definition: {
          name: 'Workflow Execution Performance',
          description: 'Workflow automation performance metrics',
          dataSource: 'workflow_executions',
          fields: ['workflow_id', 'workflow_name', 'status', 'started_at', 'completed_at', 'step_count', 'failure_reason'],
          filters: { operator: 'AND', conditions: [] },
          sorting: [{ field: 'started_at', direction: 'desc' }],
          category: 'Operational',
          tags: ['Workflow', 'Automation'],
        },
      },
    ];
  },

  getIGATemplates(): ReportTemplate[] {
    return [
      {
        id: 'orphan-accounts',
        name: 'Orphan Accounts Report',
        description: 'Identify accounts without active owners',
        category: 'IGA',
        tags: ['Identity', 'Lifecycle', 'Risk'],
        rating: 4.6,
        usageCount: 512,
        definition: {
          name: 'Orphan Accounts Report',
          description: 'Accounts without active owners or managers',
          dataSource: 'identities',
          fields: ['id', 'email', 'last_login', 'status', 'created_at'],
          filters: { operator: 'AND', conditions: [{ field: 'manager_id', operator: 'isNull', value: null }, { field: 'status', operator: 'equals', value: 'active' }] },
          category: 'IGA',
          tags: ['Orphan', 'Risk'],
        },
      },
      {
        id: 'privileged-access',
        name: 'Privileged Access Report',
        description: 'Users with privileged or administrative access',
        category: 'IGA',
        tags: ['Privileged Access', 'Security', 'Risk'],
        rating: 4.8,
        usageCount: 456,
        definition: {
          name: 'Privileged Access Report',
          description: 'All users with privileged entitlements',
          dataSource: 'entitlements',
          fields: ['user_id', 'entitlement_name', 'application_id', 'risk_level', 'granted_at', 'last_certified'],
          filters: { operator: 'AND', conditions: [{ field: 'risk_level', operator: 'in', value: ['high', 'critical'] }, { field: 'is_privileged', operator: 'equals', value: true }] },
          category: 'IGA',
          tags: ['Privileged', 'High Risk'],
        },
      },
      {
        id: 'identity-lifecycle',
        name: 'Identity Lifecycle Metrics',
        description: 'Joiner, mover, leaver statistics and trends',
        category: 'IGA',
        tags: ['Lifecycle', 'Metrics', 'Analytics'],
        rating: 4.7,
        usageCount: 378,
        definition: {
          name: 'Identity Lifecycle Metrics',
          description: 'JML statistics for the organization',
          dataSource: 'identities',
          fields: ['status', 'created_at', 'updated_at', 'department'],
          filters: { operator: 'OR', conditions: [] },
          grouping: ['status', 'department'],
          category: 'IGA',
          tags: ['Lifecycle', 'JML'],
        },
      },
      {
        id: 'excessive-permissions',
        name: 'Excessive Permissions Report',
        description: 'Users with more permissions than their peers',
        category: 'IGA',
        tags: ['Access', 'Risk', 'Analytics'],
        rating: 4.5,
        usageCount: 294,
        definition: {
          name: 'Excessive Permissions Report',
          description: 'Outliers with excessive entitlements',
          dataSource: 'identities',
          fields: ['id', 'email', 'department', 'entitlement_count', 'peer_average'],
          filters: { operator: 'AND', conditions: [{ field: 'is_outlier', operator: 'equals', value: true }] },
          category: 'IGA',
          tags: ['Excessive', 'Outlier'],
        },
      },
    ];
  },

  getAllTemplates(): ReportTemplate[] {
    return [
      ...this.getComplianceTemplates(),
      ...this.getCertificationTemplates(),
      ...this.getLifecycleTemplates(),
      ...this.getRoleGovernanceTemplates(),
      ...this.getOperationalTemplates(),
      ...this.getIGATemplates(),
    ];
  },

  getTemplateById(templateId: string): ReportTemplate | undefined {
    return this.getAllTemplates().find((t) => t.id === templateId);
  },

  createFromTemplate(templateId: string): ReportDefinition {
    const template = this.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    return { ...template.definition, name: `${template.name} (Copy)` };
  },

  async saveAsTemplate(definition: ReportDefinition, metadata: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const template: ReportTemplate = {
      id: crypto.randomUUID(),
      name: metadata.name || definition.name,
      description: metadata.description || definition.description,
      category: metadata.category || 'Custom',
      definition,
      tags: metadata.tags || definition.tags || [],
      rating: 0,
      usageCount: 0,
    };
    const templates = this.getCustomTemplates();
    templates.push(template);
    localStorage.setItem('custom_report_templates', JSON.stringify(templates));
    return template;
  },

  getCustomTemplates(): ReportTemplate[] {
    const stored = localStorage.getItem('custom_report_templates');
    return stored ? JSON.parse(stored) : [];
  },

  deleteTemplate(templateId: string): void {
    const templates = this.getCustomTemplates();
    const filtered = templates.filter((t) => t.id !== templateId);
    localStorage.setItem('custom_report_templates', JSON.stringify(filtered));
  },
};
