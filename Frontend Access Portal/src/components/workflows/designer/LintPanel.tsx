"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  X,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { LintIssue } from '@/validators/workflowLinter';

interface LintPanelProps {
  issues: LintIssue[];
  isVisible: boolean;
  onClose: () => void;
  onFocusNode: (nodeId: string) => void;
  onFocusEdge: (edgeId: string) => void;
}

export const LintPanel: React.FC<LintPanelProps> = ({
  issues,
  isVisible,
  onClose,
  onFocusNode,
  onFocusEdge
}) => {
  if (!isVisible) return null;

  const errorIssues = issues.filter(issue => issue.type === 'error');
  const warningIssues = issues.filter(issue => issue.type === 'warning');

  const handleIssueClick = (issue: LintIssue) => {
    if (issue.nodeId) {
      onFocusNode(issue.nodeId);
    } else if (issue.edgeId) {
      onFocusEdge(issue.edgeId);
    }
  };

  const getIssueIcon = (type: 'error' | 'warning') => {
    return type === 'error' ? (
      <AlertCircle className="h-4 w-4 text-red-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
    );
  };

  const getIssueColor = (type: 'error' | 'warning') => {
    return type === 'error' ? 'border-l-red-500 bg-red-50' : 'border-l-yellow-500 bg-yellow-50';
  };

  return (
    <Card className="mx-4 mb-4 border-t-slate-200">
      <div className="p-4 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {issues.length === 0 ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold text-green-700">Workflow Valid</h3>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <h3 className="font-semibold">Validation Issues</h3>
                </>
              )}
            </div>
            
            <div className="flex gap-2">
              {errorIssues.length > 0 && (
                <Badge variant="destructive">
                  {errorIssues.length} error{errorIssues.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {warningIssues.length > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {warningIssues.length} warning{warningIssues.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {issues.length > 0 && (
        <ScrollArea className="max-h-48">
          <div className="p-4 space-y-3">
            {errorIssues.map(issue => (
              <div
                key={issue.id}
                className={`border-l-4 p-3 rounded-r cursor-pointer transition-colors hover:bg-slate-50 ${getIssueColor(issue.type)}`}
                onClick={() => handleIssueClick(issue)}
              >
                <div className="flex items-start gap-3">
                  {getIssueIcon(issue.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{issue.message}</p>
                      {(issue.nodeId || issue.edgeId) && (
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                    {issue.fix && (
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-600 italic">{issue.fix}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {warningIssues.map(issue => (
              <div
                key={issue.id}
                className={`border-l-4 p-3 rounded-r cursor-pointer transition-colors hover:bg-slate-50 ${getIssueColor(issue.type)}`}
                onClick={() => handleIssueClick(issue)}
              >
                <div className="flex items-start gap-3">
                  {getIssueIcon(issue.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{issue.message}</p>
                      {(issue.nodeId || issue.edgeId) && (
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                    {issue.fix && (
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-600 italic">{issue.fix}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {issues.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm">All validation checks passed!</p>
        </div>
      )}
    </Card>
  );
};
