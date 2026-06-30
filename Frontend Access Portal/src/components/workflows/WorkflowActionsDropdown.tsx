
import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, Archive, FileDown, Settings, 
  UserCheck, Star
} from 'lucide-react';
import { Workflow } from '@/data/mock-workflows';

interface WorkflowActionsDropdownProps {
  workflow: Workflow;
  onArchive?: (workflow: Workflow) => void;
  onExport?: (workflow: Workflow) => void;
  onSetDefault?: (workflow: Workflow) => void;
  onAssignOwner?: (workflow: Workflow) => void;
  onAdvancedSettings?: (workflow: Workflow) => void;
}

const WorkflowActionsDropdown: React.FC<WorkflowActionsDropdownProps> = ({
  workflow,
  onArchive,
  onExport,
  onSetDefault,
  onAssignOwner,
  onAdvancedSettings
}) => {
  const handleArchive = () => {
    console.log(`${workflow.status === 'archived' ? 'Unarchiving' : 'Archiving'} workflow:`, workflow.name);
    onArchive?.(workflow);
  };

  const handleExport = () => {
    console.log('Exporting workflow JSON:', workflow.name);
    // Create and download JSON file
    const exportData = {
      ...workflow,
      exportedAt: new Date().toISOString(),
      exportedBy: 'Current User'
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.replace(/\s+/g, '_')}_workflow.json`;
    a.click();
    URL.revokeObjectURL(url);
    onExport?.(workflow);
  };

  const handleSetDefault = () => {
    console.log('Setting as default for trigger type:', workflow.triggerType, workflow.name);
    onSetDefault?.(workflow);
  };

  const handleAssignOwner = () => {
    console.log('Opening owner assignment dialog for:', workflow.name);
    onAssignOwner?.(workflow);
  };

  const handleAdvancedSettings = () => {
    console.log('Opening advanced settings for:', workflow.name);
    onAdvancedSettings?.(workflow);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg border">
        <DropdownMenuItem onClick={handleArchive} className="flex items-center gap-2">
          <Archive className="h-4 w-4" />
          {workflow.status === 'archived' ? 'Unarchive' : 'Archive'}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleExport} className="flex items-center gap-2">
          <FileDown className="h-4 w-4" />
          Export JSON
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSetDefault} className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          Set as Default
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleAssignOwner} className="flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Assign Owner(s)
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleAdvancedSettings} className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Advanced Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WorkflowActionsDropdown;
