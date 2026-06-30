import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, ChevronRight, ChevronLeft, Check, Type, Hash, CalendarDays, ToggleLeft, Plus, X, Play, Save, Calendar, Download, Code, Eye, Filter, Layers, Zap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import VisualRuleBuilder, { RuleCondition } from '@/components/shared/VisualRuleBuilder';
import { cn } from '@/lib/utils';

interface DataSource {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: FieldDef[];
}

interface FieldDef {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  group: 'dimension' | 'measure' | 'metadata';
}

const DATA_SOURCES: DataSource[] = [
  {
    id: 'identities', name: 'Identities', icon: '👤', description: 'User accounts, contractors, service accounts',
    fields: [
      { id: 'display_name', name: 'Display Name', type: 'text', group: 'dimension' },
      { id: 'email', name: 'Email', type: 'text', group: 'dimension' },
      { id: 'department', name: 'Department', type: 'text', group: 'dimension' },
      { id: 'job_title', name: 'Job Title', type: 'text', group: 'dimension' },
      { id: 'location', name: 'Location', type: 'text', group: 'dimension' },
      { id: 'manager', name: 'Manager', type: 'text', group: 'dimension' },
      { id: 'risk_score', name: 'Risk Score', type: 'number', group: 'measure' },
      { id: 'entitlement_count', name: 'Entitlement Count', type: 'number', group: 'measure' },
      { id: 'last_login', name: 'Last Login', type: 'date', group: 'metadata' },
      { id: 'created_at', name: 'Created At', type: 'date', group: 'metadata' },
      { id: 'is_active', name: 'Is Active', type: 'boolean', group: 'metadata' },
    ],
  },
  {
    id: 'access_requests', name: 'Access Requests', icon: '📨', description: 'Requests for access to applications and entitlements',
    fields: [
      { id: 'requester', name: 'Requester', type: 'text', group: 'dimension' },
      { id: 'application', name: 'Application', type: 'text', group: 'dimension' },
      { id: 'entitlement', name: 'Entitlement', type: 'text', group: 'dimension' },
      { id: 'status', name: 'Status', type: 'text', group: 'dimension' },
      { id: 'approver', name: 'Approver', type: 'text', group: 'dimension' },
      { id: 'request_date', name: 'Request Date', type: 'date', group: 'metadata' },
      { id: 'resolution_time', name: 'Resolution Time (hrs)', type: 'number', group: 'measure' },
      { id: 'is_emergency', name: 'Emergency Request', type: 'boolean', group: 'metadata' },
    ],
  },
  {
    id: 'access_reviews', name: 'Access Reviews', icon: '📋', description: 'Certification campaigns and review decisions',
    fields: [
      { id: 'campaign_name', name: 'Campaign Name', type: 'text', group: 'dimension' },
      { id: 'reviewer', name: 'Reviewer', type: 'text', group: 'dimension' },
      { id: 'identity', name: 'Identity', type: 'text', group: 'dimension' },
      { id: 'decision', name: 'Decision', type: 'text', group: 'dimension' },
      { id: 'items_reviewed', name: 'Items Reviewed', type: 'number', group: 'measure' },
      { id: 'completion_pct', name: 'Completion %', type: 'number', group: 'measure' },
      { id: 'due_date', name: 'Due Date', type: 'date', group: 'metadata' },
      { id: 'completed_at', name: 'Completed At', type: 'date', group: 'metadata' },
    ],
  },
  {
    id: 'entitlements', name: 'Entitlements', icon: '🔑', description: 'Permissions, roles, and access rights',
    fields: [
      { id: 'name', name: 'Entitlement Name', type: 'text', group: 'dimension' },
      { id: 'application', name: 'Application', type: 'text', group: 'dimension' },
      { id: 'type', name: 'Type', type: 'text', group: 'dimension' },
      { id: 'owner', name: 'Owner', type: 'text', group: 'dimension' },
      { id: 'member_count', name: 'Member Count', type: 'number', group: 'measure' },
      { id: 'risk_level', name: 'Risk Level', type: 'text', group: 'dimension' },
      { id: 'last_certified', name: 'Last Certified', type: 'date', group: 'metadata' },
      { id: 'is_privileged', name: 'Privileged', type: 'boolean', group: 'metadata' },
    ],
  },
  {
    id: 'roles', name: 'Roles', icon: '👥', description: 'Business and IT roles with assignments',
    fields: [
      { id: 'role_name', name: 'Role Name', type: 'text', group: 'dimension' },
      { id: 'role_type', name: 'Role Type', type: 'text', group: 'dimension' },
      { id: 'owner', name: 'Owner', type: 'text', group: 'dimension' },
      { id: 'member_count', name: 'Members', type: 'number', group: 'measure' },
      { id: 'entitlement_count', name: 'Entitlements', type: 'number', group: 'measure' },
      { id: 'risk_score', name: 'Risk Score', type: 'number', group: 'measure' },
      { id: 'created_at', name: 'Created At', type: 'date', group: 'metadata' },
    ],
  },
  {
    id: 'policy_violations', name: 'Policy Violations', icon: '⚠️', description: 'SoD conflicts and policy breaches',
    fields: [
      { id: 'identity', name: 'Identity', type: 'text', group: 'dimension' },
      { id: 'policy', name: 'Policy', type: 'text', group: 'dimension' },
      { id: 'severity', name: 'Severity', type: 'text', group: 'dimension' },
      { id: 'conflict_type', name: 'Conflict Type', type: 'text', group: 'dimension' },
      { id: 'detected_at', name: 'Detected At', type: 'date', group: 'metadata' },
      { id: 'status', name: 'Status', type: 'text', group: 'dimension' },
      { id: 'risk_score', name: 'Risk Score', type: 'number', group: 'measure' },
    ],
  },
  {
    id: 'workflow_executions', name: 'Workflow Executions', icon: '⚙️', description: 'Automated workflow runs and outcomes',
    fields: [
      { id: 'workflow_name', name: 'Workflow Name', type: 'text', group: 'dimension' },
      { id: 'trigger_type', name: 'Trigger', type: 'text', group: 'dimension' },
      { id: 'status', name: 'Status', type: 'text', group: 'dimension' },
      { id: 'initiated_by', name: 'Initiated By', type: 'text', group: 'dimension' },
      { id: 'duration_ms', name: 'Duration (ms)', type: 'number', group: 'measure' },
      { id: 'steps_completed', name: 'Steps Completed', type: 'number', group: 'measure' },
      { id: 'started_at', name: 'Started At', type: 'date', group: 'metadata' },
    ],
  },
  {
    id: 'provisioning_tasks', name: 'Provisioning Tasks', icon: '🔄', description: 'Account creation, update, and deprovisioning tasks',
    fields: [
      { id: 'identity', name: 'Identity', type: 'text', group: 'dimension' },
      { id: 'application', name: 'Application', type: 'text', group: 'dimension' },
      { id: 'action', name: 'Action', type: 'text', group: 'dimension' },
      { id: 'status', name: 'Status', type: 'text', group: 'dimension' },
      { id: 'duration_sec', name: 'Duration (sec)', type: 'number', group: 'measure' },
      { id: 'retry_count', name: 'Retry Count', type: 'number', group: 'measure' },
      { id: 'completed_at', name: 'Completed At', type: 'date', group: 'metadata' },
    ],
  },
  {
    id: 'audit_logs', name: 'Audit Logs', icon: '📝', description: 'System-wide activity and change logs',
    fields: [
      { id: 'actor', name: 'Actor', type: 'text', group: 'dimension' },
      { id: 'action', name: 'Action', type: 'text', group: 'dimension' },
      { id: 'target', name: 'Target', type: 'text', group: 'dimension' },
      { id: 'source_ip', name: 'Source IP', type: 'text', group: 'dimension' },
      { id: 'timestamp', name: 'Timestamp', type: 'date', group: 'metadata' },
      { id: 'success', name: 'Success', type: 'boolean', group: 'metadata' },
    ],
  },
  {
    id: 'applications', name: 'Applications', icon: '🔧', description: 'Connected applications and systems',
    fields: [
      { id: 'app_name', name: 'Application Name', type: 'text', group: 'dimension' },
      { id: 'type', name: 'Type', type: 'text', group: 'dimension' },
      { id: 'owner', name: 'Owner', type: 'text', group: 'dimension' },
      { id: 'user_count', name: 'User Count', type: 'number', group: 'measure' },
      { id: 'entitlement_count', name: 'Entitlements', type: 'number', group: 'measure' },
      { id: 'risk_level', name: 'Risk Level', type: 'text', group: 'dimension' },
      { id: 'last_sync', name: 'Last Sync', type: 'date', group: 'metadata' },
    ],
  },
];

