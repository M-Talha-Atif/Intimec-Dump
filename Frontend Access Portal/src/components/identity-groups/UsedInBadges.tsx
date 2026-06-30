import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UsedInBadgesProps {
  usedIn: string[];
  maxVisible?: number;
  className?: string;
}

export function UsedInBadges({ usedIn, maxVisible = 3, className = '' }: UsedInBadgesProps) {
  if (!usedIn || usedIn.length === 0) {
    return <span className="text-sm text-muted-foreground">Not used</span>;
  }

  const visible = usedIn.slice(0, maxVisible);
  const remaining = usedIn.length - visible.length;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {visible.map((app, index) => (
        <Badge key={index} variant="secondary" className="text-xs">
          {app}
        </Badge>
      ))}
      {remaining > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs cursor-help">
                +{remaining} more
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {usedIn.slice(maxVisible).map((app, index) => (
                  <div key={index} className="text-xs">{app}</div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
