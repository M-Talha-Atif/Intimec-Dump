import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

interface MonitoringTimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

const ranges: { value: TimeRange; label: string }[] = [
  { value: '1h', label: '1H' },
  { value: '6h', label: '6H' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
];

export const MonitoringTimeRangeSelector = ({ value, onChange }: MonitoringTimeRangeSelectorProps) => (
  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
    <Clock className="h-4 w-4 text-muted-foreground ml-2" />
    {ranges.map((r) => (
      <Button
        key={r.value}
        variant={value === r.value ? 'default' : 'ghost'}
        size="sm"
        className="h-7 px-3 text-xs"
        onClick={() => onChange(r.value)}
      >
        {r.label}
      </Button>
    ))}
  </div>
);
