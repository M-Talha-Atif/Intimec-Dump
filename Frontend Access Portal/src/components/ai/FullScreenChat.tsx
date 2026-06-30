import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  User,
  Sparkles,
  Zap,
  X,
  MessageSquare,
  Sidebar,
  SidebarClose,
  ShieldQuestion,
  FileText,
  AlertCircle,
} from "lucide-react";
import { StructuredAIResponse } from "@/components/ai/StructuredAIResponse";
import { generateMockAIResponse } from "@/utils/mockAIResponses";
import { useAIAssistant } from "@/contexts/AIAssistantContext";
import { TextInputArea } from "./chat-components/TextInputArea";
import { QuickActions } from "./chat-components/QuickActions";

interface Message {
  id: string | number;
  role: "user" | "assistant";
  content: string;
  feature?: string;
}

interface HistoryChat {
  id: string;
  title: string;
  timestamp: string;
  feature: string;
  messages: Message[];
}

const mockHistoryChats: HistoryChat[] = [
  {
    id: "history-1",
    title: "Debugging Session - User Access Issues",
    timestamp: "2025-10-26T10:30:00Z",
    feature: "Debugging Assistant",
    messages: [
      {
        id: "h1-1",
        role: "user",
        content: "Why is user John unable to access the application?",
      },
      {
        id: "h1-2",
        role: "assistant",
        content:
          "Based on the logs, John has been removed from the active user group. Please check the group membership.",
      },
    ],
  },
  {
    id: "history-2",
    title: "Audit Log Analysis - Suspicious Activity",
    timestamp: "2025-10-25T14:15:00Z",
    feature: "Audit Log Analyzer",
    messages: [
      {
        id: "h2-1",
        role: "user",
        content: "Analyze this suspicious login attempt.",
      },
      {
        id: "h2-2",
        role: "assistant",
        content:
          "The login attempt came from an unrecognized IP address. Recommend enabling MFA and reviewing access policies.",
      },
    ],
  },
  {
    id: "history-3",
    title: "Role Configuration Help",
    timestamp: "2025-10-24T09:45:00Z",
    feature: "Role AI Assistant",
    messages: [
      {
        id: "h3-1",
        role: "user",
        content: "How to create a new role for contractors?",
      },
      {
        id: "h3-2",
        role: "assistant",
        content:
          "Create a new role with limited permissions, assign it to the contractor group, and set up approval workflows.",
      },
    ],
  },
];

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

interface FullScreenChatProps {
  onClose: () => void;
}

const FullScreenChat: React.FC<FullScreenChatProps> = ({ onClose }) => {
  const { messages, currentFeature, setCurrentFeature, availableFeatures } =
    useAIAssistant();

  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [selectedChat, setSelectedChat] = React.useState<HistoryChat | null>(
    null
  );
  const [currentMessages, setCurrentMessages] =
    React.useState<Message[]>(messages);
  const [showSidebar, setShowSidebar] = React.useState(true);
  const [showQuickActions, setShowQuickActions] = React.useState(false);
  const scrollAreaViewportRef = React.useRef<HTMLDivElement>(null);

  const lastProcessedUserMessageId = React.useRef<string | number | null>(null);

  const handleAIResponse = React.useCallback(
    async (userMessage: string) => {
      setIsTyping(true);

      setTimeout(() => {
        const mockResponse = generateMockAIResponse({
          isAnalysis: currentFeature === "Debugging Assistant",
          query: userMessage,
        });

        const newMessage: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content: mockResponse,
        };
        setCurrentMessages((prev) => [...prev, newMessage]);
        setIsTyping(false);
      }, 1500);
    },
    [currentFeature]
  );

  React.useEffect(() => {
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTop =
        scrollAreaViewportRef.current.scrollHeight;
    }
  }, [currentMessages, isTyping]);

  React.useEffect(() => {
    const lastMessage = currentMessages[currentMessages.length - 1];

    if (
      lastMessage?.role === "user" &&
      !isTyping &&
      lastMessage.id !== lastProcessedUserMessageId.current
    ) {
      handleAIResponse(lastMessage.content);
      lastProcessedUserMessageId.current = lastMessage.id;
    }
  }, [currentMessages, handleAIResponse, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;

    const newUserMessage: Message = {
      id: Date.now(),
      role: "user",
      content: text,
    };
    setCurrentMessages((prev) => [...prev, newUserMessage]);
    setInput("");
  };

  const handleHistorySelect = (chat: HistoryChat) => {
    setSelectedChat(chat);
    setCurrentMessages(chat.messages);
    setCurrentFeature(chat.feature);
  };

  const handleNewChat = () => {
    setSelectedChat(null);
    setCurrentMessages([]);
    setCurrentFeature("AI Assistant (Global)");
  };

  return (
    <div className="fixed inset-0 flex bg-background z-50">
      {showSidebar && (
        <div className="w-80 border-r bg-background/95 backdrop-blur-sm flex flex-col shadow-lg">
          <div className="p-4 border-b bg-muted/30 backdrop-blur supports-[backdrop-filter]:bg-muted/20">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Chat History</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
              >
                <SidebarClose className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={handleNewChat}
              className="w-full mt-3"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2 pb-4">
              {mockHistoryChats.map((chat) => (
                <Button
                  key={chat.id}
                  variant={selectedChat?.id === chat.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-auto p-3 hover:bg-muted/50 transition-colors rounded-lg"
                  onClick={() => handleHistorySelect(chat)}
                >
                  <div className="flex flex-col items-start w-full">
                    <span className="text-sm font-medium truncate w-full text-left leading-tight">
                      {chat.title}
                    </span>
                    <div className="flex items-center justify-between w-full mt-1.5">
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                        {chat.feature}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(chat.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 p-4 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            {!showSidebar && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSidebar(true)}
              >
                <Sidebar className="h-4 w-4 mr-2" />
                History
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Feature:</span>
              <Select value={currentFeature} onValueChange={setCurrentFeature}>
                <SelectTrigger className="h-8 w-[200px]">
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
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Separator />

        <div className="flex-1 overflow-hidden">
          <ScrollArea
            className="h-full p-6 bg-muted/20"
            viewportRef={scrollAreaViewportRef}
          >
            <div className="space-y-6 max-w-4xl mx-auto pb-6">
              {currentMessages.length === 0 && !selectedChat && (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Start a new conversation
                  </h3>
                  <p className="text-muted-foreground">
                    Ask me anything about your system or select a previous chat
                    from the sidebar.
                  </p>
                </div>
              )}
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-4 group",
                    message.role === "user" && "flex-row-reverse"
                  )}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback
                      className={cn(
                        message.role === "assistant" &&
                          "bg-primary text-primary-foreground"
                      )}
                    >
                      {message.role === "user" ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 max-w-2xl">
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm shadow-sm",
                        message.role === "assistant"
                          ? "bg-background border"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      {message.role === "assistant" &&
                      currentFeature === "Debugging Assistant" &&
                      !message.id.toString().startsWith("initial") ? (
                        <StructuredAIResponse
                          content={message.content}
                          isAnalysis={true}
                        />
                      ) : (
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl px-4 py-3 bg-background border">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
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
        </div>

        <Separator />

        <div className="flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {showQuickActions ? "Hide Suggestions" : "Show Suggestions"}
              </Button>
            </div>
            {showQuickActions && (
              <QuickActions
                handleSendMessage={handleSendMessage}
                suggestionChips={suggestionChips}
              />
            )}
            <TextInputArea
              input={input}
              setInput={setInput}
              handleSendMessage={handleSendMessage}
              isTyping={isTyping}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenChat;
