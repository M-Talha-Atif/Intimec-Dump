import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, TrendingDown, TrendingUp} from 'lucide-react';
import { cn } from '@/lib/utils';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconClassName?: string;
  valueClassName?: string;
  tooltip?: string;
  onClick?: () => void;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  };
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  iconClassName,
  valueClassName,
  tooltip,
  onClick,
  badge,
  trend
}: StatCardProps) => {
  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-md transition-all group",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground truncate">
              {title}
            </span>
            {tooltip && <InfoTooltip text={tooltip} />}
          </div>

          <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </div>

        <div
          className={cn(
            "text-xl font-bold text-foreground",
            valueClassName
          )}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>

        {(trend || badge) && (
          <div className="flex items-center gap-1 mt-1">
            {trend && (
              <>
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-success-foreground" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span
                  className={cn(
                    "text-xs",
                    trend.isPositive
                      ? "text-success-foreground"
                      : "text-destructive"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">
                  vs last period
                </span>
              </>
            )}

            {badge && (
              <Badge
                variant={badge.variant}
                className={cn("text-[10px] px-1.5 py-0", badge.className)}
              >
                {badge.label}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
