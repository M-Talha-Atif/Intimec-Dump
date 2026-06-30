"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkflowSimulation } from '@/hooks/useWorkflowSimulation';
import { ApprovalDialog } from './ApprovalDialog';
import { 
  Play, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle,
  User, FileText, Zap, UserCheck, Mail, Shield, Bot, 
  TrendingUp, AlertCircle, MapPin, X, Plus, Code, Search
} from 'lucide-react';

interface SimulationStep {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  duration: number;
  output?: any;
  error?: string;
  conditions?: string[];
  riskLevel: string;
  pathTaken?: string;
  sodViolation?: boolean;
  approvalRequired?: boolean;
}

interface WorkflowSimulatorProps {
  workflow?: any;
  workflows?: any[]; // List of all workflows to select from
  onWorkflowSelect?: (workflow: any) => void; // Callback when workflow is selected
}

const WorkflowSimulator = ({ workflow, workflows = [], onWorkflowSelect }: WorkflowSimulatorProps) => {
  // Use real simulation hook - pass workflow ID if available
  const workflowId = workflow?.id && workflow.id !== 'unsaved' ? workflow.id : '';
  
  console.log('[WorkflowSimulator] Component mounted/updated', { workflowId, workflowName: workflow?.name });
  
  const { 
    isRunning, 
    simulationResult, 
    currentStep, 
    error, 
    approvalPending,
    startSimulation, 
    processApproval 
  } = useWorkflowSimulation(workflowId);
  
  const [selectedIdentity, setSelectedIdentity] = useState('test-user');
  const [inputMode, setInputMode] = useState<'visual' | 'json'>('visual');
  
  // Visual form state
  const [approvers, setApprovers] = useState<string[]>([
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002'
  ]);
  const [userId, setUserId] = useState('550e8400-e29b-41d4-a716-446655440000');
  const [userEmail, setUserEmail] = useState('john.doe@company.com');
  const [userDepartment, setUserDepartment] = useState('Engineering');
  const [userTitle, setUserTitle] = useState('Software Developer');
  const [roleId, setRoleId] = useState('550e8400-e29b-41d4-a716-446655440010');
  const [applicationId, setApplicationId] = useState('550e8400-e29b-41d4-a716-446655440020');
  
  // Pre-fill input data with workflow context or default
  const [inputData, setInputData] = useState('');
  
  // Build JSON from visual form
  const buildJsonFromForm = () => {
    return {
      identity: {
        id: userId,
        employeeId: "EMP001",
        firstName: userEmail.split('@')[0].split('.')[0] || "John",
        lastName: userEmail.split('@')[0].split('.')[1] || "Doe",
        email: userEmail,
        department: userDepartment,
        title: userTitle,
        manager: "manager@company.com",
        managerId: approvers[0] || "550e8400-e29b-41d4-a716-446655440001",
        startDate: new Date().toISOString().split('T')[0],
        location: "Office",
        riskScore: 3.2,
        sensitiveAccess: ["Production DB"]
      },
      ownerIds: approvers,
      roleId: roleId,
      applicationId: applicationId,
      trigger: {
        type: "simulation_test",
        source: "Workflow Simulator",
        timestamp: new Date().toISOString()
      },
      tenantId: "default-tenant",
      userId: userId
    };
  };

  // Update JSON when visual form changes
  React.useEffect(() => {
    if (inputMode === 'visual') {
      setInputData(JSON.stringify(buildJsonFromForm(), null, 2));
    }
  }, [approvers, userId, userEmail, userDepartment, userTitle, roleId, applicationId, inputMode]);

  // Add/remove approvers
  const addApprover = () => {
    const newId = `00000000-0000-0000-0000-${String(approvers.length + 1).padStart(12, '0')}`;
    setApprovers([...approvers, newId]);
  };

  const removeApprover = (index: number) => {
    setApprovers(approvers.filter((_, i) => i !== index));
  };

  const updateApprover = (index: number, value: string) => {
    const updated = [...approvers];
    updated[index] = value;
    setApprovers(updated);
  };
  
  // Update input data when workflow changes
  React.useEffect(() => {
    if (workflow?.context) {
      // Use workflow context from designer
      setInputData(JSON.stringify(workflow.context, null, 2));
    } else {
      // Use default template with all expected context fields
      setInputData(`{
  "identity": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "department": "Engineering",
    "title": "Software Developer",
    "manager": "jane.smith@company.com",
    "managerId": "550e8400-e29b-41d4-a716-446655440001",
    "startDate": "2024-06-20",
    "location": "New York",
    "riskScore": 3.2,
    "sensitiveAccess": ["Production DB", "Customer Data"]
  },
  "ownerIds": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ],
  "roleId": "550e8400-e29b-41d4-a716-446655440010",
  "applicationId": "550e8400-e29b-41d4-a716-446655440020",
  "trigger": {
    "type": "new_hire",
    "source": "HR System",
    "timestamp": "2024-06-20T09:00:00Z"
  },
  "tenantId": "default-tenant",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}`);
    }
  }, [workflow]);
  
  // Real simulation function using backend API + WebSocket
  const runSimulation = async () => {
    try {
      // Call the real simulation hook, passing workflow data if unsaved
      await startSimulation(inputData, workflow);
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };
  
  // Derive risk insights from real simulation results
  const getRiskInsights = () => {
    if (!simulationResult || simulationResult.length === 0) return null;
    
    const highRiskSteps = simulationResult.filter(s => s.riskLevel === 'high').length;
    const failedSteps = simulationResult.filter(s => s.status === 'failed').length;
    const sodViolations = simulationResult.filter(s => s.sodViolation).length;
    const approvalSteps = simulationResult.filter(s => s.approvalRequired).length;
    const totalDuration = simulationResult.reduce((sum, s) => sum + s.duration, 0);
    
    const overallRisk = highRiskSteps > 2 ? 'high' : highRiskSteps > 0 ? 'medium' : 'low';
    
    return {
      overallRisk,
      highRiskSteps,
      failedSteps,
      sodViolations,
      approvalSteps,
      totalDuration,
      completedSteps: simulationResult.filter(s => s.status === 'completed').length,
      totalSteps: simulationResult.length
    };
  };
  
  const riskInsights = getRiskInsights();

  const testIdentities = [
    { id: 'test-user', name: 'Standard User (Low Risk)', risk: 'low' },
    { id: 'high-risk-user', name: 'Executive (High Risk)', risk: 'high' },
    { id: 'contractor', name: 'External Contractor', risk: 'medium' },
    { id: 'temp-user', name: 'Temporary Employee', risk: 'medium' }
  ];

  // Generate sample data based on selected identity
  const generateSampleData = (identityType: string) => {
    const templates: Record<string, any> = {
      'test-user': {
        identity: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          employeeId: "EMP001",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@company.com",
          department: "Engineering",
          title: "Software Developer",
          manager: "jane.smith@company.com",
          managerId: "550e8400-e29b-41d4-a716-446655440001",
          startDate: "2024-06-20",
          location: "New York",
          riskScore: 2.5,
          sensitiveAccess: ["Production DB"]
        },
        ownerIds: ["550e8400-e29b-41d4-a716-446655440001"],
        roleId: "550e8400-e29b-41d4-a716-446655440010",
        applicationId: "550e8400-e29b-41d4-a716-446655440020",
        trigger: { type: "new_hire", source: "HR System", timestamp: new Date().toISOString() },
        tenantId: "default-tenant",
        userId: "550e8400-e29b-41d4-a716-446655440000"
      },
      'high-risk-user': {
        identity: {
          id: "550e8400-e29b-41d4-a716-446655440100",
          employeeId: "EMP100",
          firstName: "Sarah",
          lastName: "Executive",
          email: "sarah.executive@company.com",
          department: "Executive",
          title: "Chief Information Officer",
          manager: "ceo@company.com",
          managerId: "550e8400-e29b-41d4-a716-446655440200",
          startDate: "2024-06-20",
          location: "San Francisco",
          riskScore: 8.5,
          sensitiveAccess: ["Production DB", "Customer Data", "Financial Systems", "Admin Access"]
        },
        ownerIds: ["550e8400-e29b-41d4-a716-446655440200", "550e8400-e29b-41d4-a716-446655440201"],
        roleId: "550e8400-e29b-41d4-a716-446655440011",
        applicationId: "550e8400-e29b-41d4-a716-446655440021",
        trigger: { type: "role_assignment", source: "IAM System", timestamp: new Date().toISOString() },
        tenantId: "default-tenant",
        userId: "550e8400-e29b-41d4-a716-446655440100"
      },
      'contractor': {
        identity: {
          id: "550e8400-e29b-41d4-a716-446655440300",
          employeeId: "CON001",
          firstName: "Mike",
          lastName: "Contractor",
          email: "mike.contractor@external.com",
          department: "Engineering",
          title: "Contract Developer",
          manager: "jane.smith@company.com",
          managerId: "550e8400-e29b-41d4-a716-446655440001",
          startDate: "2024-06-20",
          endDate: "2024-12-31",
          location: "Remote",
          riskScore: 5.0,
          sensitiveAccess: ["Development Environment"],
          contractorType: "external"
        },
        ownerIds: ["550e8400-e29b-41d4-a716-446655440001"],
        roleId: "550e8400-e29b-41d4-a716-446655440012",
        applicationId: "550e8400-e29b-41d4-a716-446655440022",
        trigger: { type: "contractor_onboarding", source: "Vendor System", timestamp: new Date().toISOString() },
        tenantId: "default-tenant",
        userId: "550e8400-e29b-41d4-a716-446655440300"
      },
      'temp-user': {
        identity: {
          id: "550e8400-e29b-41d4-a716-446655440400",
          employeeId: "TMP001",
          firstName: "Lisa",
          lastName: "Temporary",
          email: "lisa.temp@company.com",
          department: "Operations",
          title: "Temporary Admin",
          manager: "ops.manager@company.com",
          managerId: "550e8400-e29b-41d4-a716-446655440500",
          startDate: "2024-06-20",
          endDate: "2024-09-30",
          location: "Chicago",
          riskScore: 4.0,
          sensitiveAccess: ["Office Systems"],
          employmentType: "temporary"
        },
        ownerIds: ["550e8400-e29b-41d4-a716-446655440500"],
        roleId: "550e8400-e29b-41d4-a716-446655440013",
        applicationId: "550e8400-e29b-41d4-a716-446655440023",
        trigger: { type: "temp_hire", source: "HR System", timestamp: new Date().toISOString() },
        tenantId: "default-tenant",
        userId: "550e8400-e29b-41d4-a716-446655440400"
      }
    };

    return templates[identityType] || templates['test-user'];
  };

  // Handle identity selection change
  const handleIdentityChange = (value: string) => {
    setSelectedIdentity(value);
    const sampleData = generateSampleData(value);
    setInputData(JSON.stringify(sampleData, null, 2));
  };

  const getStepIcon = (type: string) => {
    const icons = {
      trigger: Zap,
      'ai-decision': Bot,
      condition: FileText,
      approval: Shield,
      provisioning: UserCheck,
      notification: Mail
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  // Map technical node type to user-friendly label
  const getNodeLabel = (nodeName: string, nodeType: string): string => {
    // If the name is already user-friendly (not a technical type), return it
    if (!nodeName || (!nodeName.includes('.') && !nodeName.startsWith('trigger') && !nodeName.startsWith('action') && !nodeName.startsWith('approval') && !nodeName.startsWith('condition'))) {
      return nodeName;
    }

    // Map technical types to friendly labels
    const typeMapping: Record<string, string> = {
      'trigger.start': 'Start',
      'trigger.end': 'End',
      'approval.manager': 'Manager Approval',
      'approval.admin': 'Admin Approval',
      'approval.custom': 'Custom Approval',
      'approval': 'Approval',
      'action.http': 'HTTP Request',
      'action.email': 'Send Email',
      'action.notify': 'Send Notification',
      'action.notification': 'Send Notification',
      'action.webhook': 'Webhook',
      'action.provision': 'Provision Access',
      'action.deprovision': 'Revoke Access',
      'action.script': 'Run Script',
      'action.database': 'Database Query',
      'action.api': 'API Call',
      'action.custom': 'Custom Action',
      'condition.if': 'Condition',
      'condition.switch': 'Switch Condition',
      'provisioning': 'Provision Access',
      'notification': 'Send Notification',
    };

    return typeMapping[nodeName] || typeMapping[nodeType] || nodeName;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'skipped': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const progress = simulationResult ? 
    (simulationResult.filter(s => s.status === 'completed').length / simulationResult.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Workflow Selection/Info Banner */}
      {!workflow ? (
        // No workflow selected - Show selector
        <Card className="border-l-4 border-l-amber-500 bg-amber-50/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Search className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Select a Workflow to Simulate
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Choose a workflow from the list below to test it with sample data and see execution paths, timing, and risk predictions.
                </p>
                {workflows.length > 0 ? (
                  <Select onValueChange={(value) => {
                    const selected = workflows.find(w => w.id === value);
                    if (selected && onWorkflowSelect) {
                      onWorkflowSelect(selected);
                    }
                  }}>
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select a workflow to simulate..." />
                    </SelectTrigger>
                    <SelectContent>
                      {workflows
                        .filter(w => w.status === 'enabled' || w.status === 'draft')
                        .map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            <div className="flex items-center gap-2">
                              <span>{w.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {w.category}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-gray-600 bg-white rounded p-3 border">
                    No workflows available. Create a workflow in the Catalog tab first.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Workflow selected - Show info banner
        <Card className="border-l-4 border-l-blue-500 bg-blue-50/30">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Simulating: {workflow.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {workflow.description || 'Test this workflow with sample data to see execution paths, timing, and risk predictions'}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    {workflow.category && (
                      <Badge variant="outline" className="text-xs">
                        {workflow.category}
                      </Badge>
                    )}
                    {workflow.status && (
                      <Badge variant="secondary" className="text-xs">
                        {workflow.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {workflows.length > 1 && onWorkflowSelect && (
                <Select 
                  value={workflow.id}
                  onValueChange={(value) => {
                    const selected = workflows.find(w => w.id === value);
                    if (selected) {
                      onWorkflowSelect(selected);
                    }
                  }}
                >
                  <SelectTrigger className="w-[200px] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workflows
                      .filter(w => w.status === 'enabled' || w.status === 'draft')
                      .map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Simulation Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'visual' | 'json')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="visual">
                  <User className="h-4 w-4 mr-2" />
                  Visual Editor
                </TabsTrigger>
                <TabsTrigger value="json">
                  <Code className="h-4 w-4 mr-2" />
                  JSON Editor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="visual" className="space-y-4 mt-4">
                {/* User Information */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">User ID (UUID)</Label>
                    <Input
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="550e8400-e29b-41d4-a716-446655440000"
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Email</Label>
                      <Input
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="user@company.com"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Department</Label>
                      <Input
                        value={userDepartment}
                        onChange={(e) => setUserDepartment(e.target.value)}
                        placeholder="Engineering"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Job Title</Label>
                    <Input
                      value={userTitle}
                      onChange={(e) => setUserTitle(e.target.value)}
                      placeholder="Software Developer"
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Approvers Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Approvers / Owner IDs</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addApprover}
                      className="h-7 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Approver
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {approvers.map((approver, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={approver}
                          onChange={(e) => updateApprover(index, e.target.value)}
                          placeholder="UUID"
                          className="text-sm font-mono"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeApprover(index)}
                          disabled={approvers.length === 1}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {approvers.length} approver{approvers.length !== 1 ? 's' : ''} configured
                  </p>
                </div>

                {/* Additional Context */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Role ID (Optional)</Label>
                    <Input
                      value={roleId}
                      onChange={(e) => setRoleId(e.target.value)}
                      placeholder="UUID"
                      className="text-sm font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Application ID (Optional)</Label>
                    <Input
                      value={applicationId}
                      onChange={(e) => setApplicationId(e.target.value)}
                      placeholder="UUID"
                      className="text-sm font-mono"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="json" className="mt-4">
                <div>
                  <Label>Test Data (JSON)</Label>
                  <Textarea
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    className="font-mono text-sm h-64"
                    placeholder="Enter test identity data..."
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex gap-2">
              <Button 
                onClick={runSimulation}
                disabled={isRunning || !workflow}
                className="flex-1"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isRunning ? 'Running Simulation...' : 'Start Simulation'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Simulation Insights - Based on Real Results */}
        {riskInsights && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Simulation Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Overall Risk:</span>
                <Badge variant={riskInsights.overallRisk === 'high' ? 'destructive' : 
                               riskInsights.overallRisk === 'medium' ? 'default' : 'secondary'}>
                  {riskInsights.overallRisk}
                </Badge>
              </div>
              <div className="text-sm">
                <span className="font-medium">Total Duration:</span> {riskInsights.totalDuration}ms
              </div>
              <div className="text-sm">
                <span className="font-medium">Progress:</span> {riskInsights.completedSteps}/{riskInsights.totalSteps} steps
              </div>
              {riskInsights.highRiskSteps > 0 && (
                <div className="text-sm">
                  <span className="font-medium">High Risk Steps:</span> {riskInsights.highRiskSteps}
                </div>
              )}
              {riskInsights.approvalSteps > 0 && (
                <div className="text-sm">
                  <span className="font-medium">Approval Steps:</span> {riskInsights.approvalSteps}
                </div>
              )}
              {riskInsights.failedSteps > 0 && (
                <div className="text-sm text-red-600">
                  <span className="font-medium">Failed Steps:</span> {riskInsights.failedSteps}
                </div>
              )}
              {riskInsights.sodViolations > 0 && (
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span className="font-medium">SoD Violations:</span> {riskInsights.sodViolations}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Panel */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Execution Path & Results
              </CardTitle>
              {simulationResult && (
                <Badge variant={progress === 100 ? 'default' : 'secondary'}>
                  {Math.round(progress)}% Complete
                </Badge>
              )}
            </div>
            {simulationResult && (
              <Progress value={progress} className="w-full" />
            )}
          </CardHeader>
          
          <CardContent>
            {simulationResult ? (
              <div className="space-y-3">
                {simulationResult.map((step, index) => {
                  const StepIcon = getStepIcon(step.type);
                  const isCurrentStep = currentStep === index;
                  
                  return (
                    <Card 
                      key={step.id} 
                      className={[
                        isCurrentStep ? 'ring-2 ring-blue-500' : '',
                        step.status === 'failed' ? 'border-red-200' : '',
                        step.sodViolation ? 'border-l-4 border-l-red-500' : ''
                      ].filter(Boolean).join(' ')}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2">
                            <StepIcon className="h-4 w-4 text-gray-600" />
                            {getStatusIcon(step.status)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{getNodeLabel(step.name, step.type)}</span>
                              <Badge variant={step.riskLevel === 'high' ? 'destructive' : 
                                            step.riskLevel === 'medium' ? 'default' : 'secondary'}>
                                {step.riskLevel}
                              </Badge>
                              {step.pathTaken && (
                                <Badge variant="outline" className="text-xs">
                                  Path: {step.pathTaken}
                                </Badge>
                              )}
                            </div>
                            
                            {step.duration > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Duration: {step.duration}ms
                              </p>
                            )}
                            
                            {step.conditions && (
                              <div className="mt-1">
                                {step.conditions.map((condition, i) => (
                                  <Badge key={i} variant="outline" className="text-xs mr-1">
                                    {condition}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {step.sodViolation && (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-600">SoD Violation Detected</span>
                              </div>
                            )}
                            
                            {step.output && (
                              <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto max-h-20">
                                {JSON.stringify(step.output, null, 2)}
                              </pre>
                            )}
                            
                            {step.error && (
                              <p className="text-xs text-red-600 mt-1">
                                Error: {step.error}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Run a simulation to see workflow execution path and results</p>
                <p className="text-xs mt-2">Includes risk assessment, SoD violation detection, and approval chain visualization</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>

      {/* Approval Dialog */}
      <ApprovalDialog
        open={!!approvalPending}
        nodeName={approvalPending ? getNodeLabel(approvalPending.nodeName, approvalPending.nodeType) : 'Approval Node'}
        nodeType={approvalPending?.nodeType || 'approval'}
        approvalData={approvalPending?.approvalData}
        onApprove={(comments) => processApproval(true, comments)}
        onReject={(comments) => processApproval(false, comments)}
      />
    </div>
  );
};

export default WorkflowSimulator;
