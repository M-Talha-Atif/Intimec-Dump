"use client";

import React, { useState } from "react";
import { ChevronDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UserStatus } from "@/types/user";
import {
  getValidTransitions,
  TRANSITION_LABELS,
  DESTRUCTIVE_TRANSITIONS,
  isTerminalStatus,
} from "@/lib/identity-lifecycle";

const STATUS_STYLES: Record<UserStatus, string> = {
  Active:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",

  Inactive:
    "bg-muted text-muted-foreground border-border",

  Suspended:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",

  Pending:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",

  Terminated:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-400",

  Expired:
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400",

  Archived:
    "bg-muted text-muted-foreground border-border",
};

type StatusTransitionDropdownProps = {
  currentStatus: UserStatus;
  onTransition: (newStatus: UserStatus) => Promise<void>;
  disabled?: boolean;
};

export default function StatusTransitionDropdown({
  currentStatus,
  onTransition,
  disabled = false,
}: StatusTransitionDropdownProps) {
  const [confirmTarget, setConfirmTarget] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const validTargets = getValidTransitions(currentStatus);
  const terminal = isTerminalStatus(currentStatus);

  const handleTransition = async (target: UserStatus) => {
    if (DESTRUCTIVE_TRANSITIONS.includes(target)) {
      setConfirmTarget(target);
      return;
    }
    await executeTransition(target);
  };

  const executeTransition = async (target: UserStatus) => {
    setLoading(true);
    try {
      await onTransition(target);
    } finally {
      setLoading(false);
      setConfirmTarget(null);
    }
  };

  if (terminal || validTargets.length === 0) {
    return (
      <Badge className={cn("text-xs font-normal", STATUS_COLORS[currentStatus])}>
        {currentStatus}
      </Badge>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 px-2 text-xs font-normal gap-1 capitalize ${STATUS_STYLES[currentStatus] || STATUS_STYLES.Inactive
              }`}
            disabled={disabled || loading}
          >
            {currentStatus}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-48">
          <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
            Transition to:
          </div>

          <DropdownMenuSeparator />

          {validTargets.map((target) => {
            const isDestructive = DESTRUCTIVE_TRANSITIONS.includes(target);

            return (
              <DropdownMenuItem
                key={target}
                onClick={() => handleTransition(target)}
                className={`cursor-pointer ${isDestructive ? "text-red-600 focus:text-red-600" : ""
                  }`}
              >
                <Badge
                  variant="outline"
                  className={`px-2 py-0.5 text-xs font-normal mr-2 capitalize ${STATUS_STYLES[target] || STATUS_STYLES.Inactive
                    }`}
                >
                  {target}
                </Badge>

                {TRANSITION_LABELS[target] ?? target}

                {isDestructive && (
                  <AlertTriangle className="ml-auto h-3.5 w-3.5 text-red-500" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation dialog for destructive transitions */}
      <AlertDialog
        open={confirmTarget !== null}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm Status Transition
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to transition this identity from{" "}
              <strong>{currentStatus}</strong> to{" "}
              <strong>{confirmTarget}</strong>.
              {confirmTarget === "Terminated" &&
                " This will revoke all access and begin the offboarding process."}
              {confirmTarget === "Archived" &&
                " This is a permanent action. Archived identities cannot be reactivated."}
              {confirmTarget === "Expired" &&
                " Expired identities must go through re-onboarding to be reactivated."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmTarget && executeTransition(confirmTarget)}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Processing..." : `Confirm ${TRANSITION_LABELS[confirmTarget!] ?? confirmTarget}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
