import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, Shield, Building, Tag, AlertTriangle, CheckCircle, 
  Clock, Workflow, Eye, FileText 
} from 'lucide-react';

interface PreviewPanelProps {
  identityType: 'employee' | 'non-employee' | 'non-human' | null;
  formData: any;
}

export function PreviewPanel({ identityType, formData }: PreviewPanelProps) {
  const basics = formData.basics || {};
  const assignment = formData.assignment || {};
  const organizational = formData.organizational || {};
  const risk = formData.risk || {};
  const assignments = formData.assignments || {};

  if (!identityType) return null;

  const getIdentityDisplayName = () => {
    if (identityType === 'non-human') {
      return formData.basics?.displayName || 'Unnamed System';
    }
    return `${formData.basics?.firstName || ''} ${formData.basics?.lastName || ''}`.trim() || 'Unnamed Identity';
  };

  const getAssignmentLabel = () => {
    switch (identityType) {
      case 'employee': return 'Manager';
      case 'non-employee': return 'Sponsor';
      case 'non-human': return 'Owner';
      default: return 'Assignee';
    }
  };

  const getRiskLevel = () => {
    return formData.risk?.riskLevel || 'medium';
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
    workflows.push('Identity Creation Workflow');
    
    if (identityType === 'employee') {
      workflows.push('Employee Onboarding Workflow');
      workflows.push('AD Account Provisioning');
      workflows.push('Equipment Request Workflow');
    }
    
    if (identityType === 'non-employee') {
      workflows.push('External Identity Review');
      workflows.push('Background Check Workflow');
      workflows.push('Sponsor Approval Workflow');
    }
    
    if (identityType === 'non-human') {
      workflows.push('Technical Review Workflow');
      workflows.push('Security Assessment Workflow');
    }
    
    if (getRiskLevel() === 'high' || getRiskLevel() === 'critical') {
      workflows.push('High-Risk Identity Review');
      workflows.push('Security Team Approval');
    }
    
    return workflows;
  };

  const getPolicyViolations = () => {
    const violations = [];
    
    // Simulate policy checks
    if (!formData.assignment?.assigneeId) {
      violations.push({
        type: 'error',
        message: `${getAssignmentLabel()} assignment is required`
      });
    }
    
    if (identityType === 'non-employee' && !formData.assignment?.endDate) {
      violations.push({
        type: 'error',
        message: 'End date is required for non-employee identities'
      });
    }
    
    if (formData.basics?.email === 'admin@company.com') {
      violations.push({
        type: 'warning',
        message: 'Admin email pattern detected - review required'
      });
    }
    
    if (formData.organizational?.tags?.includes('privileged') && getRiskLevel() !== 'high') {
      violations.push({
        type: 'warning',
        message: 'Privileged access tag requires high risk classification'
      });
    }
    
    return violations;
  };

  const getAssignmentSummary = () => {
    const selectedRoles = assignments.selectedRoles || [];
    const selectedEntitlements = assignments.selectedEntitlements || [];
    return {
      roles: Array.isArray(selectedRoles) ? selectedRoles.length : 0,
      entitlements: Array.isArray(selectedEntitlements) ? selectedEntitlements.length : 0
    };
  };

  const assignmentSummary = getAssignmentSummary();
  const totalAssignments = assignmentSummary.roles + assignmentSummary.entitlements;

  const violations = getPolicyViolations();
  const workflows = getWorkflowsTriggered();

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <div className="sticky top-0 bg-gray-50 pb-2">
        <h3 className="font-semibold text-lg">Identity Preview</h3>
        <p className="text-sm text-slate-600">Review the identity profile before creation</p>
      </div>

      {/* Identity Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Identity Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="font-medium">{getIdentityDisplayName()}</div>
            <div className="text-sm text-slate-600">{formData.basics?.email || 'No email'}</div>
            <div className="text-sm text-slate-500">Username: {formData.basics?.username || 'Not set'}</div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="capitalize">
              {identityType.replace('-', ' ')}
            </Badge>
            {formData.basics?.subtype && (
              <Badge variant="secondary" className="text-xs capitalize">
                {formData.basics.subtype}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Summary */}
      {totalAssignments > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Assignments</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignmentSummary.roles > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Roles</span>
                <Badge variant="outline">{assignmentSummary.roles}</Badge>
              </div>
            )}
            {assignmentSummary.entitlements > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Entitlements</span>
                <Badge variant="outline">{assignmentSummary.entitlements}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assignment Info */}
      {formData.assignment?.assigneeName && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{getAssignmentLabel()} Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium">{formData.assignment.assigneeName}</div>
              <div className="text-sm text-slate-600">{formData.assignment.assigneeEmail}</div>
              <div className="text-sm text-slate-500">{formData.assignment.assigneeDepartment}</div>
              
              {identityType === 'non-employee' && formData.assignment.endDate && (
                <div className="text-sm">
                  <span className="text-slate-600">Duration: </span>
                  <span>{formData.assignment.startDate || 'Now'} - {formData.assignment.endDate}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organizational Info */}
      {(formData.organizational?.department || formData.organizational?.jobTitle) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span>Organization</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {formData.organizational.jobTitle && (
              <div>
                <span className="text-sm text-slate-600">Role: </span>
                <span className="text-sm font-medium">{formData.organizational.jobTitle}</span>
              </div>
            )}
            {formData.organizational.department && (
              <div>
                <span className="text-sm text-slate-600">Department: </span>
                <span className="text-sm">{formData.organizational.department}</span>
              </div>
            )}
            {formData.organizational.location && (
              <div>
                <span className="text-sm text-slate-600">Location: </span>
                <span className="text-sm">{formData.organizational.location}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {formData.organizational?.tags?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Tags</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {formData.organizational.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Risk Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(getRiskLevel())}`}>
            {getRiskLevel().charAt(0).toUpperCase() + getRiskLevel().slice(1)} Risk
          </div>
          
          {formData.risk?.dataClassification && (
            <div className="text-sm text-slate-600 mt-2">
              Data Classification: <span className="font-medium capitalize">{formData.risk.dataClassification}</span>
            </div>
          )}
          
          {formData.risk?.accessScope && (
            <div className="text-sm text-slate-600">
              Access Scope: <span className="font-medium capitalize">{formData.risk.accessScope}</span>
            </div>
          )}
        </CardContent>
      </Card>

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
                <h4 className="font-medium text-yellow-900">No Initial Assignments</h4>
                <p className="text-sm text-yellow-800">This identity will be created without any roles or entitlements</p>
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
