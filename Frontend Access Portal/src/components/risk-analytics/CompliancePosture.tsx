
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { complianceFrameworks } from '@/data/mock-risk-analytics';
import { ComplianceFramework } from '@/types/riskAnalytics';
import { cn } from '@/lib/utils';

interface Props {
  onFrameworkClick?: (framework: ComplianceFramework) => void;
}

export const CompliancePosture: React.FC<Props> = ({ onFrameworkClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'At Risk': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Non-Compliant': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-4 w-4 text-primary" />
          Compliance Posture
          <InfoTooltip text="Control coverage and finding status across regulatory frameworks. Click a framework card to drill down into control details." />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complianceFrameworks.map((fw) => (
            <div key={fw.id} className="border border-border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => onFrameworkClick?.(fw)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{fw.icon}</span>
                  <span className="font-semibold text-foreground">{fw.name}</span>
                </div>
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getStatusColor(fw.status))}>
                  {fw.status}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Control Coverage</span>
                  <span className="font-medium text-foreground">{fw.controlCoverage}%</span>
                </div>
                <Progress value={fw.controlCoverage} className="h-1.5" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-1.5 rounded bg-muted/50">
                  <div className="font-semibold text-foreground">{fw.failedControls}</div>
                  <div className="text-muted-foreground">Failed</div>
                </div>
                <div className="text-center p-1.5 rounded bg-muted/50">
                  <div className="font-semibold text-foreground">{fw.openFindings}</div>
                  <div className="text-muted-foreground">Findings</div>
                </div>
                <div className="text-center p-1.5 rounded bg-muted/50">
                  <div className="font-semibold text-foreground">{fw.totalControls}</div>
                  <div className="text-muted-foreground">Controls</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Last audit: {fw.lastAudit}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
