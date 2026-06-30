import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface TileEmptyStateProps {
  icon: ReactNode;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const TileEmptyState = ({
  icon,
  message,
  action,
}: TileEmptyStateProps) => {
  return (
    <div className="text-center py-8">
      <div className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      {action && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};
