"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileEdit, FolderOpen, Sparkles } from 'lucide-react';

interface DesignerEmptyStateProps {
  onCreateNew: () => void;
  onOpenExisting: () => void;
  onUseTemplate: () => void;
}

export const DesignerEmptyState: React.FC<DesignerEmptyStateProps> = ({
  onCreateNew,
  onOpenExisting,
  onUseTemplate
}) => {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Workflow Designer</h2>
          <p className="text-lg text-gray-600">Choose how you'd like to get started</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create New */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={onCreateNew}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <FileEdit className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Create New Workflow</CardTitle>
              <CardDescription>
                Start with a blank canvas and build your workflow from scratch
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full group-hover:bg-blue-50">
                Start Creating
              </Button>
            </CardContent>
          </Card>

          {/* Open Existing */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={onOpenExisting}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <FolderOpen className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Open Existing</CardTitle>
              <CardDescription>
                Continue working on a saved workflow from your catalog
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full group-hover:bg-green-50">
                Browse Workflows
              </Button>
            </CardContent>
          </Card>

          {/* Use Template */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={onUseTemplate}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Use Template</CardTitle>
              <CardDescription>
                Get started quickly with pre-built workflow templates
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full group-hover:bg-purple-50">
                Browse Templates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
