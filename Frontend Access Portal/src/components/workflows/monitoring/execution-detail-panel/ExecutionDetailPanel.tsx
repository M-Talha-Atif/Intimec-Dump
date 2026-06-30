import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { PanelHeader } from "./components";
import { ActionButtons } from "./components";
import { TabsContent } from "./components";

export interface ExecutionStep {
  id: string;
  executionId?: string;
  name: string;
  type: 'trigger' | 'condition' | 'approval' | 'action' | 'notification' | 'control';
  status: 'passed' | 'failed' | 'skipped' | 'retried' | 'running' | 'pending';
  startTime: string;
  endTime?: string;
  duration: number;
  inputParameters?: Record<string, any>;
  outputResult?: Record<string, any>;
  errorMessage?: string;
  retryCount: number;
  assignedActor?: string;
  logs?: string[];
  loopStartNode?: string;
  loopIndex?: number;
  totalItems?: number;
  isLoopIteration?: boolean;
}

export interface ExecutionRecord {
  id: string;
  workflowName: string;
  workflowId: string;
  identityName: string;
  status: 'completed' | 'failed' | 'running' | 'cancelled' | 'paused';
  startTime: string;
  endTime?: string;
  duration: number;
  stepsCompleted: number;
  totalSteps: number;
  errorMessage?: string;
  triggeredBy: string;
  triggerSource: string;
  executedBy: string;
  slaExpected: number;
  slaActual: number;
  steps: ExecutionStep[];
  auditTrail: Array<{
    id: string;
    action: string;
    actor: string;
    role: string;
    timestamp: string;
    details: string;
  }>;
}

// ── Same props as the original — no breaking changes ──────────────────────
type ExecutionDetailPanelProps = {
  open: boolean;           // NEW: controls Sheet visibility
  execution: ExecutionRecord | null;
  onClose: () => void;
  onRetry?: (executionId: string) => void;
  onCancel?: (executionId: string) => void;
};

export function ExecutionDetailPanel({
  open,
  execution,
  onClose,
  onRetry,
  onCancel,
}: ExecutionDetailPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl flex flex-col p-0 h-full"
      >
        {execution ? (
          <div className="flex flex-col h-full min-w-0">

            {/* Fixed Header */}
            <div className="flex-shrink-0">
              <PanelHeader execution={execution} onClose={onClose} />
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0">
              <ActionButtons
                execution={execution}
                onRetry={onRetry}
                onCancel={onCancel}
              />
            </div>

            {/* Scrollable Tab Content */}
              <TabsContent
                execution={execution}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}