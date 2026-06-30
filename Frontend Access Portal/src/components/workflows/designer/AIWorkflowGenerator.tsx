"use client";

import React, { useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIWorkflowGeneratorProps {
  open: boolean;
  existingNodes: Node[];
  existingEdges: Edge[];
  onGenerate: (nodes: Node[], edges: Edge[]) => void;
  onClose: () => void;
}

export const AIWorkflowGenerator: React.FC<AIWorkflowGeneratorProps> = ({
  open,
  existingNodes,
  existingEdges,
  onGenerate,
  onClose,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const examplePrompts = [
    "Create an employee onboarding workflow with manager approval and automatic AD provisioning",
    "Build a quarterly access certification campaign for all users with Salesforce access",
    "Design a high-risk access request flow with dual approval and SoD checks",
    "Set up a JML workflow for contractors with time-bound access",
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please describe the workflow you want to create",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const newNodes: Node[] = [
        {
          id: 'ai-start',
          type: 'workflowNode',
          position: { x: 250, y: 50 },
          data: {
            label: 'Start Request',
            stepType: 'trigger',
            risk: 'low' as const,
          },
        },
        {
          id: 'ai-approval',
          type: 'workflowNode',
          position: { x: 250, y: 200 },
          data: {
            label: 'Manager Approval',
            stepType: 'approval',
            risk: 'medium' as const,
          },
        },
        {
          id: 'ai-provision',
          type: 'workflowNode',
          position: { x: 250, y: 350 },
          data: {
            label: 'Provision Access',
            stepType: 'action',
            risk: 'high' as const,
          },
        },
      ];

      const newEdges: Edge[] = [
        { id: 'e1', source: 'ai-start', target: 'ai-approval' },
        { id: 'e2', source: 'ai-approval', target: 'ai-provision' },
      ];

      onGenerate(newNodes, newEdges);
      setIsGenerating(false);
      setPrompt('');
      onClose();

      toast({
        title: "Workflow Generated",
        description: "AI has created a workflow based on your description",
      });
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Workflow Generator
          </DialogTitle>
          <DialogDescription>
            Describe the workflow you want to create, and AI will generate it for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Workflow Description</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Create an employee offboarding workflow that includes manager approval, IT access revocation, and HR documentation..."
              className="min-h-[120px]"
              disabled={isGenerating}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Be specific about approvals, systems, and compliance requirements</span>
              <span>{prompt.length} characters</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Start Examples</label>
            <div className="grid grid-cols-1 gap-2">
              {examplePrompts.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(example)}
                  className="justify-start text-left h-auto py-2"
                  disabled={isGenerating}
                >
                  <Sparkles className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="text-xs">{example}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Workflow
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
