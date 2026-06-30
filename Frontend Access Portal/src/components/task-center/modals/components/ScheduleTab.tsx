import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScheduledTaskForm, frequencies, timezones } from '../data/scheduledTaskData';

interface ScheduleTabProps {
  formData: ScheduledTaskForm;
  updateFormData: (updates: Partial<ScheduledTaskForm>) => void;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label htmlFor="frequency">Frequency *</Label>
        <Select value={formData.frequency} onValueChange={(value) => updateFormData({ frequency: value })}>
          <SelectTrigger id="frequency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {frequencies.map(freq => (
              <SelectItem key={freq.value} value={freq.value}>
                {freq.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.frequency === 'one-time' && (
        <div>
          <Label htmlFor="schedule-date">Date *</Label>
          <Input
            id="schedule-date"
            type="date"
            value={formData.date}
            onChange={(e) => updateFormData({ date: e.target.value })}
          />
        </div>
      )}

      {formData.frequency === 'custom' && (
        <div>
          <Label htmlFor="cron-expression">Cron Expression *</Label>
          <Input
            id="cron-expression"
            value={formData.cronExpression}
            onChange={(e) => updateFormData({ cronExpression: e.target.value })}
            placeholder="e.g., 0 2 * * *"
          />
          <p className="text-sm text-muted-foreground mt-1">
            <a href="https://crontab.guru" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Use crontab.guru to build your expression
            </a>
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="schedule-time">Time *</Label>
        <Input
          id="schedule-time"
          type="time"
          value={formData.time}
          onChange={(e) => updateFormData({ time: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="timezone">Timezone *</Label>
        <Select value={formData.timezone} onValueChange={(value) => updateFormData({ timezone: value })}>
          <SelectTrigger id="timezone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timezones.map(tz => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="run-immediately"
          checked={formData.runImmediately}
          onCheckedChange={(checked) => updateFormData({ runImmediately: checked })}
        />
        <Label htmlFor="run-immediately" className="cursor-pointer">
          Run immediately after creation
        </Label>
      </div>
    </div>
  );
};
