import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  iconClassName?: string;
  iconContainerClassName?: string;
}

export const StatsCard = ({
  label,
  value,
  icon,
  iconContainerClassName = "bg-primary/10",
}: StatsCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${iconContainerClassName}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
