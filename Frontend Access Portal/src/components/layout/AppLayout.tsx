"use client";
import Header from "./Header";
import Sidebar from "./Sidebar";
import {
  AIAssistantButton,
  AIAssistantPanel,
} from "@/components/ai/AIAssistant";
import { useAIAssistant } from "@/contexts/AIAssistantContext";
import { GlobalSearchDialog } from "@/components/search/GlobalSearch";
import { WorkflowNotificationCenter } from "@/components/workflows/WorkflowNotificationCenter";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAssistantOpen } = useAIAssistant();

  return (
    <div className="h-full w-full flex flex-col bg-white font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
        {isAssistantOpen && (
          <div className="w-[40vw] min-w-[500px] max-w-[800px] border-l border-slate-200 bg-white flex-shrink-0 flex flex-col overflow-hidden">
            <AIAssistantPanel />
          </div>
        )}
      </div>
      <AIAssistantButton />
      <GlobalSearchDialog />
      
      {/* Workflow Approval Notifications - Fixed position bottom-right */}
      <div className="fixed bottom-4 right-4 z-50 max-w-md max-h-[80vh] overflow-y-auto">
        <WorkflowNotificationCenter />
      </div>
    </div>
  );
}
