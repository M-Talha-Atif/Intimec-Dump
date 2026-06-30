import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Edit, GitBranch, Trash2 } from 'lucide-react';
import { Workflow } from '@/data/mock-workflows';

interface ActionButtonsProps {
  workflow: Workflow;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onEdit?: (workflow: Workflow) => void;
  onRun?: (workflow: Workflow) => void;
  onClone?: (workflow: Workflow) => void;
  onDelete?: (workflow: Workflow) => void;
}

export function ActionButtons({ 
  workflow, 
  activeTab, 
  onTabChange, 
  onEdit, 
  onRun, 
  onClone, 
  onDelete 
}: ActionButtonsProps) {
  return (
    <div className="border-b">
      {/* Primary Actions */}
      <div className="px-6 py-3 flex items-center gap-2 bg-muted/20">
        {workflow.triggerType !== 'event-based' && (
          <Button 
            size="sm" 
            onClick={() => onRun?.(workflow)}
            disabled={workflow.status !== 'enabled'}
          >
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
        )}
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onEdit?.(workflow)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onClone?.(workflow)}
        >
          <GitBranch className="h-4 w-4 mr-2" />
          Clone
        </Button>
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={() => onDelete?.(workflow)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="px-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="logs">Run Logs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