const STEPS = ['Data Source', 'Fields & Metrics', 'Filters & Logic', 'Preview & Save'];

const typeIcon = (type: string) => {
  switch (type) {
    case 'text': return <Type className="h-3 w-3" />;
    case 'number': return <Hash className="h-3 w-3" />;
    case 'date': return <CalendarDays className="h-3 w-3" />;
    case 'boolean': return <ToggleLeft className="h-3 w-3" />;
    default: return <Type className="h-3 w-3" />;
  }
};

const generateMockPreview = (source: DataSource, selectedFields: FieldDef[]): Record<string, any>[] => {
  const mockValues: Record<string, any[]> = {
    display_name: ['John Smith', 'Sarah Jones', 'Mike Chen', 'Lisa Park', 'David Kim'],
    email: ['john.smith@corp.com', 'sarah.jones@corp.com', 'mike.chen@corp.com', 'lisa.park@corp.com', 'david.kim@corp.com'],
    department: ['Finance', 'IT', 'Engineering', 'HR', 'Sales'],
    job_title: ['Senior Analyst', 'IT Manager', 'Software Engineer', 'HR Director', 'Account Executive'],
    location: ['New York', 'San Francisco', 'London', 'Singapore', 'Chicago'],
    manager: ['alice.mgr@corp.com', 'bob.dir@corp.com', 'carol.vp@corp.com', 'dave.svp@corp.com', 'eve.ceo@corp.com'],
    risk_score: [95, 87, 82, 76, 45],
    entitlement_count: [34, 22, 18, 12, 8],
    last_login: ['2024-01-15', '2024-01-14', '2024-01-13', '2024-01-10', '2024-01-08'],
    created_at: ['2023-06-01', '2022-03-15', '2021-09-22', '2023-11-01', '2024-01-02'],
    is_active: [true, true, true, true, false],
    requester: ['john.smith', 'sarah.jones', 'mike.chen', 'lisa.park', 'contractor_42'],
    application: ['SAP ERP', 'Salesforce', 'AWS Console', 'Azure AD', 'ServiceNow'],
    entitlement: ['Finance_Admin', 'Sales_Read', 'EC2_Admin', 'Global_Admin', 'ITSM_User'],
    status: ['Approved', 'Pending', 'Completed', 'Failed', 'In Review'],
    approver: ['alice.mgr@corp.com', 'bob.dir@corp.com', 'carol.vp@corp.com', 'dave.svp@corp.com', 'auto-approved'],
    request_date: ['2024-01-15', '2024-01-14', '2024-01-13', '2024-01-12', '2024-01-11'],
    resolution_time: [2.5, 8.1, 0.5, 24.0, 1.2],
    is_emergency: [false, false, true, false, false],
    campaign_name: ['Q1 SOX Review', 'HIPAA Annual', 'Privileged Access', 'Contractor Review', 'Department Audit'],
    reviewer: ['alice.mgr@corp.com', 'bob.dir@corp.com', 'carol.admin@corp.com', 'dave.ciso@corp.com', 'eve.hr@corp.com'],
    identity: ['john.smith', 'sarah.jones', 'mike.chen', 'contractor_42', 'admin_svc_01'],
    decision: ['Approve', 'Approve', 'Revoke', 'Approve', 'Revoke'],
    items_reviewed: [45, 32, 67, 28, 19],
    completion_pct: [100, 85, 92, 60, 100],
    due_date: ['2024-02-15', '2024-03-01', '2024-02-28', '2024-01-31', '2024-02-10'],
    completed_at: ['2024-01-14', '2024-01-15', '2024-01-13', '', '2024-01-10'],
  };

  return Array.from({ length: 5 }, (_, i) => {
    const row: Record<string, any> = {};
    selectedFields.forEach((f) => {
      const vals = mockValues[f.id];
      if (vals) {
        row[f.id] = vals[i % vals.length];
      } else if (f.type === 'number') {
        row[f.id] = Math.floor(Math.random() * 100);
      } else if (f.type === 'boolean') {
        row[f.id] = i % 2 === 0;
      } else if (f.type === 'date') {
        row[f.id] = `2024-01-${10 + i}`;
      } else {
        row[f.id] = `${f.name} ${i + 1}`;
      }
    });
    return row;
  });
};

