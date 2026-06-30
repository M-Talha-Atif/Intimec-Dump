import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";

export const TextInputArea = ({
  input,
  setInput,
  handleSendMessage,
  isTyping,
}: {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: (text: string, isChat: boolean) => void;
  isTyping: boolean;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input, true);
    }
  };
  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-muted/30 dark:bg-muted/10 rounded-3xl border border-border p-1.5 pr-2 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything"
          disabled={false}
          className="flex-1 bg-transparent resize-none outline-none text-sm py-2 px-4 min-h-[32px] max-h-[120px] placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          rows={1}
          style={{ overflow: "auto" }}
        />
        <Button
          onClick={() => handleSendMessage(input, true)}
          size="icon"
          disabled={!input.trim() || isTyping}
          className={cn(
            "h-8 w-8 rounded-full flex-shrink-0 transition-all duration-200",
            input.trim() && !isTyping
              ? "bg-foreground hover:bg-foreground/90 text-background shadow-md hover:shadow-lg"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  );
};
