"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitMerge } from 'lucide-react';
import { ExtendedWorkflowNodeData } from '@/types/workflow-steps';

interface SmartParallelConfigProps {
  config?: ExtendedWorkflowNodeData['parallelConfig'];
  onChange: (config: ExtendedWorkflowNodeData['parallelConfig']) => void;
}

export const SmartParallelConfig: React.FC<SmartParallelConfigProps> = ({ config, onChange }) => {
  const updateConfig = (updates: Partial<ExtendedWorkflowNodeData['parallelConfig']>) => {
    onChange({
      maxConcurrency: 5,
      aggregationStrategy: 'all-success',
      failureHandling: 'fail-fast',
      ...config,
      ...updates,
    });
  };

  return (
    <Tabs defaultValue="strategy" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="strategy">Strategy</TabsTrigger>
        <TabsTrigger value="isolation">Isolation</TabsTrigger>
      </TabsList>

      <TabsContent value="strategy" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <GitMerge className="h-4 w-4" />
              Execution Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Strategy Type</Label>
              <Select
                value={config?.strategy?.type || 'all'}
                onValueChange={(value: any) => updateConfig({
                  strategy: {
                    ...config?.strategy,
                    type: value,
                    timeout: config?.strategy?.timeout || 60000,
                    cancelOnFirstFailure: config?.strategy?.cancelOnFirstFailure || false
                  }
                })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All (Wait for all to complete)</SelectItem>
                  <SelectItem value="any">Any (First success wins)</SelectItem>
                  <SelectItem value="quorum">Quorum (Majority succeeds)</SelectItem>
                  <SelectItem value="race">Race (First completion wins)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Max Concurrency</Label>
              <Input
                type="number"
                value={config?.maxConcurrency || 5}
                onChange={(e) => updateConfig({ maxConcurrency: parseInt(e.target.value) })}
                min={1}
                max={20}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Failure Handling</Label>
              <Select
                value={config?.failureHandling || 'fail-fast'}
                onValueChange={(value: any) => updateConfig({ failureHandling: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fail-fast">Fail Fast</SelectItem>
                  <SelectItem value="continue">Continue</SelectItem>
                  <SelectItem value="partial-success">Partial Success</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="isolation" className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Share Context</Label>
                <p className="text-xs text-muted-foreground">Pass workflow variables to child tasks</p>
              </div>
              <Switch
                checked={config?.isolation?.shareContext ?? true}
                onCheckedChange={(checked) => updateConfig({
                  isolation: {
                    ...config?.isolation,
                    shareContext: checked,
                    isolateErrors: config?.isolation?.isolateErrors || false,
                    rollbackStrategy: config?.isolation?.rollbackStrategy || 'all'
                  }
                })}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
