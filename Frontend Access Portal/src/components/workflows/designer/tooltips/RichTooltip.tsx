"use client";

import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Keyboard } from 'lucide-react';

interface RichTooltipProps {
  title: string;
  description: string;
  example?: string;
  learnMoreUrl?: string;
  keyboardShortcut?: string;
  bestPractice?: string;
  impactLevel?: 'low' | 'medium' | 'high';
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delayDuration?: number;
}

export const RichTooltip: React.FC<RichTooltipProps> = ({
  title,
  description,
  example,
  learnMoreUrl,
  keyboardShortcut,
  bestPractice,
  impactLevel,
  children,
  side = 'top',
  delayDuration = 200,
}) => {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="max-w-xs p-4 space-y-2 animate-fade-in"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-sm">{title}</h4>
              {impactLevel && (
                <Badge 
                  variant={
                    impactLevel === 'high' ? 'destructive' : 
                    impactLevel === 'medium' ? 'default' : 
                    'secondary'
                  }
                  className="text-xs"
                >
                  {impactLevel} impact
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {example && (
            <div className="pt-2 border-t">
              <p className="text-xs font-medium mb-1">Example:</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                {example}
              </code>
            </div>
          )}

          {bestPractice && (
            <div className="pt-2 border-t">
              <p className="text-xs font-medium mb-1">💡 Best Practice:</p>
              <p className="text-xs text-muted-foreground italic">
                {bestPractice}
              </p>
            </div>
          )}

          {(keyboardShortcut || learnMoreUrl) && (
            <div className="flex items-center justify-between pt-2 border-t">
              {keyboardShortcut && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Keyboard className="h-3 w-3" />
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                    {keyboardShortcut}
                  </kbd>
                </div>
              )}
              {learnMoreUrl && (
                <a 
                  href={learnMoreUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Learn more
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
