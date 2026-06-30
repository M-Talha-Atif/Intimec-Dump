"use client";

import React from 'react';
import { ExtendedWorkflowNodeData } from '@/types/workflow-steps';
import { CertificationConfig } from '../forms/CertificationConfig';

interface PanelCertificationProps {
  data: ExtendedWorkflowNodeData;
  onChange: (updates: Partial<ExtendedWorkflowNodeData>) => void;
}

export const PanelCertification: React.FC<PanelCertificationProps> = ({ data, onChange }) => {
  return (
    <CertificationConfig
      config={data.certificationConfig || {}}
      onChange={(config) => onChange({ certificationConfig: config })}
    />
  );
};
