
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  KeyRound, AlertTriangle, Shield, Eye, Calendar, Users, Server
} from 'lucide-react';
import { Entitlement } from '@/data/mock-entitlements';

interface UMLEntitlementNodeData {
  entitlement: Entitlement;
  riskLevel: string;
  hasHighRisk: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const riskColors = {
  Low: 'border-l-green-500',
  Medium: 'border-l-yellow-500',
  High: 'border-l-red-500',
  Critical: 'border-l-red-600',
};

const UMLEntitlementNode = ({ data }: { data: UMLEntitlementNodeData }) => {
  const { entitlement, riskLevel, hasHighRisk, isSelected, onSelect } = data;

  const getRiskColorClass = (risk: string) => {
    const normalizedRisk = risk.charAt(0).toUpperCase() + risk.slice(1).toLowerCase();
    return riskColors[normalizedRisk as keyof typeof riskColors] || riskColors.Low;
  };

  return (
    <div 
      className={cn(
        "relative bg-white rounded-lg shadow-md border-2 border-l-4 p-3 w-56 transition-all duration-200 hover:shadow-lg cursor-pointer",
        "bg-emerald-50 border-emerald-300 text-emerald-900",
        getRiskColorClass(riskLevel),
        isSelected && "ring-2 ring-blue-500 ring-offset-2",
        hasHighRisk && "border-red-400"
      )}
      onClick={() => onSelect(entitlement.id)}
    >
      {/* Risk indicator */}
      {hasHighRisk && (
        <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
          <AlertTriangle className="h-3 w-3 text-white" />
        </div>
      )}

      {/* UML-style header */}
      <div className="border-b border-gray-200 pb-2 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KeyRound className="h-4 w-4" />
            <span className="text-xs font-mono text-gray-600">
              &lt;&lt;entitlement&gt;&gt;
            </span>
          </div>
          {hasHighRisk && (
            <AlertTriangle className="h-3 w-3 text-red-600" />
          )}
        </div>
        <h3 className="font-bold text-sm mt-1 truncate" title={entitlement.displayName}>
          {entitlement.displayName}
        </h3>
      </div>

      {/* UML-style attributes */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Application:</span>
          <span className="font-medium truncate ml-1" title={entitlement.application}>
            {entitlement.application}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Type:</span>
          <span className="font-medium">{entitlement.type || 'Standard'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Privilege:</span>
          <Badge variant="outline" className="text-xs">
            {entitlement.privilegeLevel || 'Read'}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <Badge 
            variant={entitlement.lifecycle === 'Active' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {entitlement.lifecycle}
          </Badge>
        </div>
        {entitlement.assignedUsersCount !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-600 flex items-center">
              <Users className="h-3 w-3 mr-1" />
              Users:
            </span>
            <span className="font-medium">{entitlement.assignedUsersCount}</span>
          </div>
        )}
        {entitlement.lastUsed && (
          <div className="flex justify-between">
            <span className="text-gray-600 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Used:
            </span>
            <span className="font-medium text-xs">{entitlement.lastUsed}</span>
          </div>
        )}
      </div>

      {/* Risk indicator */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Shield className={cn(
              "h-3 w-3",
              riskLevel.toLowerCase() === 'high' || riskLevel.toLowerCase() === 'critical' ? 'text-red-500' :
              riskLevel.toLowerCase() === 'medium' ? 'text-yellow-500' : 'text-green-500'
            )} />
            <span className="text-xs font-medium">
              {riskLevel} Risk
            </span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Connection handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-slate-400 !w-2 !h-2 !border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-slate-400 !w-2 !h-2 !border-none" 
      />
    </div>
  );
};

export default memo(UMLEntitlementNode);
