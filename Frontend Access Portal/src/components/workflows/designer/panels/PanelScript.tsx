"use client";

import React from 'react';
import { ExtendedWorkflowNodeData } from '@/types/workflow-steps';
import { SecureScriptEditor } from '../forms/SecureScriptEditor';

interface PanelScriptProps {
  data: ExtendedWorkflowNodeData;
  onChange: (updates: Partial<ExtendedWorkflowNodeData>) => void;
}

export const PanelScript: React.FC<PanelScriptProps> = ({ data, onChange }) => {
  return (
    <SecureScriptEditor
      config={data.scriptConfig || {}}
      onChange={(config) => onChange({ scriptConfig: config })}
    />
  );
};
