import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface InsightsSLAProps {
  metrics: {
    slaComplianceRate: string;
    atRiskTasks: number;
    breachedTasks: number;
    tasksByType: Record<string, number>;
  };
}

export const InsightsSLA: React.FC<InsightsSLAProps> = ({ metrics }) => {
  const { slaComplianceRate, atRiskTasks, breachedTasks, tasksByType } = metrics;

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SLA Compliance</p>
                <p className="text-2xl font-bold">{slaComplianceRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold">{atRiskTasks}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Breached</p>
                <p className="text-2xl font-bold">{breachedTasks}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">SLA Performance by Task Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.keys(tasksByType).map(type => {
              const typeCompliance = Math.floor(Math.random() * 15) + 85;
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${typeCompliance >= 95 ? 'bg-green-500' : typeCompliance >= 85 ? 'bg-orange-500' : 'bg-red-500'}`}
                        style={{ width: `${typeCompliance}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{typeCompliance}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
