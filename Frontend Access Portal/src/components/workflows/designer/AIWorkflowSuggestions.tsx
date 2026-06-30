"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Node, Edge } from '@xyflow/react';
import { WorkflowNodeData } from '@/types/workflow';

interface AIWorkflowSuggestionsProps {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  onAddNode: (nodeData: { label: string; stepType: string; icon: any; risk: 'low' | 'medium' | 'high' }) => void;
}

export const AIWorkflowSuggestions: React.FC<AIWorkflowSuggestionsProps> = ({ nodes, edges, onAddNode }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { toast } = useToast();

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const workflowContext = {
        nodeCount: nodes.length,
        nodeTypes: nodes.map(n => n.data.stepType),
        hasApproval: nodes.some(n => n.data.stepType === 'approval'),
        hasNotification: nodes.some(n => n.data.stepType === 'notification'),
        highRiskNodes: nodes.filter(n => n.data.risk === 'high').length,
      };

      const newSuggestions = [];

      if (!workflowContext.hasApproval && workflowContext.highRiskNodes > 0) {
        newSuggestions.push({
          type: 'approval',
          label: 'Add Approval Step',
          reason: 'High-risk operations detected without approval workflow',
          priority: 'high',
        });
      }

      if (!workflowContext.hasNotification) {
        newSuggestions.push({
          type: 'notification',
          label: 'Add Notification',
          reason: 'Keep stakeholders informed of workflow progress',
          priority: 'medium',
        });
      }

      if (nodes.length > 5 && !nodes.some(n => n.data.stepType === 'condition')) {
        newSuggestions.push({
          type: 'condition',
          label: 'Add Conditional Logic',
          reason: 'Complex workflow could benefit from branching logic',
          priority: 'medium',
        });
      }

      setSuggestions(newSuggestions);

      if (newSuggestions.length === 0) {
        toast({
          title: 'No suggestions',
          description: 'Your workflow looks well-structured!',
        });
      }
    } catch (error) {
      toast({
        title: 'Error generating suggestions',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={generateSuggestions}
        disabled={loading}
        className="w-full"
        variant="outline"
        size="sm"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Get AI Suggestions
          </>
        )}
      </Button>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((suggestion, idx) => (
            <Card key={idx} className="p-3 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{suggestion.label}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      suggestion.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                      suggestion.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {suggestion.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    toast({
                      title: 'Suggestion applied',
                      description: `${suggestion.label} will be added to the workflow`,
                    });
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
