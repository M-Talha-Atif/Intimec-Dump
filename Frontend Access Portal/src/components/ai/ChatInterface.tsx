// components/ai/ChatInterface.tsx
import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ShieldQuestion,
  User,
  FileText,
  AlertCircle,
  Sparkles,
  Monitor,
  Download,
  PlayCircle,
  Zap,
  Maximize,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { StructuredAIResponse } from "@/components/ai/StructuredAIResponse";
import { generateMockAIResponse } from "@/utils/mockAIResponses";
import { useRouter } from "next/navigation";
import { useAIAssistant } from "@/contexts/AIAssistantContext";
import { TextInputArea } from "./chat-components/TextInputArea";

const suggestionChips = [
  {
    text: "Explain current certification campaign status",
    icon: ShieldQuestion,
  },
  {
    text: "Generate a provisioning report for the last quarter",
    icon: FileText,
  },
  {
    text: "Show me all inactive users with high-risk access",
    icon: AlertCircle,
  },
  { text: "Configure a new application connector", icon: Sparkles },
];

const ChatInterface = () => {
  const router = useRouter();
  const {
    messages,
    addMessage,
    currentFeature,
    setCurrentFeature,
    availableFeatures,
  } = useAIAssistant();

  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [showQuickActions, setShowQuickActions] = React.useState(false);
  const scrollAreaViewportRef = React.useRef<HTMLDivElement>(null);
  const [isChatMode, setIsChatMode] = React.useState(true);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTop =
        scrollAreaViewportRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const lastProcessedUserMessageId = React.useRef<string | number | null>(null);

  // Auto-trigger AI response when user message is added
  React.useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage?.role === "user" &&
      !isTyping &&
      lastMessage.id !== lastProcessedUserMessageId.current
    ) {
      handleAIResponse(lastMessage.content);
      lastProcessedUserMessageId.current = lastMessage.id;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleAIResponse = async (userMessage: string) => {
    setIsTyping(true);

    // Simulate API call with mock response
    setTimeout(() => {
      const mockResponse = generateMockAIResponse({
        isAnalysis: currentFeature === "Debugging Assistant",
        query: userMessage,
      });

      addMessage(mockResponse, "assistant");
      setIsTyping(false);
    }, 1500);
  };

  const handleSendMessage = (text: string, isChat: boolean) => {
    if (!text.trim() || isTyping) return;
    setIsChatMode(isChat);
    // Add user message - this will trigger the AI response via useEffect
    addMessage(text, "user");
    setInput("");
  };

  const renderAnalysisActions = () => {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="text-xs">
          <Monitor className="h-3 w-3 mr-1" />
          View in Monitoring
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <Download className="h-3 w-3 mr-1" />
          Export Log
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <PlayCircle className="h-3 w-3 mr-1" />
          Simulate Fix
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-3 border-b flex items-center gap-3 bg-muted/30">
        <div className="flex items-center gap-2 flex-1">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Feature:</span>
          <Select value={currentFeature} onValueChange={setCurrentFeature}>
            <SelectTrigger className="h-8 w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableFeatures.map((feature) => (
                <SelectItem key={feature} value={feature}>
                  {feature}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/ai-chat")}
            className="text-xs"
          >
            <Maximize className="h-3 w-3 mr-1" />
            Full Screen
          </Button>
        </div>
        {/* <Badge variant="outline" className="text-xs">
          {messages.length - 1} messages
        </Badge> */}
      </div>

      <ScrollArea className="flex-1 p-4" viewportRef={scrollAreaViewportRef}>
        <div className="space-y-6 pb-18">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3",
                message.role === "user" && "flex-row-reverse"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className={cn(
                    message.role === "assistant" &&
                      "bg-primary text-primary-foreground"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 max-w-sm">
                <div
                  className={cn(
                    "rounded-lg p-3 text-sm shadow-sm",
                    message.role === "assistant"
                      ? "bg-muted"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {currentFeature === "Debugging Assistant" &&
                    message.role === "user" &&
                    !isChatMode && (
                      <Badge variant="secondary" className="mb-2 text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Analysis {`for "${currentFeature}"`}
                      </Badge>
                    )}

                  {message.role === "assistant" &&
                  currentFeature === "Debugging Assistant" &&
                  !message.id.startsWith("initial") ? (
                    <StructuredAIResponse
                      content={message.content}
                      isAnalysis={true}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
                {message.role === "assistant" &&
                  currentFeature === "Debugging Assistant" &&
                  !message.id.startsWith("initial") &&
                  renderAnalysisActions()}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Sparkles className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg p-3 bg-muted">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full bg-slate-400 animate-pulse"
                    style={{ animationDelay: "0s" }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-slate-400 animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-slate-400 animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 space-y-3 flex-shrink-0 border-t sticky bottom-0 bg-background z-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="text-xs"
          >
            {showQuickActions ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Hide Suggestions
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show Suggestions
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/ai-chat")}
            className="text-xs"
          >
            <History className="h-3 w-3 mr-1" />
            Show History
          </Button>
          {showQuickActions && (
            <span className="text-xs text-muted-foreground">
              {suggestionChips.length} quick actions
            </span>
          )}
        </div>

        {showQuickActions && (
          <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
            {suggestionChips.map((chip, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  handleSendMessage(chip.text, false);
                  setShowQuickActions(false);
                }}
                className="text-xs"
              >
                <chip.icon className="h-3 w-3 mr-1" />
                {chip.text}
              </Button>
            ))}
          </div>
        )}

        <TextInputArea
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
          isTyping={isTyping}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
