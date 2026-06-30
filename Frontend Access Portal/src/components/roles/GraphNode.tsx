
import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Server, Building, Briefcase, FileText, KeyRound, MoreHorizontal, GitMerge, Eye, Scale, UserPlus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const nodeIcons: { [key: string]: React.ElementType } = {
  'Functional Role': Building,
  'Business Role': Briefcase,
  'Technical Role': Server,
  'Application Role': FileText,
  'Entitlement': KeyRound,
};

const riskColors: { [key: string]: string } = {
  High: 'border-red-500 bg-red-50 text-red-900',
  Medium: 'border-amber-500 bg-amber-50 text-amber-900',
  Low: 'border-green-500 bg-green-50 text-green-900',
  default: 'border-slate-300 bg-slate-100 text-slate-800',
};

const statusColors: { [key: string]: string } = {
  Deprecated: 'border-yellow-400 bg-yellow-50 opacity-70',
  default: '',
};

const GraphNode = ({ data }: { data: any }) => {
  const nodeType = data.privilegeLevel ? 'Entitlement' : data.type;
  const Icon = nodeIcons[nodeType] || Briefcase;
  const riskScore = data.risk?.score || (data.isRisky ? 'Medium' : 'Low');
  const riskColor = riskColors[riskScore] || riskColors.default;
  const statusColor = data.status === 'Deprecated' ? statusColors.Deprecated : statusColors.default;
  const isRole = !data.privilegeLevel;
  const hasConflict = isRole && data.risk?.conflict && data.risk.conflict.overlap > 80;

  return (
    <div className={cn("p-3 rounded-lg shadow-sm border-2 w-56", riskColor, statusColor)}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 overflow-hidden">
          <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", riskColor.replace(/bg-\w+-50/, ''))} />
          <div className="flex flex-col">
            <div className="font-bold text-sm truncate" title={data.label}>{data.label}</div>
            <Badge variant="outline" className="text-xs w-fit mt-1">{nodeType}</Badge>
          </div>
        </div>
         {isRole && (
          <div className="flex items-center shrink-0 ml-1">
            {hasConflict && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <GitMerge className="h-4 w-4 text-amber-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>High overlap ({data.risk.conflict.overlap}%) with {data.risk.conflict.roleName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => data.onSelect(data.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => console.log('Compare role:', data.id)}>
                  <Scale className="mr-2 h-4 w-4" />
                  <span>Compare</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onSelect={() => console.log('Request access to role:', data.id)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Request Access</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
    </div>
  );
};

export default memo(GraphNode);
