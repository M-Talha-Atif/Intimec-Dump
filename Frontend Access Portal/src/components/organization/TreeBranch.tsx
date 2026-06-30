'use client';
import { useState } from 'react';
import { OrgNodeData } from '@/types/organization';
import { ChevronRight, Users, Shield, UserCheck, Flag, MapPin, Calendar, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import OrgNodeMenu from './OrgNodeMenu';

interface TreeBranchProps {
  node: OrgNodeData;
  isRoot?: boolean;
  onNodeAction?: (action: string, node: OrgNodeData) => void;
}

const riskColorMap = {
  Low: 'bg-green-100 text-green-800 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  High: 'bg-red-100 text-red-800 border-red-200',
};

const TreeBranch = ({ node, isRoot = false, onNodeAction }: TreeBranchProps) => {
  const [isOpen, setIsOpen] = useState(isRoot);
  const hasChildren = node.children && node.children.length > 0;

  // Mock extended metadata
  const extendedData = {
    location: 'San Francisco, CA',
    lastReviewDate: '2024-10-15',
    applicationCount: Math.floor(Math.random() * 15) + 5,
  };

  const handleMenuAction = (action: string) => {
    if (onNodeAction) {
      onNodeAction(action, node);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center space-x-4">
        <CollapsibleTrigger asChild>
          <button className={cn('flex items-center space-x-2 text-left p-3 rounded-md hover:bg-slate-100 transition-colors w-full', !hasChildren && "cursor-default")}>
            {hasChildren && <ChevronRight className={cn('h-5 w-5 transition-transform', isOpen && 'rotate-90')} />}
            {!hasChildren && <div className="w-5 h-5" />}
            <div className='flex-1'>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-slate-800">{node.name}</span>
                <Badge variant="secondary">{node.type}</Badge>
                {node.riskLevel && <Badge className={cn("hover:bg-inherit", riskColorMap[node.riskLevel])}>{node.riskLevel} Risk</Badge>}
                {node.hasStaleRoles && (
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
              </div>
              {node.head && <p className="text-sm text-slate-500 mb-2">Head: {node.head}</p>}
              
              {/* Extended metadata tiles */}
              <div className="flex items-center gap-4 text-xs text-slate-600 mb-1">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{extendedData.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Last review: {new Date(extendedData.lastReviewDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  <span>{extendedData.applicationCount} apps</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600 mr-4">
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {node.userCount}</span>
              <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> {node.roleCount}</span>
              <span className="flex items-center gap-1"><UserCheck className="h-4 w-4" /> {node.adminCount}</span>
            </div>
          </button>
        </CollapsibleTrigger>
        
        {/* Three-dot menu */}
        <OrgNodeMenu
          node={node}
          onViewDetails={() => handleMenuAction('viewDetails')}
          onLaunchReview={() => handleMenuAction('launchReview')}
          onOpenRoleReport={() => handleMenuAction('openRoleReport')}
          onExportUnit={() => handleMenuAction('exportUnit')}
        />
      </div>

      {hasChildren && (
        <CollapsibleContent>
          <div className="pl-12 mt-2 space-y-2 border-l border-slate-200 ml-4">
            {node.children?.map(child => (
              <TreeBranch 
                key={child.id} 
                node={child} 
                onNodeAction={onNodeAction}
              />
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

export default TreeBranch;
