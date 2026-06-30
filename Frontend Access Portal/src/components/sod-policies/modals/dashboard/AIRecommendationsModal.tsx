import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Lightbulb, X } from 'lucide-react';
import { getPriorityBadgeClass } from '@/utils/getBadgeClass';
import { cn } from '@/lib/utils';
import type { AIRecommendation } from '@/types/sodPolicies';

interface AIRecommendationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendations: AIRecommendation[];
  onImplement?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export const AIRecommendationsModal: React.FC<AIRecommendationsModalProps> = ({
  open,
  onOpenChange,
  recommendations,
  onImplement,
  onDismiss
}) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredRecommendations = filter === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.type === filter);

  const getIcon = (type: AIRecommendation['type']) => {
    switch (type) {
      case 'policy_suggestion': return Lightbulb;
      case 'violation_prediction': return AlertTriangle;
      case 'remediation_path': return CheckCircle2;
      case 'risk_alert': return TrendingUp;
    }
  };

  const getPriorityClass = (priority: AIRecommendation['priority']) => {
    return getPriorityBadgeClass(priority);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-blue-600';
    if (confidence >= 50) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              AI Recommendations
            </DialogTitle>
            <Badge variant="outline">
              {filteredRecommendations.length} recommendations
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={filter} onValueChange={setFilter} className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({recommendations.length})</TabsTrigger>
            <TabsTrigger value="policy_suggestion">
              Policies ({recommendations.filter(r => r.type === 'policy_suggestion').length})
            </TabsTrigger>
            <TabsTrigger value="violation_prediction">
              Predictions ({recommendations.filter(r => r.type === 'violation_prediction').length})
            </TabsTrigger>
            <TabsTrigger value="remediation_path">
              Remediations ({recommendations.filter(r => r.type === 'remediation_path').length})
            </TabsTrigger>
            <TabsTrigger value="risk_alert">
              Alerts ({recommendations.filter(r => r.type === 'risk_alert').length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <div className="space-y-3">
              {filteredRecommendations.map((rec) => {
                const Icon = getIcon(rec.type);
                return (
                  <Card key={rec.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${cn(getPriorityClass(rec.priority))} bg-opacity-10`}>
                          <Icon className={`h-6 w-6`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{rec.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={cn(getPriorityClass(rec.priority), "border text-xs")}>
                                  {rec.priority.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">
                                  {rec.type.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <span className={`text-sm font-medium ${getConfidenceColor(rec.confidence)}`}>
                                  {rec.confidence}% confidence
                                </span>
                              </div>
                            </div>
                            {onDismiss && rec.status === 'new' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDismiss(rec.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">
                            {rec.description}
                          </p>

                          <div className="space-y-2 mb-3">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-blue-900">Suggested Action</p>
                              <p className="text-sm text-blue-700 mt-1">{rec.suggestedAction}</p>
                            </div>

                            <div className="p-3 bg-purple-50 rounded-lg">
                              <p className="text-sm font-medium text-purple-900">Expected Impact</p>
                              <p className="text-sm text-purple-700 mt-1">{rec.impact}</p>
                            </div>
                          </div>

                          {(rec.relatedPolicies && rec.relatedPolicies.length > 0) && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Related Policies
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {rec.relatedPolicies.map((policy) => (
                                  <Badge key={policy} variant="outline" className="text-xs">
                                    {policy}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(rec.timestamp).toLocaleString()}
                            </span>
                            <div className="flex gap-2">
                              {rec.status === 'new' && onImplement && (
                                <Button
                                  size="sm"
                                  onClick={() => onImplement(rec.id)}
                                >
                                  Implement
                                </Button>
                              )}
                              {rec.status !== 'new' && (
                                <Badge variant="secondary">
                                  {rec.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                              )}
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredRecommendations.length === 0 && (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">No recommendations in this category</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
