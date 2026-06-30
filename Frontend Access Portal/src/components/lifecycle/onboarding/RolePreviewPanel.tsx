
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, Users, Tag, AlertTriangle, CheckCircle, 
  Clock, Workflow, Eye, FileText, Key, Target 
} from 'lucide-react';

interface RolePreviewPanelProps {
  roleType: 'business' | 'technical' | 'privileged' | null;
  formData: any;
}

// Mock entitlements data for preview
const mockEntitlements = [
  { id: 'ent-1', name: 'View Financial Reports', application: 'SAP', risk: 'Low' },
  { id: 'ent-2', name: 'Approve Budgets', application: 'Oracle', risk: 'High' },
  { id: 'ent-3', name: 'User Management', application: 'Active Directory', risk: 'High' },
  { id: 'ent-4', name: 'Database Read Access', application: 'PostgreSQL', risk: 'Medium' },
  { id: 'ent-5', name: 'System Administration', application: 'Linux Servers', risk: 'Critical' }
];

const mockUsers = [
  { id: 'u1', name: 'Alice Johnson', department: 'Finance' },
  { id: 'u2', name: 'Bob Williams', department: 'HR' },
  { id: 'u3', name: 'Carol Davis', department: 'IT' }
];

// Helper functions for type safety
const getArrayLength = (value: unknown): number => {
  return Array.isArray(value) ? value.length : 0;
};

const sumObjectArrayLengths = (obj: unknown): number => {
  if (!obj || typeof obj !== 'object') return 0;
  return Object.values(obj).reduce((sum: number, value: unknown) => {
    return sum + getArrayLength(value);
  }, 0);
};

