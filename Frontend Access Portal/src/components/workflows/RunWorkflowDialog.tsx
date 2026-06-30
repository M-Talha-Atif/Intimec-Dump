import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Zap, AlertTriangle } from 'lucide-react';
import { Workflow } from '@/data/mock-workflows';

interface RunWorkflowDialogProps {
  open: boolean;
  onClose: () => void;
  workflow: Workflow | null;
  onSimulate: (workflow: Workflow, context?: any) => void;
  onExecute: (workflow: Workflow, context?: any) => void;
}

export const RunWorkflowDialog: React.FC<RunWorkflowDialogProps> = ({
  open,
  onClose,
  workflow,
  onSimulate,
  onExecute
}) => {
  const [mode, setMode] = useState<'simulate' | 'execute'>('simulate');
  
  // Generate context data from actual workflow
  const getWorkflowContext = () => {
    if (!workflow) return '{}';
    
    return JSON.stringify({
      workflowId: workflow.id,
      workflowName: workflow.name,
      category: workflow.category,
      triggerType: workflow.triggerType,
      applicationScope: workflow.applicationScope,
      nodes: workflow.nodes || [],
      edges: workflow.edges || [],
      metadata: {
        version: workflow.version,
        owner: workflow.owner,
        tags: workflow.tags,
        complianceFrameworks: workflow.complianceFrameworks,
        riskScore: workflow.riskScore,
        status: workflow.status
      }
    }, null, 2);
  };

  const [contextData, setContextData] = useState(getWorkflowContext());

  // Update context when workflow changes
  React.useEffect(() => {
    setContextData(getWorkflowContext());
  }, [workflow]);

  const handleRun = () => {
    if (!workflow) return;

    let parsedContext = {};
    try {
      parsedContext = JSON.parse(contextData);
    } catch (error) {
      console.error('Invalid JSON context:', error);
    }

    if (mode === 'simulate') {
      onSimulate(workflow, parsedContext);
    } else {
      onExecute(workflow, parsedContext);
    }
    onClose();
  };

  if (!workflow) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-brand-teal" />
            Run Workflow: {workflow.name}
          </DialogTitle>
          <DialogDescription>
            Choose how to run this workflow and provide execution context
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'simulate' | 'execute')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simulate" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Simulate
            </TabsTrigger>
            <TabsTrigger value="execute" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Real Execution
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simulate" className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Simulation Mode</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Test the workflow with mock data. No real changes will be made to systems or user accounts.
                    Use this to preview execution paths, timing, and potential issues.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sim-context">Workflow Context (Read-only)</Label>
              <Textarea
                id="sim-context"
                value={contextData}
                readOnly
                className="font-mono text-sm h-48 bg-gray-50"
                placeholder='{"workflowId": "..."}'
              />
              <p className="text-xs text-gray-500">
                Workflow metadata and configuration
              </p>
            </div>
          </TabsContent>

          <TabsContent value="execute" className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900">Real Execution Mode</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Execute the workflow with real actions. This will make actual changes to systems, send notifications,
                    and modify user access. Only use when the workflow is tested and approved.
                  </p>
                </div>
              </div>
            </div>

            {workflow.status !== 'enabled' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Workflow Not Enabled</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This workflow is in <Badge variant="outline" className="ml-1">{workflow.status}</Badge> status.
                      Enable it first to execute in production mode.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="exec-context">Workflow Context (Read-only)</Label>
              <Textarea
                id="exec-context"
                value={contextData}
                readOnly
                className="font-mono text-sm h-48 bg-gray-50"
                placeholder='{"workflowId": "..."}'
              />
              <p className="text-xs text-gray-500">
                Workflow metadata and configuration
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleRun}
            disabled={mode === 'execute' && workflow.status !== 'enabled'}
            className="flex items-center gap-2"
          >
            {mode === 'simulate' ? (
              <>
                <Zap className="h-4 w-4" />
                Run Simulation
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Execute Workflow
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
