import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X, Edit, Eye, Users, Shield, AlertTriangle,
  Briefcase, KeyRound, Server, Building, FileText, Crown
} from 'lucide-react';
import { Role } from '@/types/roles';

interface EntitlementPreviewData {
  id: string;
  name: string;
  description?: string;
  application?: string;
  isRisky?: boolean;
  riskLevel?: string;
  assignmentCount?: number;
  privilegeLevel?: string;
  lastUsed?: string;
  usageCount?: number;
  aiTooltip?: string;
}

interface RelationshipPreviewPanelProps {
  data: Role | { type: 'entitlement'; data: EntitlementPreviewData };
  onClose: () => void;
  onSelectRole: (role: Role) => void;
}

/**
 * Resolves classification from the role.
 * Handles both string[] (from adapter) and legacy string formats.
 */
function resolveClassifications(role: Role): string[] {
  const raw = role.classification;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw) return [raw];
  return [];
}

const RelationshipPreviewPanel: React.FC<RelationshipPreviewPanelProps> = ({
  data,
  onClose,
  onSelectRole
}) => {
  const isEntitlementPreview = 'type' in data && (data as any).type === 'entitlement';
  const role = !isEntitlementPreview ? (data as Role) : null;
  const entitlement = isEntitlementPreview ? (data as { type: 'entitlement'; data: EntitlementPreviewData }).data : null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Business Role': return <Briefcase className="h-4 w-4" />;
      case 'Technical Role': return <Server className="h-4 w-4" />;
      case 'Application Role': return <FileText className="h-4 w-4" />;
      case 'Functional Role': return <Building className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  const getRiskColor = (score: string) => {
    switch (score) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Entitlement preview
  if (isEntitlementPreview && entitlement) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KeyRound className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold">Entitlement Details</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{entitlement.name}</CardTitle>
                {entitlement.description && (
                  <p className="text-sm text-gray-600">{entitlement.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {entitlement.application && (
                    <div>
                      <span className="font-medium text-gray-700">Application:</span>
                      <p className="text-gray-900">{entitlement.application}</p>
                    </div>
                  )}
                  {entitlement.riskLevel && (
                    <div>
                      <span className="font-medium text-gray-700">Risk Level:</span>
                      <Badge variant="outline" className="ml-2">
                        {entitlement.riskLevel}
                      </Badge>
                    </div>
                  )}
                  {entitlement.privilegeLevel && (
                    <div>
                      <span className="font-medium text-gray-700">Privilege Level:</span>
                      <Badge variant="outline" className="ml-2">
                        {entitlement.privilegeLevel}
                      </Badge>
                    </div>
                  )}
                  {entitlement.assignmentCount !== undefined && (
                    <div>
                      <span className="font-medium text-gray-700">Assignments:</span>
                      <p className="text-gray-900">{entitlement.assignmentCount}</p>
                    </div>
                  )}
                  {entitlement.lastUsed && (
                    <div>
                      <span className="font-medium text-gray-700">Last Used:</span>
                      <p className="text-gray-900">{entitlement.lastUsed}</p>
                    </div>
                  )}
                  {entitlement.usageCount !== undefined && (
                    <div>
                      <span className="font-medium text-gray-700">Usage Count:</span>
                      <p className="text-gray-900">{entitlement.usageCount}</p>
                    </div>
                  )}
                </div>

                {entitlement.isRisky && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">High Risk Entitlement</span>
                    </div>
                    {entitlement.aiTooltip && (
                      <p className="text-sm text-red-700 mt-1">{entitlement.aiTooltip}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Role preview
  if (role) {
    const classifications = resolveClassifications(role);
    const hasAdminClassification = classifications.includes('Admin Role');
    const riskScore = role.risk?.score || (role as any).riskLevel || 'Low';
    const entCount = (role as any).entitlementCount ?? role.entitlements?.length ?? 0;

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getTypeIcon(role.type)}
            <h3 className="font-semibold">Role Details</h3>
            {hasAdminClassification && (
              <Crown className="h-4 w-4 text-yellow-600" />
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Role Overview */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                  <Badge variant={role.status === 'Enabled' ? 'default' : 'secondary'}>
                  {role?.status ? role.status.charAt(0).toUpperCase() + role.status.slice(1).toLowerCase() : ''}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{role.description}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Owner:</span>
                    <p className="text-gray-900">{role.owner || 'Not assigned'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Business Unit:</span>
                    <p className="text-gray-900">{role.businessUnit}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <p className="text-gray-900">{role.type}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Classification:</span>
                    {classifications.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {classifications.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-xs">None</p>
                    )}
                  </div>
                </div>

                {/* Compliance tags */}
                {role.complianceTags && role.complianceTags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <span className="font-medium text-gray-700 text-sm">Compliance Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {role.complianceTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Users:</span>
                    <span className="text-lg font-bold text-blue-600">{role.userCount || 0}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Entitlements:</span>
                    <span className="text-lg font-bold text-green-600">{entCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            {(role.risk || (role as any).riskLevel) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Risk Assessment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={`p-3 rounded-lg ${getRiskColor(riskScore)}`}>
                    <span className="font-medium">Risk Score: {riskScore}</span>
                  </div>

                  {role.risk?.entitlementRisks && role.risk.entitlementRisks.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Risk Factors:</h4>
                      <div className="space-y-2">
                        {role.risk.entitlementRisks.map((risk, index) => (
                          <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                            <span className="font-medium">{risk.entitlementName}:</span>
                            <span className="text-yellow-800 ml-1">{risk.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {role.risk?.conflict && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-800">SoD Conflict Detected</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        {role.risk.conflict.overlap}% overlap with {role.risk.conflict.roleName}
                      </p>
                    </div>
                  )}

                  {role.risk?.peerBenchmark && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">{role.risk.peerBenchmark}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="flex space-x-2">
              <Button
                className="flex-1"
                onClick={() => onSelectRole(role)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Full Details
              </Button>
              <Button variant="outline" className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Edit Role
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return null;
};

export default RelationshipPreviewPanel;