"use client";

import React from 'react';
import { ChevronRight, Home, FileEdit, FolderOpen, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DesignerBreadcrumbProps {
  mode: 'empty' | 'creating' | 'editing';
  workflowName?: string;
  isDraft?: boolean;
  onClose?: () => void;
}

export const DesignerBreadcrumb: React.FC<DesignerBreadcrumbProps> = ({
  mode,
  workflowName,
  isDraft = false,
  onClose
}) => {
  if (mode === 'empty') {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-2 px-6 py-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Workflows</span>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <span className="text-gray-600">Designer</span>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        
        {mode === 'creating' ? (
          <div className="flex items-center gap-2">
            <FileEdit className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-gray-900">New Workflow</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Draft
            </Badge>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-green-600" />
            <span className="font-medium text-gray-900">{workflowName || 'Untitled'}</span>
            {isDraft && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Draft
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {/* Close button */}
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 px-3"
        >
          <X className="h-4 w-4 mr-1" />
          Close
        </Button>
      )}
    </div>
  );
};
