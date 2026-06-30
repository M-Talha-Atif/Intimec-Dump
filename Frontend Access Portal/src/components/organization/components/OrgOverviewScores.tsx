import { Label } from '@/components/ui/label';
import { OrgNodeData } from '@/types/organization';

interface OrgOverviewScoresProps {
  node: OrgNodeData;
}

export function OrgOverviewScores({ node }: OrgOverviewScoresProps) {
  if (!node.healthScore && !node.riskScore) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      {node.healthScore !== undefined && (
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Health Score</Label>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${node.healthScore}%` }}
              />
            </div>
            <span className="text-sm font-medium">{node.healthScore}%</span>
          </div>
        </div>
      )}
      {node.riskScore !== undefined && (
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Risk Score</Label>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="bg-destructive rounded-full h-2 transition-all"
                style={{ width: `${node.riskScore}%` }}
              />
            </div>
            <span className="text-sm font-medium">{node.riskScore}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
