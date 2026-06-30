import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface PageEmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const PageEmptyState = ({
  icon,
  title,
  message,
  action,
}: PageEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4 flex items-center justify-center bg-muted/30 rounded-full">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
        {message}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
      )}
    </div>
  );
};
