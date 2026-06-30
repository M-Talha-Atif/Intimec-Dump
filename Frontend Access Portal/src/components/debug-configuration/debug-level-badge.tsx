import { Badge } from "@/components/ui/badge";
import { getDebugLevelColor, getDebugLevelVariant } from "@/utils/debug";

const getBadgeVariant = (level: string) => {
  switch (level) {
    case "ERROR":
      return "destructive";
    case "WARN":
      return "secondary";
    case "OFF":
      return "secondary";
    default:
      return "default";
  }
};
interface DebugLevelBadgeProps {
  level: string;
}

export const DebugLevelBadge = ({ level }: DebugLevelBadgeProps) => {
  const variant = getDebugLevelVariant(level);
  const color = getDebugLevelColor(level);

  return (
    <Badge variant={getBadgeVariant(level)} className="text-xs px-1.5 py-0.5">
      {level}
    </Badge>
  );
};
