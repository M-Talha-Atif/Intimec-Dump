
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Key, Shield, Clock, Users, AlertTriangle, 
  Database, Tag, Link, CheckCircle, Bot, UserCheck
} from 'lucide-react';

interface EntitlementPreviewPanelProps {
  entitlementType: 'standard' | 'sensitive' | 'admin';
  formData: any;
}

export function EntitlementPreviewPanel({ entitlementType, formData }: EntitlementPreviewPanelProps) {
  const basics = formData.basics || {};
  const governance = formData.governance || {};
  const assignment = formData.assignment || {};

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'High': return 'text-red-600 bg-red-50';
      case 'Critical': return 'text-red-800 bg-red-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = () => {
    switch (entitlementType) {
      case 'standard': return Key;
      case 'sensitive': return Shield;
      case 'admin': return Shield;
      default: return Key;
    }
  };

  // Helper function to safely get array length
  const getArrayLength = (value: unknown): number => {
    return Array.isArray(value) ? value.length : 0;
  };

  // Helper function to safely check if value is a non-empty array
  const isNonEmptyArray = (value: unknown): boolean => {
    return Array.isArray(value) && value.length > 0;
  };

  // Helper function to safely sum array lengths from object values
  const sumObjectArrayLengths = (obj: unknown): number => {
    if (!obj || typeof obj !== 'object') return 0;
    return Object.values(obj).reduce((sum, value) => {
      return sum + getArrayLength(value);
    }, 0);
  };

  const getImpactAnalysis = () => {
    const impacts = [];
    
    if (basics.riskLevel === 'High' || basics.riskLevel === 'Critical') {
      impacts.push({
        type: 'risk',
        message: 'High-risk entitlement requires additional oversight',
        severity: 'high'
      });
    }
    
    if (basics.autoAssigned) {
      impacts.push({
        type: 'automation',
        message: 'Will be automatically assigned based on role membership',
        severity: 'medium'
      });
    }
    
    const dependentEntitlementsLength = getArrayLength(governance.dependentEntitlements);
    if (dependentEntitlementsLength > 0) {
      impacts.push({
        type: 'dependency',
        message: `Requires ${dependentEntitlementsLength} prerequisite entitlement(s)`,
        severity: 'low'
      });
    }
    
    const conflictingEntitlementsLength = getArrayLength(governance.conflictingEntitlements);
    if (conflictingEntitlementsLength > 0) {
      impacts.push({
        type: 'conflict',
        message: `Conflicts with ${conflictingEntitlementsLength} existing entitlement(s)`,
        severity: 'high'
      });
    }

    // Assignment impacts
    const totalRoleAssignments = getArrayLength(assignment.assignToRoles);
    const totalIdentityAssignments = sumObjectArrayLengths(assignment.assignToIdentities);
    
    if (totalRoleAssignments > 0) {
      impacts.push({
        type: 'assignment',
        message: `Will be assigned to ${totalRoleAssignments} role(s)`,
        severity: 'medium'
      });
    }

    if (totalIdentityAssignments > 0) {
      impacts.push({
        type: 'assignment',
        message: `Will be assigned to ${totalIdentityAssignments} identit(ies)`,
        severity: 'medium'
      });
    }

    const totalRelatedEntitlements = sumObjectArrayLengths(assignment.relatedEntitlements);
    if (totalRelatedEntitlements > 0) {
      impacts.push({
        type: 'relationship',
        message: `Has ${totalRelatedEntitlements} entitlement relationship(s)`,
        severity: 'low'
      });
    }
    
    return impacts;
  };

  const TypeIcon = getTypeIcon();
  const impacts = getImpactAnalysis();
  const hasHighRiskImpacts = impacts.some(i => i.severity === 'high');

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <div className="sticky top-0 bg-gray-50 pb-2">
        <h3 className="font-semibold text-lg">Entitlement Preview</h3>
        <p className="text-sm text-slate-600">Review before creating</p>
      </div>

      {/* Basic Info Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <TypeIcon className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-sm font-medium text-slate-700">Name</div>
            <div className="text-sm text-slate-900">{basics.name || 'Not specified'}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-slate-700">Display Name</div>
            <div className="text-sm text-slate-900">{basics.displayName || basics.name || 'Not specified'}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-slate-700">Description</div>
            <div className="text-sm text-slate-900">{basics.description || 'No description provided'}</div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium text-slate-700">Risk Level:</div>
            <Badge className={`text-xs ${getRiskColor(basics.riskLevel || 'Low')}`}>
              {basics.riskLevel || 'Low'}
            </Badge>
          </div>
          
          {isNonEmptyArray(basics.tags) && (
            <div>
              <div className="text-sm font-medium text-slate-700 mb-1">Tags</div>
              <div className="flex flex-wrap gap-1">
                {(basics.tags as string[]).map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provisioning Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Provisioning</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Auto-assigned</span>
            <Badge variant={basics.autoAssigned ? 'default' : 'secondary'} className="text-xs">
              {basics.autoAssigned ? 'Yes' : 'No'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Time-bound</span>
            <Badge variant={basics.timeBound ? 'default' : 'secondary'} className="text-xs">
              {basics.timeBound ? 'Yes' : 'No'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Requestable</span>
            <Badge variant={basics.requestable ? 'default' : 'secondary'} className="text-xs">
              {basics.requestable ? 'Yes' : 'No'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Summary */}
      {Object.keys(assignment).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Assignments</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isNonEmptyArray(assignment.assignToRoles) && (
              <div>
                <div className="text-sm font-medium text-slate-700 mb-1">Roles ({getArrayLength(assignment.assignToRoles)})</div>
                <div className="text-sm text-slate-600">Will be assigned to selected roles</div>
              </div>
            )}
            
            {assignment.assignToIdentities && Object.entries(assignment.assignToIdentities).map(([type, identities]) => {
              const identitiesLength = getArrayLength(identities);
              if (identitiesLength === 0) return null;
              return (
                <div key={type}>
                  <div className="text-sm font-medium text-slate-700 mb-1 flex items-center space-x-2">
                    {type === 'employee' && <Users className="h-4 w-4" />}
                    {type === 'non-employee' && <UserCheck className="h-4 w-4" />}
                    {type === 'non-human' && <Bot className="h-4 w-4" />}
                    <span className="capitalize">{type.replace('-', ' ')} ({identitiesLength})</span>
                  </div>
                  <div className="text-sm text-slate-600">Will be assigned to selected {type.replace('-', ' ')} identities</div>
                </div>
              );
            })}

            {assignment.assignmentOptions && (
              <div className="pt-2 border-t">
                <div className="text-sm font-medium text-slate-700 mb-1">Options</div>
                <div className="space-y-1">
                  {assignment.assignmentOptions.immediateAssignment && (
                    <div className="text-xs text-slate-600">• Immediate assignment enabled</div>
                  )}
                  {assignment.assignmentOptions.requiresReview && (
                    <div className="text-xs text-slate-600">• Review required before assignment</div>
                  )}
                  {assignment.assignmentOptions.partOfCampaign && (
                    <div className="text-xs text-slate-600">• Part of access request campaign</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Governance Summary */}
      {Object.keys(governance).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Governance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {governance.owner && (
              <div>
                <div className="text-sm font-medium text-slate-700">Owner</div>
                <div className="text-sm text-slate-900">{governance.owner}</div>
              </div>
            )}
            
            {isNonEmptyArray(governance.approvers) && (
              <div>
                <div className="text-sm font-medium text-slate-700">Approvers</div>
                <div className="text-sm text-slate-900">{getArrayLength(governance.approvers)} assigned</div>
              </div>
            )}
            
            {governance.reviewFrequency && (
              <div>
                <div className="text-sm font-medium text-slate-700">Review Frequency</div>
                <div className="text-sm text-slate-900">Every {governance.reviewFrequency} days</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Impact Analysis */}
      <Card className={hasHighRiskImpacts ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <AlertTriangle className={`h-5 w-5 ${hasHighRiskImpacts ? 'text-red-500' : 'text-blue-500'}`} />
            <span>Impact Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {impacts.length > 0 ? (
            <div className="space-y-2">
              {impacts.map((impact, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    impact.severity === 'high' ? 'bg-red-500' :
                    impact.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="text-sm text-slate-700">{impact.message}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>No significant impacts identified</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dependencies & Conflicts */}
      {(isNonEmptyArray(governance.dependentEntitlements) || isNonEmptyArray(governance.conflictingEntitlements) || sumObjectArrayLengths(assignment.relatedEntitlements) > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Link className="h-5 w-5" />
              <span>Relationships</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isNonEmptyArray(governance.dependentEntitlements) && (
              <div>
                <div className="text-sm font-medium text-slate-700 mb-1">Dependencies</div>
                <div className="text-sm text-slate-600">{getArrayLength(governance.dependentEntitlements)} prerequisite(s)</div>
              </div>
            )}
            
            {isNonEmptyArray(governance.conflictingEntitlements) && (
              <div>
                <div className="text-sm font-medium text-slate-700 mb-1">Conflicts</div>
                <div className="text-sm text-slate-600">{getArrayLength(governance.conflictingEntitlements)} conflicting entitlement(s)</div>
              </div>
            )}

            {assignment.relatedEntitlements && Object.entries(assignment.relatedEntitlements).map(([type, entitlements]) => {
              const entitlementsLength = getArrayLength(entitlements);
              if (entitlementsLength === 0) return null;
              return (
                <div key={type}>
                  <div className="text-sm font-medium text-slate-700 mb-1 capitalize">{type.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="text-sm text-slate-600">{entitlementsLength} entitlement(s)</div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 sticky bottom-0 bg-gray-50 pt-2">
        <Button className="w-full" size="sm">
          Create Entitlement
        </Button>
        <Button variant="outline" className="w-full" size="sm">
          Save as Draft
        </Button>
      </div>
    </div>
  );
}
