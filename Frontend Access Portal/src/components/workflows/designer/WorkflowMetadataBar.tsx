"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Zap, Clock, Hand, Settings as SettingsIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WorkflowMetadataBarProps {
  triggerType: 'manual' | 'event-based' | 'time-based';
  cronSchedule?: string;
  eventConfig?: {
    services: string[];
    eventTypes: string[];
  };
  onTriggerTypeChange: (type: 'manual' | 'event-based' | 'time-based') => void;
  onCronScheduleChange?: (schedule: string) => void;
  onConfigureEvents?: () => void;
}

export const WorkflowMetadataBar: React.FC<WorkflowMetadataBarProps> = ({
  triggerType,
  cronSchedule,
  eventConfig,
  onTriggerTypeChange,
  onCronScheduleChange,
  onConfigureEvents
}) => {
  const getTriggerIcon = () => {
    switch (triggerType) {
      case 'manual': return Hand;
      case 'event-based': return Zap;
      case 'time-based': return Clock;
    }
  };

  const TriggerIcon = getTriggerIcon();

  return (
    <div className="px-4 py-2.5 flex items-center gap-4">
      {/* Trigger Type */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Trigger:</span>
        <Select value={triggerType} onValueChange={(value: any) => onTriggerTypeChange(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">
              <div className="flex items-center gap-2">
                <Hand className="h-4 w-4" />
                Manual
              </div>
            </SelectItem>
            <SelectItem value="event-based">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Event-Based
              </div>
            </SelectItem>
            <SelectItem value="time-based">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Scheduled
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conditional: Event Configuration Button */}
      {triggerType === 'event-based' && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline" size="sm" onClick={onConfigureEvents}>
            <Zap className="h-4 w-4 mr-2" />
            Configure Events
            {eventConfig && eventConfig.eventTypes.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {eventConfig.eventTypes.length}
              </Badge>
            )}
          </Button>
          {eventConfig && eventConfig.services.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {eventConfig.services.map((service) => (
                <Badge key={service} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          )}
        </>
      )}

      {/* Conditional: Cron Schedule for time-based */}
      {triggerType === 'time-based' && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Schedule:</span>
            <Input
              placeholder="0 2 * * * (Daily at 2 AM)"
              value={cronSchedule || ''}
              onChange={(e) => onCronScheduleChange?.(e.target.value)}
              className="w-[220px] text-sm"
            />
          </div>
        </>
      )}

      <div className="ml-auto text-sm text-muted-foreground">
        💡 Workflow name and details will be set when you click Save
      </div>
    </div>
  );
};
