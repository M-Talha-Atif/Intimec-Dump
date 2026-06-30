"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExtendedWorkflowNodeData } from '@/types/workflow-steps';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestTube, GitBranch } from 'lucide-react';
import { VisualConditionBuilder } from '../forms/VisualConditionBuilder';

interface PanelTestingProps {
  data: ExtendedWorkflowNodeData;
  onChange: (updates: Partial<ExtendedWorkflowNodeData>) => void;
}

export const PanelTesting: React.FC<PanelTestingProps> = ({ data, onChange }) => {
  const isConditionNode = data.stepType?.includes('condition');

  if (isConditionNode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Visual Condition Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VisualConditionBuilder
            conditions={data.conditions as any}
            onChange={(conditions) => onChange({ conditions: conditions as any })}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="scenarios" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
        <TabsTrigger value="conditions">Conditions</TabsTrigger>
      </TabsList>

      <TabsContent value="scenarios">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Node Test Scenarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Test scenarios - to be implemented</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="conditions">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Conditional Logic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VisualConditionBuilder
              conditions={data.conditions as any}
              onChange={(conditions) => onChange({ conditions: conditions as any })}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
