import { CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";
import InfoTooltip from '@/components/dashboard/InfoTooltip';

interface TileHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
  count?: number;
  isLoading?: boolean;
  infoTooltipText?: string;
}

export const TileHeader = ({
  icon,
  title,
  description,
  count,
  isLoading,
  infoTooltipText,
}: TileHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>

        <div>
          <div className="flex items-center gap-1.5">
            <CardTitle>{title}</CardTitle>

            {infoTooltipText && (
              <InfoTooltip text={infoTooltipText} />
            )}
          </div>

          <CardDescription>{description}</CardDescription>
        </div>
      </div>

      {!isLoading && count !== undefined && (
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {count}
        </Badge>
      )}
    </div>
  );
};