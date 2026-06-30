
import React, { useState, useMemo } from 'react';
import { type User, type ActivityEvent } from '@/data/mock-users';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Plus, Minus, UserCheck } from 'lucide-react';
import { getIdentityProfile } from '@/data/mock-identity-profiles';
import { cn } from '@/lib/utils';

const eventIcons = {
  Assignment: <Plus className="w-4 h-4 text-white" />,
  Revocation: <Minus className="w-4 h-4 text-white" />,
  Review: <UserCheck className="w-4 h-4 text-white" />,
  Request: <Check className="w-4 h-4 text-white" />,
};

const eventColors = {
  Assignment: 'bg-sky-500',
  Revocation: 'bg-slate-500',
  Review: 'bg-green-500',
  Request: 'bg-indigo-500',
};

type EventType = 'Assignment' | 'Revocation' | 'Review' | 'Request';

const IdentityActivityTab = ({ user }: { user: User }) => {
  const [activeFilters, setActiveFilters] = useState<Set<EventType>>(new Set(['Assignment', 'Revocation', 'Review', 'Request']));

  const profile = getIdentityProfile(user.id);
  
  const activity: ActivityEvent[] = useMemo(() => {
    if (profile?.activity) {
      return profile.activity.map(act => ({
        id: act.id,
        timestamp: act.timestamp,
        type: act.eventType as EventType,
        description: act.description,
        actor: act.source || 'System'
      }));
    }
    return user.activity || [];
  }, [profile, user.activity]);

  const filteredActivity = useMemo(() => {
    return activity.filter(event => activeFilters.has(event.type));
  }, [activity, activeFilters]);

  const toggleFilter = (type: EventType) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  // Group events by date
  const grouped = useMemo(() => {
    const groups: { label: string; events: ActivityEvent[] }[] = [];
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayEvents: ActivityEvent[] = [];
    const weekEvents: ActivityEvent[] = [];
    const olderEvents: ActivityEvent[] = [];

    filteredActivity.forEach(event => {
      const eventDate = new Date(event.timestamp);
      if (eventDate.toDateString() === today.toDateString()) {
        todayEvents.push(event);
      } else if (eventDate >= weekAgo) {
        weekEvents.push(event);
      } else {
        olderEvents.push(event);
      }
    });

    if (todayEvents.length > 0) groups.push({ label: 'Today', events: todayEvents });
    if (weekEvents.length > 0) groups.push({ label: 'This Week', events: weekEvents });
    if (olderEvents.length > 0) groups.push({ label: 'Older', events: olderEvents });
    return groups;
  }, [filteredActivity]);

  const eventTypeCounts = useMemo(() => {
    const counts: Record<EventType, number> = { Assignment: 0, Revocation: 0, Review: 0, Request: 0 };
    activity.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });
    return counts;
  }, [activity]);

  if (activity.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">No recent activity found for this identity.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>{activity.length} events total · {filteredActivity.length} shown</CardDescription>
          </div>
        </div>
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {(Object.keys(eventIcons) as EventType[]).map(type => (
            <Button
              key={type}
              size="sm"
              variant={activeFilters.has(type) ? 'default' : 'outline'}
              onClick={() => toggleFilter(type)}
              className={cn("h-7 text-xs gap-1", activeFilters.has(type) && eventColors[type])}
            >
              {type} ({eventTypeCounts[type]})
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {grouped.length === 0 ? (
          <p className="text-sm text-slate-500">No events match the selected filters.</p>
        ) : (
          <div className="space-y-4">
            {grouped.map(group => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{group.label}</p>
                <div className="relative pl-6">
                  <div className="absolute left-[35px] top-0 h-full w-0.5 bg-slate-200" style={{ transform: 'translateX(-50%)' }} />
                  {group.events.map((event) => (
                    <div key={event.id} className="relative flex items-start gap-6 pb-6">
                      <div className="relative z-10">
                        <div className={cn("flex items-center justify-center w-7 h-7 rounded-full", eventColors[event.type])}>
                          {eventIcons[event.type]}
                        </div>
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-medium text-sm text-slate-800">{event.description}</p>
                        <p className="text-xs text-slate-500">by {event.actor} · {event.timestamp}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">{event.type}</Badge>
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

export default IdentityActivityTab;
