"use client";

import React from 'react';
import { ExtendedWorkflowNodeData } from '@/types/workflow-steps';
import { LifecycleNodeConfig } from '../forms/LifecycleNodeConfig';

interface PanelLifecycleProps {
  data: ExtendedWorkflowNodeData;
  onChange: (updates: Partial<ExtendedWorkflowNodeData>) => void;
}

export const PanelLifecycle: React.FC<PanelLifecycleProps> = ({ data, onChange }) => {
  return (
    <LifecycleNodeConfig
      config={data.lifecycleConfig || {}}
      onChange={(config) => onChange({ lifecycleConfig: config })}
    />
  );
};
