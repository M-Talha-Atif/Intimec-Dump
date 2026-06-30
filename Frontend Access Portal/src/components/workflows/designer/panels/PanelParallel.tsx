"use client";

import React from 'react';
import { ExtendedWorkflowNodeData } from '@/types/workflow-steps';
import { SmartParallelConfig } from '../forms/SmartParallelConfig';

interface PanelParallelProps {
  data: ExtendedWorkflowNodeData;
  onChange: (updates: Partial<ExtendedWorkflowNodeData>) => void;
}

export const PanelParallel: React.FC<PanelParallelProps> = ({ data, onChange }) => {
  return (
    <SmartParallelConfig
      config={data.parallelConfig}
      onChange={(config) => onChange({ parallelConfig: config })}
    />
  );
};
