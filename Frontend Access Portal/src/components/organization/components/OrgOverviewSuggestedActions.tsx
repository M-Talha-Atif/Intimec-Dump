import { AlertTriangle, TrendingUp } from 'lucide-react';

interface OrgOverviewSuggestedActionsProps {
  actions: string[];
}

export function OrgOverviewSuggestedActions({ actions }: OrgOverviewSuggestedActionsProps) {
  return (
    <div>
      <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground mb-3">
        <TrendingUp className="h-3 w-3" />
        Suggested Actions
      </div>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <div key={index} className="flex items-start gap-2 text-sm p-2 bg-muted/50 rounded-lg">
            <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
            <span>{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
