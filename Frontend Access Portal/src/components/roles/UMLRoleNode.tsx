import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Briefcase, Server, FileText, Building, KeyRound,
  AlertTriangle, Shield, Eye, Crown, Users
} from 'lucide-react';
import { Role, RoleEntitlement } from '@/types/roles';

interface UMLRoleNodeData {
  role?: Role;
  entitlement?: RoleEntitlement;
  nodeType: 'business' | 'technical' | 'application' | 'functional' | 'entitlement';
  riskLevel: 'Low' | 'Medium' | 'High';
  hasConflicts: boolean;
  isSelected: boolean;
  entitlementCount?: number;
  onSelect: (id: string) => void;
}

const nodeIcons = {
  business: Briefcase,
  technical: Server,
  application: FileText,
  functional: Building,
  entitlement: KeyRound,
};

const nodeColors = {
  business: 'bg-blue-50 border-blue-300 text-blue-900',
  technical: 'bg-purple-50 border-purple-300 text-purple-900',
  application: 'bg-green-50 border-green-300 text-green-900',
  functional: 'bg-orange-50 border-orange-300 text-orange-900',
  entitlement: 'bg-emerald-50 border-emerald-300 text-emerald-900',
};

const riskColors = {
  Low: 'border-l-green-500',
  Medium: 'border-l-yellow-500',
  High: 'border-l-red-500',
};

/**
 * Checks if the role has an Admin Role classification.
 * Handles both string[] (from adapter) and legacy string formats.
 */
function hasAdminClassification(role?: Role): boolean {
  if (!role) return false;
  const raw = role.classification;
  if (Array.isArray(raw)) return raw.includes('Admin Role');
  if (typeof raw === 'string') return raw === 'Admin Role';
  return false;
}

const UMLRoleNode = ({ data }: { data: UMLRoleNodeData }) => {
  const { role, entitlement, nodeType, riskLevel, hasConflicts, isSelected, entitlementCount, onSelect } = data;
  const Icon = nodeIcons[nodeType];
  const isEntitlement = nodeType === 'entitlement';
  const nodeId = role?.id || `ent-${entitlement?.id}`;
  const displayName = role?.name || entitlement?.name || 'Unknown';
  const userCount = role?.userCount;
  const entCount = entitlementCount ?? role?.entitlements?.length ?? 0;

  return (
    <div
      className={cn(
        "relative bg-white rounded-lg shadow-md border-2 border-l-4 p-3 w-56 transition-all duration-200 hover:shadow-lg cursor-pointer",
        nodeColors[nodeType],
        riskColors[riskLevel],
        isSelected && "ring-2 ring-blue-500 ring-offset-2",
        hasConflicts && "border-red-400"
      )}
      onClick={() => onSelect(nodeId)}
    >
      {/* Conflict indicator */}
      {hasConflicts && (
        <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
          <AlertTriangle className="h-3 w-3 text-white" />
        </div>
      )}

      {/* UML-style header */}
      <div className="border-b border-gray-200 pb-2 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <span className="text-xs font-mono text-gray-600">
              &lt;&lt;{nodeType}&gt;&gt;
            </span>
          </div>
          {hasAdminClassification(role) && (
            <Crown className="h-3 w-3 text-yellow-600" />
          )}
        </div>
        <h3 className="font-bold text-sm mt-1 truncate" title={displayName}>
          {displayName}
        </h3>
      </div>

      {/* UML-style attributes */}
      <div className="space-y-1 text-xs">
        {isEntitlement ? (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Application:</span>
              <span className="font-medium truncate ml-1" title={entitlement?.application}>
                {entitlement?.application}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Privilege:</span>
              <Badge variant="outline" className="text-xs">
                {entitlement?.privilegeLevel || 'Read'}
              </Badge>
            </div>
            {entitlement?.lastUsed && (
              <div className="flex justify-between">
                <span className="text-gray-600">Last Used:</span>
                <span className="font-medium">{entitlement.lastUsed}</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium truncate ml-1">{role?.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge
                variant={role?.status === 'Enabled' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {role?.status}
              </Badge>
            </div>
            {userCount !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600 flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  Users:
                </span>
                <span className="font-medium">{userCount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Entitlements:</span>
              <span className="font-medium">{entCount}</span>
            </div>
          </>
        )}
      </div>

      {/* Risk indicator */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Shield className={cn(
              "h-3 w-3",
              riskLevel === 'High' ? 'text-red-500' :
              riskLevel === 'Medium' ? 'text-yellow-500' : 'text-green-500'
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

export default memo(UMLRoleNode);