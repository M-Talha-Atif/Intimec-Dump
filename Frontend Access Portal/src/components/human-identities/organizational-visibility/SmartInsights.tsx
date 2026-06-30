
import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle } from 'lucide-react';
import { smartInsights } from './constants';

interface SmartInsightsProps {
  onInsightAction: (action: string, count: number) => void;
}

export function SmartInsights({ onInsightAction }: SmartInsightsProps) {
  return (
    <div className="mb-6">
      <h4 className="font-semibold mb-3 flex items-center">
        <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
        Smart Insights
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {smartInsights.map((insight) => (
          <div key={insight.id} className={`p-3 rounded-lg border ${
            insight.type === 'error' ? 'bg-red-50 border-red-200' :
            insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{insight.message}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={() => onInsightAction(insight.action, insight.count)}
              >
                {insight.action}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
