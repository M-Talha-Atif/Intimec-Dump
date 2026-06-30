"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wrench, XCircle, AlertTriangle } from 'lucide-react';
import { ExtendedLintIssue } from '@/validators/workflowLinter';

interface LintFixPanelProps {
  issues: ExtendedLintIssue[];
  onApplyFix: (issueId: string, fixId: string, args?: any) => void;
  onFocusNode?: (nodeId: string) => void;
  onFocusEdge?: (edgeId: string) => void;
}

export const LintFixPanel: React.FC<LintFixPanelProps> = ({
  issues,
  onApplyFix,
  onFocusNode,
  onFocusEdge,
}) => {
  const issuesWithFixes = issues.filter((issue) => issue.fixAction);
  const errorIssues = issuesWithFixes.filter((i) => i.severity === 'error');
  const warningIssues = issuesWithFixes.filter((i) => i.severity === 'warning');

  const handleApply = (issue: ExtendedLintIssue) => {
    if (issue.fixAction) {
      onApplyFix(issue.id, issue.fixAction.id, issue.fixAction.args);
    }
  };

  const handleFocus = (issue: ExtendedLintIssue) => {
    if (issue.nodeId && onFocusNode) {
      onFocusNode(issue.nodeId);
    } else if (issue.edgeId && onFocusEdge) {
      onFocusEdge(issue.edgeId);
    }
  };

  if (issuesWithFixes.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 w-96 max-h-96 bg-white rounded-lg shadow-xl border z-50">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="font-medium">Quick Fixes Available</span>
          </div>
          <Badge variant="secondary">{issuesWithFixes.length}</Badge>
        </div>
      </div>

      <ScrollArea className="h-80">
        <div className="p-4 space-y-3">
          {errorIssues.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-red-600 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Errors ({errorIssues.length})
              </div>
              {errorIssues.map((issue) => (
                <Card key={issue.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-3 space-y-2">
                    <div className="text-sm font-medium">{issue.message}</div>
                    {issue.description && (
                      <div className="text-xs text-muted-foreground">{issue.description}</div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApply(issue)}
                        className="text-xs h-7"
                      >
                        <Wrench className="h-3 w-3 mr-1" />
                        {issue.fixAction?.label || 'Apply Fix'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFocus(issue)}
                        className="text-xs h-7"
                      >
                        Focus
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {warningIssues.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-yellow-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Warnings ({warningIssues.length})
              </div>
              {warningIssues.map((issue) => (
                <Card key={issue.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-3 space-y-2">
                    <div className="text-sm font-medium">{issue.message}</div>
                    {issue.description && (
                      <div className="text-xs text-muted-foreground">{issue.description}</div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApply(issue)}
                        className="text-xs h-7"
                      >
                        <Wrench className="h-3 w-3 mr-1" />
                        {issue.fixAction?.label || 'Apply Fix'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFocus(issue)}
                        className="text-xs h-7"
                      >
                        Focus
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
