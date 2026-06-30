import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { AISuggestion } from '@/types/accessReview';

interface AIAnalysisPanelProps {
  suggestion: AISuggestion;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ suggestion }) => {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve': return 'bg-green-100 text-green-700';
      case 'revoke': return 'bg-red-100 text-red-700';
      case 'modify': return 'bg-amber-100 text-amber-700';
      case 'review': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 85) return { label: 'Very High', color: 'text-green-600' };
    if (confidence >= 70) return { label: 'High', color: 'text-blue-600' };
    if (confidence >= 50) return { label: 'Medium', color: 'text-amber-600' };
    return { label: 'Low', color: 'text-red-600' };
  };

  const confidenceLevel = getConfidenceLevel(suggestion.confidence);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="h-4 w-4" />
          AI-Powered Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Recommended Action</p>
            <Badge className={getActionColor(suggestion.action)} variant="secondary">
              {suggestion.action}
            </Badge>
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Confidence Level</p>
            <p className={`text-sm font-bold ${confidenceLevel.color}`}>{confidenceLevel.label}</p>
          </div>
          <Progress value={suggestion.confidence} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{suggestion.confidence}% confidence</p>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">AI Reasoning</p>
                <p className="text-xs text-blue-700 mt-1">{suggestion.reasoning}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Risk Assessment</p>
                <p className="text-xs text-amber-700 mt-1">{suggestion.riskAssessment}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {suggestion.detectedAnomalies && suggestion.detectedAnomalies.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Detected Anomalies
            </p>
            <div className="space-y-1">
              {suggestion.detectedAnomalies.map((anomaly, index) => (
                <Card key={index} className="bg-red-50 border-red-200">
                  <CardContent className="p-2">
                    <p className="text-xs text-red-700">{anomaly}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {suggestion.alternativeActions && suggestion.alternativeActions.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Alternative Actions
            </p>
            <div className="space-y-1">
              {suggestion.alternativeActions.map((action, index) => (
                <Card key={index}>
                  <CardContent className="p-2">
                    <p className="text-xs">{action}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
