
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, Shield, FileText, Download } from 'lucide-react';
import { OrgNodeData } from '@/types/organization';


interface OrgNodeMenuProps {
  node: OrgNodeData;
  onViewDetails: (node: OrgNodeData) => void;
  onLaunchReview: (node: OrgNodeData) => void;
  onOpenRoleReport: (node: OrgNodeData) => void;
  onExportUnit: (node: OrgNodeData) => void;
}

const OrgNodeMenu = ({ 
  node, 
  onViewDetails, 
  onLaunchReview, 
  onOpenRoleReport, 
  onExportUnit 
}: OrgNodeMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => onViewDetails(node)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onLaunchReview(node)}>
          <Shield className="mr-2 h-4 w-4" />
          Launch Access Review
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onOpenRoleReport(node)}>
          <FileText className="mr-2 h-4 w-4" />
          Open Role Report
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onExportUnit(node)}>
          <Download className="mr-2 h-4 w-4" />
          Export Unit Info
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrgNodeMenu;
