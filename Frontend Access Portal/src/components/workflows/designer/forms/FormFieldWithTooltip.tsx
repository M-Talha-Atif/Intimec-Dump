"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { HelpCircle } from 'lucide-react';
import { RichTooltip } from '../tooltips/RichTooltip';
import { propertyTooltips } from '../tooltips/tooltipContent';

interface FormFieldWithTooltipProps {
  fieldKey: string;
  label: string;
  children: React.ReactNode;
  required?: boolean;
}

export const FormFieldWithTooltip: React.FC<FormFieldWithTooltipProps> = ({
  fieldKey,
  label,
  children,
  required = false,
}) => {
  const tooltipContent = propertyTooltips[fieldKey];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {tooltipContent && (
          <RichTooltip
            title={tooltipContent.title}
            description={tooltipContent.description}
            example={tooltipContent.example}
            bestPractice={tooltipContent.bestPractice}
            impactLevel={tooltipContent.impactLevel}
            side="right"
            delayDuration={300}
          >
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
          </RichTooltip>
        )}
      </div>
      {children}
    </div>
  );
};
