
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Clock, AlertTriangle, TrendingUp, Play } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getPriorityBadgeClass } from '@/utils/getBadgeClass';
import { cn } from '@/lib/utils';

interface Recommendation {
  id: string;
  type: 'action-based' | 'idle-warning' | 'frequency-suggestion';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  reportId?: string;
}

export const ReportRecommendations = () => {
  const [recommendations] = useState<Recommendation[]>([
    {
      id: '1',
      type: 'action-based',
      title: 'Access Reviews Pending',
      description: 'You have 23 access reviews pending. Generate a campaign status report to track progress.',
      priority: 'high',
      action: 'Generate Campaign Status Report',
      reportId: 'access-review-status'
    },
    {
      id: '2',
      type: 'idle-warning',
      title: 'SoD Violations Report Idle',
      description: 'Your SoD Violations Summary hasn\'t been generated in 35 days. Consider scheduling regular updates.',
      priority: 'medium',
      action: 'Schedule Regular Updates',
      reportId: 'sod-violations'
    },
    {
      id: '3',
      type: 'frequency-suggestion',
      title: 'Optimize Report Frequency',
      description: 'Based on recent activity, consider changing High Risk Identities Report from daily to weekly.',
      priority: 'low',
      action: 'Adjust Frequency',
      reportId: 'risk-report'
    },
    {
      id: '4',
      type: 'action-based',
      title: 'New Policy Violations Detected',
      description: '12 new policy violations detected this week. Generate a compliance report for stakeholders.',
      priority: 'high',
      action: 'Generate Compliance Report',
      reportId: 'compliance-report'
    }
  ]);

  const { toast } = useToast();


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'action-based': return <TrendingUp className="h-4 w-4" />;
      case 'idle-warning': return <Clock className="h-4 w-4" />;
      case 'frequency-suggestion': return <Lightbulb className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleRecommendationAction = (recommendation: Recommendation) => {
    toast({
      title: "Action Taken",
      description: `${recommendation.action} initiated for ${recommendation.title}`,
    });
  };

  const dismissRecommendation = (id: string) => {
    toast({
      title: "Recommendation Dismissed",
      description: "This recommendation has been removed from your list.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          <span>Smart Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    {getTypeIcon(recommendation.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{recommendation.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{recommendation.description}</p>
                  </div>
                </div>
                <Badge className={cn(getPriorityBadgeClass(recommendation.priority), "border text-xs")} variant="secondary">
                  {recommendation.priority}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleRecommendationAction(recommendation)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    {recommendation.action}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => dismissRecommendation(recommendation.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
