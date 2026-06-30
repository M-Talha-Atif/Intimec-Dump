"use client";

import React from 'react';
import { ExtendedWorkflowNodeData } from '@/types/workflow-steps';
import { DataEnrichmentConfig } from '../forms/DataEnrichmentConfig';

interface PanelEnrichmentProps {
  data: ExtendedWorkflowNodeData;
  onChange: (updates: Partial<ExtendedWorkflowNodeData>) => void;
}

export const PanelEnrichment: React.FC<PanelEnrichmentProps> = ({ data, onChange }) => {
  return (
    <DataEnrichmentConfig
      config={data.enrichmentConfig || {}}
      onChange={(config) => onChange({ enrichmentConfig: config })}
    />
  );
};
