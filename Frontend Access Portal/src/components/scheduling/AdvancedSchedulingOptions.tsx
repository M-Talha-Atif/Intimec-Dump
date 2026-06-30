
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Settings, Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AdvancedSchedulingOptionsProps {
  onOptionsChange: (options: AdvancedSchedulingConfig) => void;
}

export interface AdvancedSchedulingConfig {
  executionMode: 'parallel' | 'sequential';
  maxRuntimePerApp: number;
  blackoutDates: string[];
}

export const AdvancedSchedulingOptions: React.FC<AdvancedSchedulingOptionsProps> = ({
  onOptionsChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [executionMode, setExecutionMode] = useState<'parallel' | 'sequential'>('parallel');
  const [maxRuntime, setMaxRuntime] = useState(120);
  const [blackoutDates, setBlackoutDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();

  const handleOptionsChange = () => {
    const config: AdvancedSchedulingConfig = {
      executionMode,
      maxRuntimePerApp: maxRuntime,
      blackoutDates: blackoutDates.map(date => format(date, 'yyyy-MM-dd'))
    };
    onOptionsChange(config);
  };

  React.useEffect(() => {
    handleOptionsChange();
  }, [executionMode, maxRuntime, blackoutDates]);

  const addBlackoutDate = (date: Date | undefined) => {
    if (date && !blackoutDates.some(d => d.getTime() === date.getTime())) {
      setBlackoutDates([...blackoutDates, date]);
    }
    setSelectedDate(undefined);
  };

  const removeBlackoutDate = (dateToRemove: Date) => {
    setBlackoutDates(blackoutDates.filter(date => date.getTime() !== dateToRemove.getTime()));
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Advanced Scheduling Options</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            {/* Execution Mode */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Execution Mode</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={executionMode === 'parallel'}
                    onCheckedChange={(checked) => setExecutionMode(checked ? 'parallel' : 'sequential')}
                  />
                  <Label className="text-sm">
                    {executionMode === 'parallel' ? 'Parallel' : 'Sequential'} Execution
                  </Label>
                </div>
                <Badge variant="outline" className="text-xs">
                  {executionMode === 'parallel' ? 'Faster, higher resource usage' : 'Slower, lower resource usage'}
                </Badge>
              </div>
            </div>

            {/* Max Runtime */}
            <div className="space-y-3">
              <Label htmlFor="max-runtime" className="text-sm font-medium">
                Max Runtime per Application (minutes)
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="max-runtime"
                  type="number"
                  value={maxRuntime}
                  onChange={(e) => setMaxRuntime(parseInt(e.target.value) || 120)}
                  min={5}
                  max={480}
                  className="w-32"
                />
                <span className="text-sm text-gray-500">Default: 120 minutes</span>
              </div>
            </div>

            {/* Blackout Dates */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Holiday/Blackout Calendar</Label>
              <div className="space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Add Blackout Date
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={addBlackoutDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                {blackoutDates.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {blackoutDates.map((date, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {format(date, 'MMM dd, yyyy')}
                        <button
                          onClick={() => removeBlackoutDate(date)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Tasks will not run on selected blackout dates
                </p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
