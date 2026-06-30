import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Workflow } from '@/data/mock-workflows';

interface PanelHeaderProps {
  workflow: Workflow;
  onClose: () => void;
}

export function PanelHeader({ workflow, onClose }: PanelHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPolicyIcon = (compliance: string) => {
    switch (compliance) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'violation': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex items-start justify-between p-6 border-b bg-muted/30">
      <div className="flex-1 mr-4 min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <h2 
            className="text-lg font-semibold truncate max-w-full" 
            title={workflow.name}
            style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              minWidth: 0
            }}
          >
            {workflow.name}
          </h2>
          <Badge className={getStatusColor(workflow.status)}>
            {workflow.status}
          </Badge>
          <div className="flex items-center gap-1 flex-shrink-0">
            {getPolicyIcon(workflow.policyCompliance)}
            <span className="text-sm text-muted-foreground">{workflow.policyCompliance}</span>
          </div>
        </div>
        <p 
          className="text-sm text-muted-foreground" 
          title={workflow.description}
          style={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as any,
            wordBreak: 'break-word'
          }}
        >
          {workflow.description}
        </p>
        
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
          <div className="whitespace-nowrap">
            <span className="font-medium">Category:</span> {workflow.category.replace('-', ' ')}
          </div>
          <div className="whitespace-nowrap">
            <span className="font-medium">Trigger:</span> {workflow.triggerType}
          </div>
          <div className="whitespace-nowrap">
            <span className="font-medium">Version:</span> v{workflow.currentVersion}
          </div>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
