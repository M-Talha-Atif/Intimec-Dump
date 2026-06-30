import { Badge } from "@/components/ui/badge";
import { Application } from "@/types/application";

export default function AiBadge({
  status,
}: {
  status: Application["aiStatus"];
}) {
  switch (status) {
    case "AI Analyzed":
      return (
        <Badge
          variant="outline"
          className="border-blue-200 bg-blue-50 font-normal text-blue-800 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
        >
          AI Analyzed
        </Badge>
      );
    case "AI Pending":
      return <Badge variant="outline">AI Pending</Badge>;
  }
}
