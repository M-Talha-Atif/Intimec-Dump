import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download } from 'lucide-react';
import { downloadJson } from '@/utils/download';
import type { MonitoringEvent } from './data/monitoring-data';
import { monitoringEvents } from './data/monitoring-data';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getSeverityBadgeClass, getEventTypeBadgeClass } from '@/utils/getBadgeClass';

interface EventDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: MonitoringEvent | null;
}

export const EventDetailDrawer = ({ open, onOpenChange, event }: EventDetailDrawerProps) => {
  if (!event) return null;

  const correlated = monitoringEvents.filter(e => e.id !== event.id && (e.application === event.application || e.user === event.user)).slice(0, 5);

  const handleExport = () => {
    downloadJson(event, `event-${event.id}.json`);
    toast.success('Event data exported');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] flex flex-col p-0 h-full">
        <div className="flex-shrink-0 px-6 py-4">
          <SheetHeader className="space-y-1">
            <SheetTitle>Event Detail: {event.id}</SheetTitle>
            <SheetDescription>{event.message}</SheetDescription>
          </SheetHeader>
          <div className="flex items-center gap-3 mt-3">
            <Badge className={cn(getSeverityBadgeClass(event.severity), 'border')}>{event.severity.toUpperCase()}</Badge>
            <Badge variant="outline" className={cn(getEventTypeBadgeClass(event.type), 'border')}>{event.type.replace('_', ' ').toUpperCase()}</Badge>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-6">
            {/* Metadata */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Event Metadata</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Timestamp</p><p className="font-medium text-foreground">{event.timestamp}</p></div>
                <div><p className="text-muted-foreground">User</p><p className="font-medium text-foreground">{event.user}</p></div>
                <div><p className="text-muted-foreground">Application</p><p className="font-medium text-foreground">{event.application}</p></div>
                <div><p className="text-muted-foreground">Correlation ID</p><p className="font-mono text-xs text-foreground">{event.correlationId}</p></div>
              </div>
            </div>

            {/* Payload */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Event Payload</h4>
              <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-auto text-foreground">
                {JSON.stringify(event.details, null, 2)}
              </pre>
            </div>

            {/* Correlated Events */}
            {correlated.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Correlated Events ({correlated.length})</h4>
                <div className="space-y-2">
                  {correlated.map(e => (
                    <div key={e.id} className="p-3 border rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={cn(getSeverityBadgeClass(e.severity), 'border text-xs')}>{e.severity}</Badge>
                        <span className="font-mono text-xs text-muted-foreground">{e.id}</span>
                        <span className="text-xs text-muted-foreground">{e.timestamp}</span>
                      </div>
                      <p className="text-foreground">{e.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
