"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Zap, Clock, Hand, ArrowRight } from 'lucide-react';

interface QuickStartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (triggerType: 'manual' | 'event-based' | 'time-based') => void;
}

export const QuickStartDialog: React.FC<QuickStartDialogProps> = ({
  open,
  onOpenChange,
  onStart
}) => {
  const [triggerType, setTriggerType] = useState<'manual' | 'event-based' | 'time-based'>('manual');

  const handleStart = () => {
    onStart(triggerType);
    setTriggerType('manual');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>How should this workflow start?</DialogTitle>
          <DialogDescription>
            Choose the trigger type. You'll configure the workflow name and details when saving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Trigger Type */}
          <div className="space-y-3">
            <RadioGroup value={triggerType} onValueChange={(value: any) => setTriggerType(value)}>
              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="manual" id="trigger-manual" />
                <label htmlFor="trigger-manual" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 font-medium">
                    <Hand className="h-4 w-4" />
                    Manual Trigger
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    User manually initiates the workflow by clicking "Run"
                  </p>
                </label>
              </div>

              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="event-based" id="trigger-event" />
                <label htmlFor="trigger-event" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 font-medium">
                    <Zap className="h-4 w-4" />
                    Event-Based
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Automatically triggered by system events (user created, role changed)
                  </p>
                </label>
              </div>

              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="time-based" id="trigger-scheduled" />
                <label htmlFor="trigger-scheduled" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="h-4 w-4" />
                    Scheduled
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Runs on a schedule (daily, weekly, monthly)
                  </p>
                </label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleStart}>
            Start Designing
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
