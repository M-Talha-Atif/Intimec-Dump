"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGlobalSchedule } from "@/hooks/useGlobalSchedule";
import { getTimezones } from "@/components/applications/tasks/timezones";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Save,
  Info,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronsUpDown,
  Check,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===================================================================
//  Cron presets
// ===================================================================

const CRON_PRESETS = [
  { label: "Every minute", value: "0 * * * * *" },
  { label: "Every 5 minutes", value: "0 */5 * * * *" },
  { label: "Every 15 minutes", value: "0 */15 * * * *" },
  { label: "Every 30 minutes", value: "0 */30 * * * *" },
  { label: "Every hour", value: "0 0 * * * *" },
  { label: "Every 6 hours", value: "0 0 */6 * * *" },
  { label: "Every 12 hours", value: "0 0 */12 * * *" },
  { label: "Daily at midnight", value: "0 0 0 * * *" },
  { label: "Daily at 2 AM", value: "0 0 2 * * *" },
  { label: "Daily at 6 AM", value: "0 0 6 * * *" },
  { label: "Weekly (Sunday midnight)", value: "0 0 0 * * SUN" },
  { label: "Monthly (1st at midnight)", value: "0 0 0 1 * *" },
  { label: "Custom", value: "custom" },
];

// ===================================================================
//  Helpers
// ===================================================================

const formatTimestamp = (epoch: number | null): string => {
  if (!epoch) return "";
  return new Date(epoch).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ===================================================================
//  Props
// ===================================================================

interface ScheduleConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ===================================================================
//  Component
// ===================================================================

const ScheduleConfigDialog: React.FC<ScheduleConfigDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const {
    currentConfig,
    loading,
    saving,
    error,
    success,
    updateSchedule,
    clearState,
  } = useGlobalSchedule();

  const [cronExpression, setCronExpression] = useState("0 0 0 * * *");
  const [customCron, setCustomCron] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [tzPopoverOpen, setTzPopoverOpen] = useState(false);
  const [preloaded, setPreloaded] = useState(false);

  // Load all IANA timezones with UTC offset labels, sorted by offset
  const allTimezones = useMemo(() => getTimezones(), []);

  // Find the selected timezone's display label
  const selectedTzLabel = useMemo(() => {
    const found = allTimezones.find((tz) => tz.id === timezone);
    return found?.label ?? timezone;
  }, [allTimezones, timezone]);

  // Preload saved config into form fields when data arrives
  useEffect(() => {
    if (currentConfig && !preloaded) {
      const savedCron = currentConfig.cronExpression || "";
      const savedTz = currentConfig.scheduleTimezone || "UTC";

      // Check if the saved cron matches a preset
      const matchingPreset = CRON_PRESETS.find(
        (p) => p.value !== "custom" && p.value === savedCron
      );

      if (matchingPreset) {
        setCronExpression(matchingPreset.value);
        setCustomCron("");
      } else if (savedCron) {
        setCronExpression("custom");
        setCustomCron(savedCron);
      }

      setTimezone(savedTz);
      setPreloaded(true);
    }
  }, [currentConfig, preloaded]);

  // Reset preloaded flag and clear state when dialog opens
  useEffect(() => {
    if (open) {
      setPreloaded(false);
      clearState();
    }
  }, [open, clearState]);

  const resolvedCron =
    cronExpression === "custom" ? customCron : cronExpression;

  const isValid = resolvedCron.trim().length > 0 && timezone.length > 0;

  const handleSave = async () => {
    if (!isValid) return;

    try {
      await updateSchedule({
        scheduleType: "CRON",
        cronExpression: resolvedCron.trim(),
        scheduleTimezone: timezone,
      });
      setTimeout(() => {
        onOpenChange(false);
      }, 1200);
    } catch {
      // Error is set in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <Clock className="h-5 w-5 text-muted-foreground" /> */}
            Configure Schedule
          </DialogTitle>
          <DialogDescription>
            Set the global cron schedule for automatic rule evaluation across
            all entitlements. All enabled CRON rules will use this
            configuration.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground">
              Loading current schedule...
            </span>
          </div>
        ) : (
          <TooltipProvider>
            <div className="space-y-5 mt-2">
              {/* Current config indicator */}
                            {currentConfig?.cronExpression && (
                <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="text-xs text-primary">
                    <p>
                      Current schedule:{" "}
                      <span className="font-mono font-medium">
                        {currentConfig.cronExpression}
                      </span>{" "}
                      in{" "}
                      <span className="font-medium">
                        {currentConfig.scheduleTimezone || "UTC"}
                      </span>
                    </p>
                    {currentConfig.updatedAt && (
                      <p className="text-primary/70 mt-0.5">
                        Last updated: {formatTimestamp(currentConfig.updatedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Cron Expression */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="cron-preset">Cron Expression</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-xs">
                        Defines how often assignment rules are automatically
                        evaluated. Uses Spring cron format (6 fields: second
                        minute hour day month weekday). Select a preset or
                        choose &quot;Custom&quot; to enter your own expression.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Select
                  value={
                    CRON_PRESETS.find((p) => p.value === cronExpression)
                      ? cronExpression
                      : "custom"
                  }
                  onValueChange={(val) => {
                    setCronExpression(val);
                    if (val !== "custom") setCustomCron("");
                  }}
                >
                  <SelectTrigger id="cron-preset" className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CRON_PRESETS.map((preset) => (
                      <Tooltip key={preset.value}>
                        <TooltipTrigger asChild>
                          <SelectItem value={preset.value}>
                            {preset.label}
                          </SelectItem>
                        </TooltipTrigger>
                        {preset.value !== "custom" && (
                          <TooltipContent side="left" className="max-w-xs">
                            <p className="text-xs font-mono">
                              {preset.value}
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    ))}
                  </SelectContent>
                </Select>

                {/* Custom cron input */}
                {cronExpression === "custom" && (
                  <div className="space-y-1.5">
                    <Input
                      placeholder="0 0 */6 * * *"
                      value={customCron}
                      onChange={(e) => setCustomCron(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Format: second minute hour day-of-month month
                      day-of-week
                    </p>
                  </div>
                )}

                {/* Show resolved cron */}
                {resolvedCron && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs cursor-help"
                        >
                          {resolvedCron}
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-xs">
                        This is the cron expression that will be applied to
                        all enabled assignment rules.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* Timezone with searchable combobox */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Timezone</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-xs">
                        The timezone used to interpret the cron expression.
                        Affects when scheduled evaluations run relative to
                        local time. Search by city name, region, or UTC
                        offset.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Popover
                  open={tzPopoverOpen}
                  onOpenChange={setTzPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={tzPopoverOpen}
                      className="w-full justify-between font-normal"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{selectedTzLabel}</span>
                      </span>
                      <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search timezone..." />
                      <CommandList className="max-h-60">
                        <CommandEmpty>No timezone found.</CommandEmpty>
                        <CommandGroup>
                          {allTimezones.map((tz) => (
                            <CommandItem
                              key={tz.id}
                              value={tz.label}
                              onSelect={() => {
                                setTimezone(tz.id);
                                setTzPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-3.5 w-3.5 shrink-0",
                                  timezone === tz.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <span className="truncate text-sm">
                                {tz.label}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-100 dark:bg-red-900/20 p-3">
                  <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="flex items-start gap-2 rounded-lg border border-green-200 dark:border-green-800 bg-green-100 dark:bg-green-900/20 p-3">
                  <CheckCircle className="h-4 w-4 text-green-700 dark:text-green-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-700 dark:text-green-400">
                    Schedule updated successfully.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving || !isValid}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Schedule
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TooltipProvider>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleConfigDialog;