
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, ChevronDown, Play, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TaskSchedule, TaskContext, TIMEZONES, formatNextRun } from '@/types/scheduling';

interface TaskSchedulerProps {
  taskType: 'data-import' | 'ai-analysis';
  taskName: string;
  context: TaskContext;
  onSchedule: (schedule: TaskSchedule) => void;
  onManualRun?: () => void;
  disabled?: boolean;
  className?: string;
}

export const TaskScheduler: React.FC<TaskSchedulerProps> = ({
  taskType,
  taskName,
  context,
  onSchedule,
  onManualRun,
  disabled = false,
  className
}) => {
  const [isSchedulingEnabled, setIsSchedulingEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [schedule, setSchedule] = useState<TaskSchedule>({
    frequency: 'one-time',
    time: '09:00',
    timezone: 'UTC',
    runImmediately: false
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const handleScheduleChange = (key: keyof TaskSchedule, value: any) => {
    const newSchedule = { ...schedule, [key]: value };
    setSchedule(newSchedule);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (schedule.frequency === 'one-time') {
      setSelectedDate(date);
      handleScheduleChange('date', format(date, 'yyyy-MM-dd'));
    }
  };

  const handleSubmit = () => {
    const finalSchedule: TaskSchedule = {
      ...schedule,
      date: schedule.frequency === 'one-time' && selectedDate 
        ? format(selectedDate, 'yyyy-MM-dd') 
        : undefined,
      dates: selectedDates.length > 0 
        ? selectedDates.map(d => format(d, 'yyyy-MM-dd'))
        : undefined
    };
    
    onSchedule(finalSchedule);
    setIsSchedulingEnabled(false);
    setIsOpen(false);
  };

  const canSchedule = () => {
    if (taskType === 'data-import' && !context.identityType) {
      return false;
    }
    if (schedule.frequency === 'one-time' && !selectedDate) {
      return false;
    }
    return true;
  };

  const getValidationMessage = () => {
    if (taskType === 'data-import' && !context.identityType) {
      return 'Please select an Identity Type before scheduling';
    }
    if (schedule.frequency === 'one-time' && !selectedDate) {
      return 'Please select a date for one-time scheduling';
    }
    return null;
  };

  const handleSchedulingEnabledChange = (checked: boolean | "indeterminate") => {
    setIsSchedulingEnabled(checked === true);
  };

  const handleRunImmediatelyChange = (checked: boolean | "indeterminate") => {
    handleScheduleChange('runImmediately', checked === true);
  };

  return (
    <Card className={cn("border-l-4 border-l-blue-500", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="schedule-task"
              checked={isSchedulingEnabled}
              onCheckedChange={handleSchedulingEnabledChange}
              disabled={disabled}
            />
            <Label htmlFor="schedule-task" className="flex items-center space-x-2 font-medium">
              <CalendarIcon className="h-4 w-4" />
              <span>📅 Schedule Task</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            {onManualRun && (
              <Button variant="outline" size="sm" onClick={onManualRun}>
                <Play className="h-4 w-4 mr-2" />
                Run Now
              </Button>
            )}
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 mr-2" />
              Task History
            </Button>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isSchedulingEnabled && isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent className="pt-0 animate-fade-in">
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Schedule Configuration</h4>
                <Badge variant="outline">{taskName}</Badge>
              </div>

              {/* Frequency Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Frequency</Label>
                  <Select 
                    value={schedule.frequency} 
                    onValueChange={(value: any) => handleScheduleChange('frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One-time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="custom">Custom (Cron)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Time</Label>
                  <Input
                    type="time"
                    value={schedule.time}
                    onChange={(e) => handleScheduleChange('time', e.target.value)}
                  />
                </div>
              </div>

              {/* Date Selection for One-time */}
              {schedule.frequency === 'one-time' && (
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Custom Cron Expression */}
              {schedule.frequency === 'custom' && (
                <div>
                  <Label className="text-sm font-medium">Cron Expression</Label>
                  <Input
                    placeholder="0 0 * * *"
                    value={schedule.cronExpression || ''}
                    onChange={(e) => handleScheduleChange('cronExpression', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Example: "0 9 * * 1" runs every Monday at 9:00 AM
                  </p>
                </div>
              )}

              {/* Timezone Selection */}
              <div>
                <Label className="text-sm font-medium">Timezone</Label>
                <Select 
                  value={schedule.timezone} 
                  onValueChange={(value) => handleScheduleChange('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Run Immediately Option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="run-immediately"
                  checked={schedule.runImmediately}
                  onCheckedChange={handleRunImmediatelyChange}
                />
                <Label htmlFor="run-immediately" className="text-sm">
                  Run immediately after saving
                </Label>
              </div>

              {/* Next Run Preview */}
              {canSchedule() && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Next run: {formatNextRun(schedule)}
                    </span>
                  </div>
                </div>
              )}

              {/* Validation Message */}
              {getValidationMessage() && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">{getValidationMessage()}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsSchedulingEnabled(false);
                    setIsOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!canSchedule()}
                >
                  Schedule Task
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Auto-expand when scheduling is enabled */}
      {isSchedulingEnabled && !isOpen && (
        <div className="px-6 pb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOpen(true)}
            className="w-full"
          >
            <ChevronDown className="h-4 w-4 mr-2" />
            Configure Schedule
          </Button>
        </div>
      )}
    </Card>
  );
};