export function RolePreviewPanel({ roleType, formData }: RolePreviewPanelProps) {
  const basics = formData.basics || {};
  const assignments = formData.assignments || {};
  const governance = formData.governance || {};

  if (!roleType) return null;

  const getRoleDisplayName = () => {
    return formData.basics?.name || 'Unnamed Role';
  };

  const getRiskLevel = () => {
    return formData.basics?.riskLevel || 'medium';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      case 'critical': return 'text-red-800 bg-red-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getWorkflowsTriggered = () => {
    const workflows = [];
    
    // Base workflows
    workflows.push('Role Creation Workflow');
    
    if (roleType === 'business') {
      workflows.push('Business Role Review');
      workflows.push('Department Approval');
    }
    
    if (roleType === 'technical') {
      workflows.push('Technical Review Workflow');
      workflows.push('IT Security Assessment');
    }
    
    if (roleType === 'privileged') {
      workflows.push('Privileged Role Review');
      workflows.push('Security Team Approval');
      workflows.push('Compliance Check');
    }
    
    if (getRiskLevel() === 'high' || getRiskLevel() === 'critical') {
      workflows.push('High-Risk Role Review');
      workflows.push('Executive Approval');
    }
    
    return workflows;
  };

  const getPolicyViolations = () => {
    const violations = [];
    
    // Simulate policy checks
    if (!formData.governance?.owner) {
      violations.push({
        type: 'error',
        message: 'Role owner is required'
      });
    }
    
    if (roleType === 'privileged' && (!formData.governance?.approvers || getArrayLength(formData.governance?.approvers) === 0)) {
      violations.push({
        type: 'error',
        message: 'Privileged roles require at least one approver'
      });
    }
    
    if (getArrayLength(assignments?.selectedEntitlements) > 10) {
      violations.push({
        type: 'warning',
        message: 'Role has many entitlements - consider splitting into multiple roles'
      });
    }
    
    if (formData.basics?.name?.toLowerCase().includes('admin') && getRiskLevel() !== 'high') {
      violations.push({
        type: 'warning',
        message: 'Admin roles typically require high risk classification'
      });
    }
    
    return violations;
  };

  const getAssignmentSummary = () => {
    const summary = {
      entitlements: getArrayLength(assignments.selectedEntitlements),
      roles: getArrayLength(assignments.selectedRoles),
      identities: sumObjectArrayLengths(assignments.selectedIdentities)
    };
    return summary;
  };

  const assignmentSummary = getAssignmentSummary();
  const totalAssignments = assignmentSummary.entitlements + assignmentSummary.roles + assignmentSummary.identities;

  const violations = getPolicyViolations();
  const workflows = getWorkflowsTriggered();
  const selectedEntitlements = assignments?.selectedEntitlements || [];

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <div className="sticky top-0 bg-gray-50 pb-2">
        <h3 className="font-semibold text-lg">Role Preview</h3>
        <p className="text-sm text-slate-600">Review the role configuration before creation</p>
      </div>

      {/* Role Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Role Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="font-medium">{getRoleDisplayName()}</div>
            <div className="text-sm text-slate-600">{formData.basics?.displayName || 'No display name'}</div>
            <div className="text-sm text-slate-500 mt-1">{formData.basics?.description || 'No description'}</div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="capitalize">
              {roleType} Role
            </Badge>
            {formData.basics?.scope && (
              <Badge variant="secondary" className="text-xs capitalize">
                {formData.basics.scope}
              </Badge>
            )}
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(getRiskLevel())}`}>
              {getRiskLevel().charAt(0).toUpperCase() + getRiskLevel().slice(1)} Risk
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Summary */}
      {totalAssignments > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Assignments</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignmentSummary.entitlements > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Entitlements</span>
                <Badge variant="outline">{assignmentSummary.entitlements}</Badge>
              </div>
            )}
            
            {assignmentSummary.roles > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Role Relationships</span>
                <Badge variant="outline">{assignmentSummary.roles}</Badge>
              </div>
            )}
            
            {assignmentSummary.identities > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Identity Assignments</span>
                <Badge variant="outline">{assignmentSummary.identities}</Badge>
              </div>
            )}

            {assignments.assignmentOptions?.autoAssign && (
              <div className="pt-2 border-t">
                <Badge variant="secondary" className="text-xs">Auto-assign enabled</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ownership Info */}
      {formData.governance?.owner && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Governance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-slate-600">Owner: </span>
              <span className="text-sm font-medium">
                {mockUsers.find(u => u.id === formData.governance.owner)?.name || 'Unknown'}
              </span>
            </div>
            
            {getArrayLength(formData.governance.approvers) > 0 && (
              <div>
                <span className="text-sm text-slate-600">Approvers: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(formData.governance.approvers as string[]).map((approverId: string) => {
                    const approver = mockUsers.find(u => u.id === approverId);
                    return approver ? (
                      <Badge key={approverId} variant="outline" className="text-xs">
                        {approver.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            
            {formData.governance.reviewPolicy && (
              <div>
                <span className="text-sm text-slate-600">Review Policy: </span>
                <span className="text-sm capitalize">{formData.governance.reviewPolicy}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Entitlements */}
      {getArrayLength(selectedEntitlements) > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Entitlements ({getArrayLength(selectedEntitlements)})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(selectedEntitlements as string[]).slice(0, 5).map((entId: string) => {
                const ent = mockEntitlements.find(e => e.id === entId);
                return ent ? (
                  <div key={entId} className="flex items-center justify-between">
                    <span className="text-sm">{ent.name}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">{ent.application}</Badge>
                      <Badge className={`text-xs ${getRiskColor(ent.risk.toLowerCase())}`}>
                        {ent.risk}
                      </Badge>
                    </div>
                  </div>
                ) : null;
              })}
              {getArrayLength(selectedEntitlements) > 5 && (
                <div className="text-xs text-slate-500">
                  +{getArrayLength(selectedEntitlements) - 5} more entitlements
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policy Violations */}
      {violations.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Policy Checks</h4>
          {violations.map((violation, index) => (
            <Alert key={index} className={violation.type === 'error' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
              <AlertTriangle className={`h-4 w-4 ${violation.type === 'error' ? 'text-red-600' : 'text-yellow-600'}`} />
              <AlertDescription className={violation.type === 'error' ? 'text-red-900' : 'text-yellow-900'}>
                {violation.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Workflows */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <Workflow className="h-4 w-4" />
            <span>Triggered Workflows</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {workflows.map((workflow, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <Clock className="h-3 w-3 text-blue-500" />
                <span>{workflow}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Warning */}
      {totalAssignments === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <h4 className="font-medium text-yellow-900">No Assignments</h4>
                <p className="text-sm text-yellow-800">This role has no entitlements or relationships defined</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-4">
        <Button className="w-full" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Export Preview
        </Button>
        <Button variant="outline" className="w-full" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>
    </div>
  );
}
