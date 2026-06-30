import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import InfoTooltip from "./InfoTooltip";

type MetricCardProps = {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  trendDirection: 'positive' | 'negative';
  icon: React.ElementType;
  onClick?: () => void;
  tooltip?: string;
};

const MetricCard = ({ title, value, change, trend, trendDirection, icon: Icon, onClick, tooltip }: MetricCardProps) => {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trendDirection === 'positive' ? 'text-success-foreground' : 'text-destructive';

  return (
    <Card
      className={`transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
        <div className="flex items-center gap-1">
          <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
          {tooltip && <InfoTooltip text={tooltip} />}
        </div>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="text-xl font-bold text-foreground">{value}</div>
        <p className="mt-1 flex items-center text-xs text-muted-foreground">
          <TrendIcon className={`mr-1 h-3 w-3 ${trendColor}`} />
          <span className={trendColor}>{change}</span>
          <span className="ml-1">vs last period</span>
        </p>
      </CardContent>
    </Card>
  );
};
export default MetricCard;
