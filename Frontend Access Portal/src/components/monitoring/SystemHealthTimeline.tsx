import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { systemHealthHistory } from './data/monitoring-data';

export const SystemHealthTimeline = () => {
  const last48 = systemHealthHistory.slice(0, 48);
  const uptimeAvg = (last48.reduce((s, h) => s + h.uptime, 0) / last48.length).toFixed(2);
  const incidents = last48.filter(h => h.status === 'incident');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">System Health (Last 48 Hours)</CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{uptimeAvg}% uptime</Badge>
            <Badge variant={incidents.length > 0 ? 'destructive' : 'secondary'}>
              {incidents.length} incident{incidents.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-[2px] items-end h-10">
          {last48.map((entry, i) => {
            const color = entry.status === 'incident' 
              ? 'bg-destructive' 
              : entry.status === 'degraded' 
                ? 'bg-yellow-500' 
                : 'bg-green-500';
            return (
              <div
                key={i}
                className={`flex-1 rounded-sm ${color} cursor-pointer hover:opacity-80 transition-opacity group relative`}
                style={{ height: `${(entry.uptime / 100) * 40}px`, minHeight: 4 }}
                title={`${entry.timestamp}: ${entry.uptime.toFixed(1)}% ${entry.incidentTitle ? `— ${entry.incidentTitle}` : ''}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>48h ago</span>
          <span>Now</span>
        </div>
        {incidents.length > 0 && (
          <div className="mt-4 space-y-2">
            {incidents.map((inc, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span className="text-muted-foreground">{inc.timestamp}</span>
                <span className="font-medium text-foreground">{inc.incidentTitle}</span>
                <Badge variant="outline" className="text-xs">{inc.incidentId}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
