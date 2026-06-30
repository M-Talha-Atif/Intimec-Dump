
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Users, Shield, UserCheck, Building, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { OrgNodeData } from '@/types/organization';

// Map risk level to colors for both border and heat view
const riskColorMap: Record<string, { border: string; heat: string }> = {
  Low: { border: 'border-green-500', heat: 'bg-green-100 border-green-400' },
  Medium: { border: 'border-yellow-500', heat: 'bg-yellow-100 border-yellow-400' },
  High: { border: 'border-red-500', heat: 'bg-red-100 border-red-400' },
};

interface CustomOrgNodeData extends OrgNodeData {
  showRiskHeat?: boolean;
  onClick?: (node: OrgNodeData) => void;
}

interface CustomNodeProps extends Omit<NodeProps, 'data'> {
  data: CustomOrgNodeData;
}

const CustomOrgNode = ({ data }: CustomNodeProps) => {
  // Ensure we have valid data
  if (!data || !data.id) {
    console.warn('CustomOrgNode received invalid data:', data);
    return (
      <div className="bg-red-100 border-2 border-red-500 rounded-lg p-3 w-[240px]">
        <div className="text-red-800 text-sm">Invalid node data</div>
      </div>
    );
  }

  const riskColors = riskColorMap[data.riskLevel || 'Low'];

  const handleClick = () => {
    if (data.onClick && typeof data.onClick === 'function') {
      try {
        data.onClick(data);
      } catch (error) {
        console.error('Error calling onClick:', error);
      }
    }
  };

  return (
    <div 
      className={cn(
        "bg-white rounded-lg shadow-md p-3 w-[240px] border-2 react-flow__node-custom relative cursor-pointer transition-all hover:shadow-lg",
        data.showRiskHeat ? riskColors.heat : riskColors.border
      )}
      onClick={handleClick}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      
      {/* Status indicators */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {data.hasStaleRoles && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Flag className="h-4 w-4 text-orange-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>This unit has roles not reviewed in over 12 months.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {data.showRiskHeat && (
          <div className={cn(
            "w-3 h-3 rounded-full",
            data.riskLevel === 'High' ? 'bg-red-500' :
            data.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
          )} />
        )}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          <Building className="w-4 h-4 mr-2 text-slate-500" />
          <h3 className="text-md font-bold text-slate-800 truncate" title={data.name || 'Unknown'}>
            {data.name || 'Unknown'}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">{data.type || 'Unknown'}</Badge>
          {!data.showRiskHeat && data.riskLevel && (
            <Badge className={cn(
              "text-xs",
              data.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
              data.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            )}>
              {data.riskLevel}
            </Badge>
          )}
        </div>

        {data.head && <p className="text-xs text-slate-500 mb-2 truncate">Head: {data.head}</p>}

        <div className="text-xs text-slate-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center"><Users className="h-3 w-3 mr-1.5" /> Users</span>
            <span className="font-semibold">{data.userCount || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center"><Shield className="h-3 w-3 mr-1.5" /> Roles</span>
            <span className="font-semibold">{data.roleCount || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center"><UserCheck className="h-3 w-3 mr-1.5" /> Admins</span>
            <span className="font-semibold">{data.adminCount || 0}</span>
          </div>
        </div>

        {/* Enhanced relationship info on hover */}
        <div className="mt-2 pt-2 border-t border-slate-200">
          <div className="text-xs text-slate-500 text-center">
            Click for details
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
    </div>
  );
};

export default memo(CustomOrgNode);
