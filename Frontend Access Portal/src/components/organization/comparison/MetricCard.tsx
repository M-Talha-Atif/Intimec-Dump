import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  unit?: string;
  format?: 'number' | 'percentage' | 'currency';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  previousValue,
  unit,
  format = 'number',
  severity,
  description,
  className,
}: MetricCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      default:
        return val.toLocaleString();
    }
  };

  const calculateChange = () => {
    if (previousValue === undefined || typeof value === 'string') return null;
    
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    const change = numValue - previousValue;
    const percentChange = previousValue !== 0 ? (change / previousValue) * 100 : 0;
    
    return {
      value: change,
      percent: percentChange,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    };
  };

  const change = calculateChange();

  const severityColors = {
    low: 'text-success border-success/20 bg-success/5',
    medium: 'text-warning border-warning/20 bg-warning/5',
    high: 'text-destructive border-destructive/20 bg-destructive/5',
    critical: 'text-destructive border-destructive bg-destructive/10',
  };

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        {severity && (
          <Badge variant="outline" className={cn("text-xs", severityColors[severity])}>
            {severity === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {severity.toUpperCase()}
          </Badge>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold">
            {formatValue(value)}
            {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
          </div>

          {change && (
            <div className="flex items-center gap-1 mt-1">
              {change.direction === 'up' && (
                <>
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">
                    +{Math.abs(change.percent).toFixed(1)}%
                  </span>
                </>
              )}
              {change.direction === 'down' && (
                <>
                  <TrendingDown className="w-3 h-3 text-destructive" />
                  <span className="text-xs text-destructive">
                    {change.percent.toFixed(1)}%
                  </span>
                </>
              )}
              {change.direction === 'stable' && (
                <>
                  <Minus className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">No change</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </Card>
  );
}
