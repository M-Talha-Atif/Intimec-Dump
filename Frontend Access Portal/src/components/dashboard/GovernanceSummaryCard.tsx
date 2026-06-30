import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import InfoTooltip from "./InfoTooltip";

interface SummaryRow {
  label: string;
  value: string | number;
  highlight?: boolean; // red highlight for urgent values
}

interface GovernanceSummaryCardProps {
  title: string;
  icon: React.ElementType;
  rows: SummaryRow[];
  progress?: { label: string; value: number };
  onViewAll?: () => void;
  tooltip?: string;
}

const GovernanceSummaryCard = ({ title, icon: Icon, rows, progress, onViewAll, tooltip }: GovernanceSummaryCardProps) => {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {tooltip && <InfoTooltip text={tooltip} side="right" />}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 pb-4">
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <span className={`font-semibold tabular-nums ${row.highlight ? "text-destructive" : "text-foreground"}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
        {progress && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{progress.label}</span>
              <span className="font-medium text-foreground">{progress.value}%</span>
            </div>
            <Progress value={progress.value} className="h-2" />
          </div>
        )}
        {onViewAll && (
          <Button variant="ghost" size="sm" className="mt-auto w-full justify-between text-primary" onClick={onViewAll}>
            View Details <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default GovernanceSummaryCard;
