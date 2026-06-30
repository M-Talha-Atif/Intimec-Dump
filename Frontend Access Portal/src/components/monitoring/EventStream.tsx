import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, Download, ExternalLink } from 'lucide-react';
import { getSeverityBadgeClass, getEventTypeBadgeClass } from '@/utils/getBadgeClass';
import { cn } from '@/lib/utils';
import { monitoringEvents, type MonitoringEvent } from './data/monitoring-data';
import { EventDetailDrawer } from './EventDetailDrawer';
import { downloadJson } from '@/utils/download';
import { toast } from 'sonner';
import type { TimeRange } from './MonitoringTimeRangeSelector';

const PAGE_SIZE = 10;

interface EventStreamProps {
  timeRange?: TimeRange;
}

export const EventStream = ({ timeRange }: EventStreamProps) => {
  const [isLive, setIsLive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedEvent, setSelectedEvent] = useState<MonitoringEvent | null>(null);

  const filtered = useMemo(() => {
    return monitoringEvents.filter(e => {
      const matchSearch = !searchQuery ||
        e.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.application.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.correlationId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === 'all' || e.type === typeFilter;
      const matchSeverity = severityFilter === 'all' || e.severity === severityFilter;
      return matchSearch && matchType && matchSeverity;
    });
  }, [searchQuery, typeFilter, severityFilter]);

  const visible = filtered.slice(0, visibleCount);

  const handleExport = () => {
    downloadJson(filtered, 'monitoring-events.json');
    toast.success(`Exported ${filtered.length} events`);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events by user, application, message, or correlation ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Filter by type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="provisioning">Provisioning</SelectItem>
                <SelectItem value="access_request">Access Requests</SelectItem>
                <SelectItem value="connector">Connectors</SelectItem>
                <SelectItem value="certification">Certifications</SelectItem>
                <SelectItem value="workflow">Workflows</SelectItem>
                <SelectItem value="policy">Policy</SelectItem>
                <SelectItem value="audit">Audit</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch checked={isLive} onCheckedChange={setIsLive} id="live-stream" />
              <label htmlFor="live-stream" className="text-sm font-medium">Live</label>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Event Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/50'}`} />
              <span>Live Event Stream</span>
            </CardTitle>
            <Badge variant="outline">{filtered.length} events</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visible.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex-shrink-0 text-xs text-muted-foreground w-16 pt-0.5">
                  {event.timestamp.split(' ')[1]}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={cn(getSeverityBadgeClass(event.severity), "border text-xs")}>{event.severity.toUpperCase()}</Badge>
                      <Badge variant="outline" className={cn(getEventTypeBadgeClass(event.type), "border text-xs")}>{event.type.replace('_', ' ').toUpperCase()}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelectedEvent(event); }}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm font-medium text-foreground">{event.message}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>User: <span className="font-medium">{event.user}</span></span>
                    <span>App: <span className="font-medium">{event.application}</span></span>
                    <span>ID: <span className="font-mono">{event.correlationId}</span></span>
                  </div>
                  {event.details && (
                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(event.details).map(([key, value]) => (
                          <span key={key}>{key}: <span className="font-medium">{String(value)}</span></span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {visibleCount < filtered.length && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}>
                Load More ({filtered.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <EventDetailDrawer open={!!selectedEvent} onOpenChange={open => { if (!open) setSelectedEvent(null); }} event={selectedEvent} />
    </div>
  );
};
