import { Card } from '@/components/ui/card';
import { Clock, TrendingDown, Target } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

interface ImpactAnalysisProps {
  analysis: any;
  configuration: any;
}

const ImpactAnalysis = ({ analysis, configuration }: ImpactAnalysisProps) => {
  const avgTimePerReview = 5;
  const totalEstimatedTime = analysis.estimatedItems * avgTimePerReview;
  const hours = Math.floor(totalEstimatedTime / 60);
  const minutes = totalEstimatedTime % 60;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-1.5 mb-4">
        <h3 className="font-semibold text-base">Impact Analysis</h3>
        <InfoTooltip text="Projected effort, risk reduction, and completion estimates based on campaign scope and configuration" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Estimated Effort</p>
            <InfoTooltip text="Total reviewer hours based on average 5 minutes per review item" />
          </div>
          <p className="text-xl font-bold">{hours}h {minutes}m</p>
          <p className="text-xs text-muted-foreground mt-1">~{avgTimePerReview} min per review</p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Risk Reduction</p>
            <InfoTooltip text="Expected decrease in organizational risk score after completing this review campaign" />
          </div>
          <p className="text-xl font-bold">20-40%</p>
          <p className="text-xs text-muted-foreground mt-1">Potential decrease</p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-1.5 mb-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <InfoTooltip text="Projected completion percentage based on SLA configuration and historical reviewer performance" />
          </div>
          <p className="text-xl font-bold">85-95%</p>
          <p className="text-xs text-muted-foreground mt-1">Expected based on SLA</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm">
          <strong>AI Assistance:</strong> {configuration.enableAI ? 'Enabled' : 'Disabled'}
          {configuration.enableAI && (
            <span className="ml-2 text-muted-foreground">• Expected to reduce review time by 30-40%</span>
          )}
          {configuration.autoApproveRules?.enabled && (
            <span className="ml-2 text-muted-foreground">• Auto-approve for risk ≤ {configuration.autoApproveRules.riskThreshold}</span>
          )}
        </p>
      </div>
    </Card>
  );
};

export default ImpactAnalysis;
