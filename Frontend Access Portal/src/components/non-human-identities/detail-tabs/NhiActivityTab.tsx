
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Plus, Minus, UserCheck, RefreshCw, Settings, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

type EventType = 'Auth' | 'Rotation' | 'Config' | 'Access';

const eventIcons: Record<EventType, React.ReactNode> = {
  Auth: <Check className="w-4 h-4 text-white" />,
  Rotation: <RefreshCw className="w-4 h-4 text-white" />,
  Config: <Settings className="w-4 h-4 text-white" />,
  Access: <Shield className="w-4 h-4 text-white" />,
};

const eventColors: Record<EventType, string> = {
  Auth: 'bg-sky-500',
  Rotation: 'bg-green-500',
  Config: 'bg-slate-500',
  Access: 'bg-indigo-500',
};

const defaultActivity = [
  { id: 'a1', when: '2025-02-26 07:55 AM', kind: 'Auth' as EventType, message: 'Authenticated to AWS Console via access key' },
  { id: 'a2', when: '2025-02-25 10:00 PM', kind: 'Auth' as EventType, message: 'API call to S3 bucket: prod-data' },
  { id: 'a3', when: '2025-02-24 03:00 PM', kind: 'Rotation' as EventType, message: 'Access key rotated by DevOps automation' },
  { id: 'a4', when: '2025-02-20 09:15 AM', kind: 'Config' as EventType, message: 'IAM policy modified: added CloudWatch read' },
  { id: 'a5', when: '2025-02-18 02:30 PM', kind: 'Access' as EventType, message: 'New permission granted: EC2 describe instances' },
  { id: 'a6', when: '2025-02-15 11:00 AM', kind: 'Auth' as EventType, message: 'Failed authentication attempt from unknown IP' },
  { id: 'a7', when: '2025-02-10 04:45 PM', kind: 'Config' as EventType, message: 'Service account ownership reassigned' },
];

const NhiActivityTab = ({ identity }: { identity: any }) => {
  const [activeFilters, setActiveFilters] = useState<Set<EventType>>(new Set(['Auth', 'Rotation', 'Config', 'Access']));

  const activity = useMemo(() => {
    if (identity.activity?.length) {
      return identity.activity.map((a: any, i: number) => ({
        id: a.id || `act_${i}`,
        when: a.when || a.timestamp,
        kind: (a.kind || 'Auth') as EventType,
        message: a.message || a.description,
      }));
    }
    return defaultActivity;
  }, [identity.activity]);

  const filtered = useMemo(() => activity.filter((e: any) => activeFilters.has(e.kind)), [activity, activeFilters]);

  const toggleFilter = (type: EventType) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) { if (next.size > 1) next.delete(type); } else { next.add(type); }
      return next;
    });
  };

  const counts = useMemo(() => {
    const c: Record<EventType, number> = { Auth: 0, Rotation: 0, Config: 0, Access: 0 };
    activity.forEach((e: any) => { c[e.kind as EventType] = (c[e.kind as EventType] || 0) + 1; });
    return c;
  }, [activity]);

  // Group by time
  const grouped = useMemo(() => {
    const groups: { label: string; events: any[] }[] = [];
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const t: any[] = [], w: any[] = [], o: any[] = [];
    filtered.forEach((e: any) => {
      const d = new Date(e.when);
      if (d.toDateString() === today.toDateString()) t.push(e);
      else if (d >= weekAgo) w.push(e);
      else o.push(e);
    });
    if (t.length) groups.push({ label: 'Today', events: t });
    if (w.length) groups.push({ label: 'This Week', events: w });
    if (o.length) groups.push({ label: 'Older', events: o });
    return groups;
  }, [filtered]);

  return (
    <Card className="pt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div><CardTitle className="text-base">Recent Activity</CardTitle><CardDescription>{activity.length} events total · {filtered.length} shown</CardDescription></div>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {(Object.keys(eventIcons) as EventType[]).map(type => (
            <Button key={type} size="sm" variant={activeFilters.has(type) ? 'default' : 'outline'} onClick={() => toggleFilter(type)}
              className={cn("h-7 text-xs gap-1", activeFilters.has(type) && eventColors[type])}>
              {type} ({counts[type]})
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events match the selected filters.</p>
        ) : (
          <div className="space-y-4">
            {grouped.map(group => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.label}</p>
                <div className="relative pl-6">
                  <div className="absolute left-[35px] top-0 h-full w-0.5 bg-border" style={{ transform: 'translateX(-50%)' }} />
                  {group.events.map((event: any) => (
                    <div key={event.id} className="relative flex items-start gap-6 pb-6">
                      <div className="relative z-10">
                        <div className={cn("flex items-center justify-center w-7 h-7 rounded-full", eventColors[event.kind as EventType])}>
                          {eventIcons[event.kind as EventType]}
                        </div>
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-medium text-sm">{event.message}</p>
                        <p className="text-xs text-muted-foreground">{event.when}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">{event.kind}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NhiActivityTab;
