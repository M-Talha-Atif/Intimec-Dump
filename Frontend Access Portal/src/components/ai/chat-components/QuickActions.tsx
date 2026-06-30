import { Button } from "@/components/ui/button";

export function QuickActions({
  handleSendMessage,
  suggestionChips,
}: {
  handleSendMessage: (text: string) => void;
  suggestionChips: Array<{ text: string; icon: React.ElementType }>;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground px-1">
        Quick actions
      </p>
      <div className="grid grid-cols-1 gap-2">
        {suggestionChips.map((chip) => (
          <Button
            key={chip.text}
            variant="outline"
            size="sm"
            className="w-full justify-start text-left h-auto py-2.5 px-3 rounded-lg hover:bg-accent hover:border-accent-foreground transition-all group border-border"
            onClick={() => handleSendMessage(chip.text)}
          >
            <chip.icon className="mr-2.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            <span className="whitespace-normal leading-snug text-xs text-foreground">
              {chip.text}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
