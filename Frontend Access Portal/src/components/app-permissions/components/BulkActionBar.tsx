"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { X, Settings2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BulkActionBarProps {
  selectedCount: number;
  bulkMode: "assign" | "revoke" | "";
  onModeChange: (mode: "assign" | "revoke") => void;
  onConfigure: () => void;
  onCancel: () => void;
  className?: string;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  bulkMode,
  onModeChange,
  onConfigure,
  onCancel,
  className,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "bg-primary text-primary-foreground rounded-lg shadow-2xl",
        "px-6 py-4 flex items-center gap-4",
        "animate-in slide-in-from-bottom-5 duration-300",
        className
      )}
    >
      {/* Mode Display (Auto-detected, not toggleable) */}
      {bulkMode !== "" && (
        <>
          <div className="flex items-center gap-1 bg-primary-foreground/20 rounded-md p-1">
            <Button
              variant={bulkMode === "assign" ? "secondary" : "ghost"}
              size="sm"
              disabled
              className={cn(
                "h-8 text-xs cursor-default",
                bulkMode === "assign"
                  ? "bg-primary-foreground text-primary"
                  : "text-primary-foreground/50"
              )}
            >
              <Plus className="h-3 w-3 mr-1" />
              Bulk Assign
            </Button>
            <Button
              variant={bulkMode === "revoke" ? "secondary" : "ghost"}
              size="sm"
              disabled
              className={cn(
                "h-8 text-xs cursor-default",
                bulkMode === "revoke"
                  ? "bg-primary-foreground text-primary"
                  : "text-primary-foreground/50"
              )}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Bulk Revoke
            </Button>
          </div>

          <div className="h-8 w-px bg-primary-foreground/20" />
        </>
      )}

      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-foreground/20">
          <span className="text-sm font-bold">{selectedCount}</span>
        </div>
        <span className="font-medium">
          {selectedCount} permission{selectedCount !== 1 ? "s" : ""} selected
        </span>
      </div>

      <div className="h-8 w-px bg-primary-foreground/20" />

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onConfigure}
          className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          <Settings2 className="h-4 w-4 mr-2" />
          {bulkMode === "assign" ? "Bulk Configure" : "Bulk Revoke"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
};
