import React, { useState } from 'react';
import { Workflow } from '@/data/mock-workflows';
import { PanelHeader } from './components/PanelHeader';
import { ActionButtons } from './components/ActionButtons';
import { TabsContent } from './components/TabsContent';

interface WorkflowDetailPanelProps {
  workflow: Workflow;
  onClose: () => void;
  onEdit?: (workflow: Workflow) => void;
  onRun?: (workflow: Workflow) => void;
  onClone?: (workflow: Workflow) => void;
  onDelete?: (workflow: Workflow) => void;
}

export function WorkflowDetailPanel({
  workflow,
  onClose,
  onEdit,
  onRun,
  onClone,
  onDelete
}: WorkflowDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="h-full bg-background border-l flex flex-col">
      <PanelHeader workflow={workflow} onClose={onClose} />
      <ActionButtons 
        workflow={workflow} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onEdit={onEdit}
        onRun={onRun}
        onClone={onClone}
        onDelete={onDelete}
      />
      <TabsContent 
        workflow={workflow} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />
    </div>
  );
}
