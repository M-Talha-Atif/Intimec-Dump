"use client";

import React from 'react';
import { ExtendedWorkflowNodeData } from '@/types/workflow-steps';

interface PanelExplainProps {
  data: ExtendedWorkflowNodeData;
  onChange: (updates: Partial<ExtendedWorkflowNodeData>) => void;
}

export const PanelExplain: React.FC<PanelExplainProps> = ({ data, onChange }) => {
  // Placeholder - will be replaced with ExplainableNodeConfig when form components are copied
  return (
    <div className="p-4">
      <p className="text-sm text-muted-foreground">Explainability configuration - to be implemented</p>
    </div>
  );
};
