import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";

export const AiInsightBadge = ({ tag }: { tag: string }) => (
  <Tooltip>
    <TooltipTrigger>
      <Badge
        variant="outline"
        className="font-normal text-xs bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200"
      >
        <Sparkles className="h-3 w-3 mr-1" />
        {tag}
      </Badge>
    </TooltipTrigger>
    <TooltipContent>AI-generated insight</TooltipContent>
  </Tooltip>
);
