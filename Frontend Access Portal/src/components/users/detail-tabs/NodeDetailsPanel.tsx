
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  X, Users, Shield, Bot, Target, Settings, AlertTriangle, 
  Calendar, Clock, Database, Key, ExternalLink, Eye,
  Waypoints, History, UserX, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeDetailsData {
  id: string;
  type: 'identity' | 'application' | 'role' | 'entitlement' | 'account' | 'risk';
  label: string;
  subtitle?: string;
  riskLevel?: string;
  riskCount?: number;
  conflictCount?: number;
  metadata: Record<string, any>;
}

interface NodeDetailsPanelProps {
  nodeData: NodeDetailsData | null;
  onClose: () => void;
}

const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ nodeData, onClose }) => {
  if (!nodeData) return null;

  const getNodeIcon = () => {
    switch (nodeData.type) {
      case 'identity': return <Users className="h-5 w-5" />;
      case 'application': return <Shield className="h-5 w-5" />;
      case 'role': return <Bot className="h-5 w-5" />;
      case 'entitlement': return <Key className="h-5 w-5" />;
      case 'account': return <Settings className="h-5 w-5" />;
      case 'risk': return <AlertTriangle className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const generateAIExplanation = () => {
    switch (nodeData.type) {
      case 'identity':
        return `${nodeData.label} has access to ${nodeData.metadata.applicationCount || 3} applications via ${nodeData.metadata.roleCount || 2} business roles. This grants them ${nodeData.metadata.entitlementCount || 5} entitlements with ${nodeData.riskCount || 0} high-risk permissions. ${nodeData.conflictCount ? `A SoD conflict exists with ${nodeData.conflictCount} policy violations.` : 'No SoD conflicts detected.'} Recommend regular access review and privilege validation.`;
      
      case 'application':
        return `${nodeData.label} contains ${nodeData.metadata.accountCount || 12} user accounts with ${nodeData.metadata.orphanCount || 3} orphan accounts requiring attention. ${nodeData.riskCount || 0} risky accounts detected due to ${nodeData.metadata.riskReason || 'unreviewed high-privilege access'}. Last sync: ${nodeData.metadata.lastSync || '2 days ago'}. Recommend immediate orphan account cleanup and access recertification.`;
      
      case 'role':
        return `${nodeData.label} is a ${nodeData.metadata.roleType || 'Business'} role assigned to ${nodeData.metadata.userCount || 8} users. It grants ${nodeData.metadata.entitlementCount || 4} entitlements including ${nodeData.riskCount ? `${nodeData.riskCount} high-risk permissions` : 'standard access levels'}. ${nodeData.conflictCount ? `Contains ${nodeData.conflictCount} SoD conflicts that require segregation review.` : 'No policy conflicts detected.'} Role last reviewed: ${nodeData.metadata.lastReview || '6 months ago'}.`;
      
      case 'entitlement':
        return `${nodeData.label} is a ${nodeData.riskLevel || 'Medium'} risk entitlement derived from ${nodeData.metadata.source || 'role assignment'}. Privilege level: ${nodeData.metadata.privilegeLevel || 'Read/Write'}. Assigned to ${nodeData.metadata.userCount || 5} users across ${nodeData.metadata.appCount || 1} application. ${nodeData.riskLevel === 'High' ? 'This high-risk entitlement requires careful monitoring and regular review.' : 'Standard entitlement with appropriate risk controls.'}`;
      
      case 'account':
        return `Account ${nodeData.label} in ${nodeData.metadata.application || 'Unknown App'} is ${nodeData.metadata.status || 'Active'} with last login ${nodeData.metadata.lastLogin || '3 days ago'}. Provisioned via ${nodeData.metadata.source || 'automated sync'} and linked to ${nodeData.metadata.entitlementCount || 2} entitlements. ${nodeData.metadata.status === 'Stale' ? 'This stale account should be reviewed for deprovisioning.' : 'Account appears properly maintained.'}`;
      
      case 'risk':
        return `SoD Conflict: ${nodeData.label} creates a segregation of duties violation where the user can ${nodeData.metadata.conflictDescription || 'both approve and process financial transactions'}. Involved entitlements: ${nodeData.metadata.involvedEntitlements || 'Budget Approval + Payment Processing'}. Risk score: ${nodeData.riskLevel || 'High'}. Recommended action: ${nodeData.metadata.remediation || 'Remove one conflicting entitlement or implement compensating controls'}.`;
      
      default:
        return `This ${nodeData.type} node contains important relationship information that requires review. Click on connected nodes to explore the full relationship network.`;
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk?.toLowerCase()) {
      case 'high':
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="w-full h-full bg-white border-l border-gray-200 overflow-y-auto">
      <Card className="h-full rounded-none border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getNodeIcon()}
              <CardTitle className="text-lg">{nodeData.label}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {nodeData.subtitle && (
            <p className="text-sm text-gray-600">{nodeData.subtitle}</p>
          )}
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className="capitalize">{nodeData.type}</Badge>
            {nodeData.riskLevel && (
              <Badge className={cn("text-xs", getRiskColor(nodeData.riskLevel))}>
                {nodeData.riskLevel} Risk
              </Badge>
            )}
            {nodeData.riskCount && (
              <Badge variant="destructive" className="text-xs">
                {nodeData.riskCount} risks
              </Badge>
            )}
            {nodeData.conflictCount && (
              <Badge variant="outline" className="text-xs border-red-400 text-red-600">
                {nodeData.conflictCount} conflicts
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Metadata Section */}
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Details</span>
            </h4>
            <div className="space-y-2">
              {Object.entries(nodeData.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="font-medium text-right max-w-32 truncate" title={String(value)}>
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* AI Summary Section */}
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>AI Analysis</span>
            </h4>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <p className="text-sm text-blue-800 leading-relaxed">
                {generateAIExplanation()}
              </p>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div>
            <h4 className="font-medium text-sm mb-3">Actions</h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Waypoints className="h-4 w-4 mr-2" />
                View in Access Explorer
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <History className="h-4 w-4 mr-2" />
                View Audit Log
              </Button>
              {nodeData.conflictCount && (
                <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-700">
                  <UserX className="h-4 w-4 mr-2" />
                  Resolve SoD Conflict
                </Button>
              )}
              {nodeData.riskCount && (
                <Button variant="outline" size="sm" className="w-full justify-start text-amber-600 hover:text-amber-700">
                  <Eye className="h-4 w-4 mr-2" />
                  Request Review
                </Button>
              )}
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NodeDetailsPanel;