export const ReportBuilder = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedFields, setSelectedFields] = useState<FieldDef[]>([]);
  const [conditions, setConditions] = useState<RuleCondition[]>([]);
  const [logicOperator, setLogicOperator] = useState<'AND' | 'OR'>('AND');
  const [scriptValue, setScriptValue] = useState('');
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const { toast } = useToast();

  const source = DATA_SOURCES.find(s => s.id === selectedSource);
  const availableFields = source?.fields || [];

  const groupedFields = useMemo(() => {
    const groups: Record<string, FieldDef[]> = { dimension: [], measure: [], metadata: [] };
    availableFields.forEach(f => { groups[f.group].push(f); });
    return groups;
  }, [availableFields]);

  const toggleField = (field: FieldDef) => {
    setSelectedFields(prev =>
      prev.find(f => f.id === field.id) ? prev.filter(f => f.id !== field.id) : [...prev, field]
    );
  };

  const removeField = (fieldId: string) => {
    setSelectedFields(prev => prev.filter(f => f.id !== fieldId));
  };

  const filterAttributes = useMemo(
    () => selectedFields.map(f => f.name),
    [selectedFields]
  );

  const previewData = useMemo(() => {
    if (!source || selectedFields.length === 0) return [];
    return generateMockPreview(source, selectedFields);
  }, [source, selectedFields]);

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!selectedSource;
      case 1: return selectedFields.length > 0;
      case 2: return true;
      case 3: return !!reportName;
      default: return false;
    }
  };

  const handleSave = () => {
    toast({ title: "Report Saved", description: `"${reportName}" saved with ${selectedFields.length} fields` });
  };

  const handleSchedule = () => {
    toast({ title: "Schedule Created", description: `"${reportName}" has been scheduled` });
  };

  const handleExport = () => {
    toast({ title: "Export Started", description: "Preparing CSV export..." });
  };

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Stepper */}
        <div className="flex items-center gap-2">
          {STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <button
                onClick={() => { if (i < currentStep || canProceed()) setCurrentStep(i); }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  i === currentStep ? "bg-primary text-primary-foreground" :
                  i < currentStep ? "bg-primary/10 text-primary cursor-pointer" :
                  "bg-muted text-muted-foreground"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center h-5 w-5 rounded-full text-xs font-bold",
                  i < currentStep ? "bg-primary text-primary-foreground" : "bg-background border"
                )}>
                  {i < currentStep ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {step}
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Data Source */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Select Data Source</h3>
              <p className="text-sm text-muted-foreground">Choose the primary data source for your report</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {DATA_SOURCES.map((ds) => (
                <Card
                  key={ds.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedSource === ds.id ? "ring-2 ring-primary border-primary" : ""
                  )}
                  onClick={() => { setSelectedSource(ds.id); setSelectedFields([]); setConditions([]); }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{ds.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{ds.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{ds.description}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">{ds.fields.length} fields</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Fields & Metrics */}
        {currentStep === 1 && source && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Select Fields & Metrics</h3>
              <p className="text-sm text-muted-foreground">Click fields to add or remove them from your report</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Fields */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Available Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {Object.entries(groupedFields).map(([group, fields]) => fields.length > 0 && (
                        <div key={group}>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                            {group === 'dimension' && <Layers className="h-3 w-3" />}
                            {group === 'measure' && <Hash className="h-3 w-3" />}
                            {group === 'metadata' && <CalendarDays className="h-3 w-3" />}
                            {group}s
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {fields.map((field) => {
                              const isSelected = selectedFields.some(f => f.id === field.id);
                              return (
                                <button
                                  key={field.id}
                                  onClick={() => toggleField(field)}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                                    isSelected
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-background text-foreground border-border hover:border-primary hover:bg-primary/5"
                                  )}
                                >
                                  {typeIcon(field.type)}
                                  {field.name}
                                  {isSelected && <Check className="h-3 w-3" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Selected Columns */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    Selected Columns
                    <Badge variant="secondary">{selectedFields.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {selectedFields.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <Plus className="h-8 w-8 mb-2 opacity-40" />
                        <p className="text-sm">Click fields on the left to add them</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedFields.map((field, idx) => (
                          <div key={field.id} className="flex items-center gap-2 p-2 rounded-md border bg-muted/30">
                            <span className="text-xs text-muted-foreground w-5">{idx + 1}</span>
                            <div className="flex items-center gap-1.5 flex-1">
                              {typeIcon(field.type)}
                              <span className="text-sm font-medium">{field.name}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">{field.group}</Badge>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeField(field.id)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Filters & Logic */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Filters & Logic</h3>
              <p className="text-sm text-muted-foreground">Define conditions to filter your report data. Switch to Script Editor for complex logic.</p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <VisualRuleBuilder
                  conditions={conditions}
                  onChange={setConditions}
                  logicOperator={logicOperator}
                  onLogicChange={setLogicOperator}
                  scriptValue={scriptValue}
                  onScriptChange={setScriptValue}
                  label="Report Filter Conditions"
                  description="Build filter conditions using the visual builder or switch to script mode for advanced queries."
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Preview & Save */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Preview & Save</h3>
              <p className="text-sm text-muted-foreground">Review your report configuration and save</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="report-name">Report Name *</Label>
                  <Input id="report-name" value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="Enter report name..." />
                </div>
                <div>
                  <Label htmlFor="report-desc">Description</Label>
                  <Textarea id="report-desc" value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} placeholder="Describe what this report shows..." rows={3} />
                </div>
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Configuration Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Data Source</span><span className="font-medium">{source?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Fields</span><span className="font-medium">{selectedFields.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Filters</span><span className="font-medium">{conditions.filter(c => c.attribute && c.value).length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Logic</span><span className="font-medium">{logicOperator}</span></div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Table */}
            {previewData.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Data Preview
                    <Badge variant="secondary">{previewData.length} rows</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <ScrollArea className="h-[250px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {selectedFields.map(f => (
                              <TableHead key={f.id} className="text-xs">{f.name}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewData.map((row, i) => (
                            <TableRow key={i}>
                              {selectedFields.map(f => (
                                <TableCell key={f.id} className="text-sm">
                                  {typeof row[f.id] === 'boolean' ? (row[f.id] ? '✓' : '✗') : String(row[f.id] ?? '-')}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={!reportName}>
                <Save className="h-4 w-4 mr-2" />Save Report
              </Button>
              <Button variant="outline" onClick={handleSchedule} disabled={!reportName}>
                <Calendar className="h-4 w-4 mr-2" />Schedule
              </Button>
              <Button variant="outline" onClick={handleExport} disabled={!reportName}>
                <Download className="h-4 w-4 mr-2" />Export CSV
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" />Back
          </Button>
          {currentStep < STEPS.length - 1 && (
            <Button onClick={() => setCurrentStep(s => s + 1)} disabled={!canProceed()}>
              Next<ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Sidebar Summary */}
      <div className="hidden xl:block w-64 shrink-0">
        <Card className="sticky top-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Builder Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Data Source</p>
              <p className="font-medium">{source ? `${source.icon} ${source.name}` : 'Not selected'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Fields ({selectedFields.length})</p>
              {selectedFields.length === 0 ? (
                <p className="text-muted-foreground text-xs">None selected</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {selectedFields.slice(0, 6).map(f => (
                    <Badge key={f.id} variant="secondary" className="text-xs">{f.name}</Badge>
                  ))}
                  {selectedFields.length > 6 && <Badge variant="outline" className="text-xs">+{selectedFields.length - 6} more</Badge>}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Filters</p>
              <p className="font-medium">{conditions.filter(c => c.attribute && c.value).length} conditions ({logicOperator})</p>
            </div>
            {reportName && (
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Report Name</p>
                <p className="font-medium truncate">{reportName}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
