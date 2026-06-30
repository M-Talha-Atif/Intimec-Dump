
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Play, Repeat, Settings, Bell } from 'lucide-react';
import { GlobalImportState } from '../GlobalImportModal';
import { TIMEZONES } from '@/types/scheduling';
import { NextRunPreview } from '@/components/scheduling/NextRunPreview';
import { AdvancedSchedulingOptions, AdvancedSchedulingConfig } from '@/components/scheduling/AdvancedSchedulingOptions';

interface SchedulingTabProps {
  state: GlobalImportState;
  updateState: (updates: Partial<GlobalImportState>) => void;
}

export function SchedulingTab({ state, updateState }: SchedulingTabProps) {
  const [frequency, setFrequency] = useState<string>('one-time');
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [scheduleTime, setScheduleTime] = useState<string>('09:00');
  const [timezone, setTimezone] = useState<string>('UTC');
  const [cronExpression, setCronExpression] = useState<string>('');
  const [runImmediately, setRunImmediately] = useState<boolean>(false);
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedSchedulingConfig>({
    executionMode: 'parallel',
    maxRuntimePerApp: 120,
    blackoutDates: []
  });

  const handleRunModeChange = (runNow: boolean) => {
    updateState({
      scheduling: {
        ...state.scheduling,
        runNow
      }
    });
  };

  const handleScheduleUpdate = () => {
    if (state.scheduling.runNow) return;

    const schedule = {
      frequency: frequency as any,
      time: scheduleTime,
      timezone,
      date: frequency === 'one-time' ? scheduleDate : undefined,
      cronExpression: frequency === 'custom' ? cronExpression : undefined,
      runImmediately,
      advancedOptions
    };

    updateState({
      scheduling: {
        runNow: false,
        schedule
      }
    });
  };

  // Update schedule whenever form values change
  React.useEffect(() => {
    if (!state.scheduling.runNow) {
      handleScheduleUpdate();
    }
  }, [frequency, scheduleDate, scheduleTime, timezone, cronExpression, runImmediately, advancedOptions]);

  const getScheduleSummary = () => {
    if (state.scheduling.runNow) {
      return `${state.selectedApps.length} apps • Accounts+Entitlements • Run Now`;
    }

    if (!state.scheduling.schedule) {
      return 'No schedule configured';
    }

    const schedule = state.scheduling.schedule;
    let summary = `${state.selectedApps.length} apps • Accounts+Entitlements • `;

    switch (schedule.frequency) {
      case 'one-time':
        summary += `One-time on ${schedule.date} at ${schedule.time} ${schedule.timezone}`;
        break;
      case 'daily':
        summary += `Daily at ${schedule.time} ${schedule.timezone}`;
        break;
      case 'weekly':
        summary += `Weekly at ${schedule.time} ${schedule.timezone}`;
        break;
      case 'monthly':
        summary += `Monthly at ${schedule.time} ${schedule.timezone}`;
        break;
      case 'custom':
        summary += `Custom: ${schedule.cronExpression}`;
        break;
      default:
        summary += 'Not configured';
    }

    return summary;
  };

  return (
    <div className="space-y-6 h-full">
      {/* Run Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Execution Mode</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={state.scheduling.runNow ? 'now' : 'schedule'}
            onValueChange={(value) => handleRunModeChange(value === 'now')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="now" id="run-now" />
              <Label htmlFor="run-now" className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Run Now</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="schedule" id="schedule-task" />
              <Label htmlFor="schedule-task" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Schedule Task</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Schedule Configuration */}
      {!state.scheduling.runNow && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Repeat className="h-5 w-5" />
                  <span>Schedule Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom (CRON)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {frequency === 'one-time' && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Date</Label>
                    <Input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}

                {frequency === 'custom' && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">CRON Expression</Label>
                    <Input
                      placeholder="0 9 * * *"
                      value={cronExpression}
                      onChange={(e) => setCronExpression(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Advanced scheduling with CRON syntax
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium mb-2 block">Time</Label>
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map(tz => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {frequency === 'one-time' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="run-immediately"
                      checked={runImmediately}
                      onCheckedChange={(checked) => setRunImmediately(!!checked)}
                    />
                    <Label htmlFor="run-immediately" className="text-sm">
                      Run immediately after saving
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Advanced Options</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Concurrency Policy</Label>
                  <Select defaultValue="queue">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="queue">Queue if running</SelectItem>
                      <SelectItem value="skip">Skip if running</SelectItem>
                      <SelectItem value="cancel">Cancel running and start new</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    How to handle overlapping scheduled runs
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Retry Policy</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-gray-600">Max Attempts</Label>
                      <Input type="number" defaultValue="3" min="1" max="10" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Backoff (min)</Label>
                      <Input type="number" defaultValue="5" min="1" max="60" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium mb-2 block">Notifications</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-success" defaultChecked />
                      <Label htmlFor="notify-success" className="text-sm">
                        On successful completion
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-failure" defaultChecked />
                      <Label htmlFor="notify-failure" className="text-sm">
                        On failure
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-threshold" />
                      <Label htmlFor="notify-threshold" className="text-sm">
                        On threshold breach
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Run Preview - only show for custom CRON */}
          {frequency === 'custom' && cronExpression && (
            <NextRunPreview 
              cronExpression={cronExpression} 
              timezone={timezone} 
            />
          )}

          {/* Advanced Scheduling Options */}
          <AdvancedSchedulingOptions onOptionsChange={setAdvancedOptions} />
        </div>
      )}

      {/* Schedule Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="outline" className="text-sm px-3 py-1">
            {getScheduleSummary()}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
