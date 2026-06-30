export interface TooltipContent {
  title: string;
  description: string;
  example?: string;
  learnMoreUrl?: string;
  bestPractice?: string;
  impactLevel?: 'low' | 'medium' | 'high';
}

// Toolbar Action Tooltips
export const toolbarTooltips: Record<string, TooltipContent> = {
  save: {
    title: 'Save Workflow',
    description: 'Saves current workflow with all node configurations and connections to the database.',
    bestPractice: 'Save frequently to avoid losing work',
    impactLevel: 'low',
  },
  load: {
    title: 'Load Workflow',
    description: 'Opens a previously saved workflow from the database or imports from file.',
    bestPractice: 'Create backups before loading to avoid overwriting',
    impactLevel: 'medium',
  },
  test: {
    title: 'Test Workflow',
    description: 'Simulates workflow execution with sample data to validate logic and identify issues.',
    example: 'Test with mock user data',
    bestPractice: 'Test all conditional branches',
    impactLevel: 'low',
  },
  export: {
    title: 'Export Workflow',
    description: 'Downloads workflow as JSON file for backup, version control, or sharing.',
    bestPractice: 'Export before major changes for rollback',
    impactLevel: 'low',
  },
  import: {
    title: 'Import Workflow',
    description: 'Loads workflow from JSON file or template library.',
    bestPractice: 'Review imported workflows before deploying',
    impactLevel: 'medium',
  },
  undo: {
    title: 'Undo',
    description: 'Reverts the last change made to the workflow.',
    bestPractice: 'Use liberally - changes are tracked',
    impactLevel: 'low',
  },
  redo: {
    title: 'Redo',
    description: 'Reapplies a change that was previously undone.',
    impactLevel: 'low',
  },
  autoLayout: {
    title: 'Auto Layout',
    description: 'Automatically arranges nodes in a hierarchical layout for better readability.',
    bestPractice: 'Use after adding multiple nodes',
    impactLevel: 'low',
  },
  duplicate: {
    title: 'Duplicate Workflow',
    description: 'Creates a copy of the current workflow with a new name.',
    bestPractice: 'Duplicate before making experimental changes',
    impactLevel: 'low',
  },
  share: {
    title: 'Share Workflow',
    description: 'Generates shareable link or exports workflow to template library.',
    impactLevel: 'low',
  },
  print: {
    title: 'Print / PDF',
    description: 'Generates printable documentation of the workflow for auditors or compliance.',
    bestPractice: 'Include in compliance documentation',
    impactLevel: 'low',
  },
  reset: {
    title: 'Reset Canvas',
    description: 'Clears all nodes and starts with a blank canvas.',
    bestPractice: 'Export before resetting to avoid data loss',
    impactLevel: 'high',
  },
  darkMode: {
    title: 'Toggle Dark Mode',
    description: 'Switches between light and dark color schemes for comfortable viewing.',
    impactLevel: 'low',
  },
};

// Property Panel Tooltips
export const propertyTooltips: Record<string, TooltipContent> = {
  label: {
    title: 'Node Label',
    description: 'Display name for this node in the workflow diagram.',
    example: 'Manager Approval',
    bestPractice: 'Use descriptive names that explain the action',
    impactLevel: 'low',
  },
  description: {
    title: 'Description',
    description: 'Detailed explanation of what this node does and why it exists.',
    example: 'Requires manager approval for all access requests over $10k value',
    bestPractice: 'Include business justification for auditors',
    impactLevel: 'low',
  },
  risk: {
    title: 'Risk Level',
    description: 'Impact assessment for this operation - affects audit logging and approval requirements.',
    example: 'High: Grants admin privileges',
    bestPractice: 'High-risk nodes should always require approval',
    impactLevel: 'high',
  },
  slaTimeout: {
    title: 'SLA Timeout (hours)',
    description: 'Maximum time allowed for this step before escalation or auto-approval.',
    example: '24 (1 business day)',
    bestPractice: 'Set based on business requirements and audit standards',
    impactLevel: 'medium',
  },
  notifications: {
    title: 'Send Notifications',
    description: 'Whether to send email/SMS notifications at key workflow milestones.',
    bestPractice: 'Enable for approval requests and failures',
    impactLevel: 'low',
  },
  auditLog: {
    title: 'Audit Logging',
    description: 'Records detailed execution logs for compliance and troubleshooting.',
    bestPractice: 'Always enable for high-risk and compliance-critical operations',
    impactLevel: 'medium',
  },
  alertOnFailure: {
    title: 'Alert on Failure',
    description: 'Sends immediate alerts to admins if this step fails.',
    bestPractice: 'Enable for critical provisioning and security operations',
    impactLevel: 'medium',
  },
  appTarget: {
    title: 'Target Application',
    description: 'The system or application where this action will be performed.',
    example: 'Active Directory, Salesforce, SAP',
    bestPractice: 'Ensure target system credentials are configured',
    impactLevel: 'high',
  },
  approvers: {
    title: 'Approver List',
    description: 'Users or roles who can approve at this step. Supports dynamic approvers.',
    example: '$manager, role:security-admin',
    bestPractice: 'Include fallback approvers to avoid bottlenecks',
    impactLevel: 'high',
  },
  conditions: {
    title: 'Conditional Logic',
    description: 'Rules that determine whether this step executes.',
    example: 'user.department == "Engineering" AND risk_score > 50',
    bestPractice: 'Test all condition branches thoroughly',
    impactLevel: 'high',
  },
  stepType: {
    title: 'Step Type',
    description: 'The category of operation this node performs in the workflow.',
    bestPractice: 'Choose the most specific type for accurate execution',
    impactLevel: 'high',
  },
  timeout: {
    title: 'Execution Timeout',
    description: 'Maximum time in seconds for this operation before it times out.',
    example: '300 (5 minutes)',
    bestPractice: 'Set realistic timeouts based on system performance',
    impactLevel: 'medium',
  },
};
