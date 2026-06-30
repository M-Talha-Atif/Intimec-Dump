"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { formatTimestamp } from "./audit-log-utils";

export function TimestampDemo() {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toISOString());
    };

    updateTime();
    
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const sampleTimestamp = "2024-07-21T14:30:45.123Z";

  // Get timezone info using browser APIs
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const date = new Date();
  const offsetMinutes = date.getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
  const offsetMins = Math.abs(offsetMinutes % 60);
  const offsetSign = offsetMinutes <= 0 ? '+' : '-';
  const offsetString = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMins.toString().padStart(2, '0')}`;

  if (!currentTime) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timezone-Aware Timestamp Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Your Timezone Settings</h4>
            <div className="text-sm space-y-1">
              <div><strong>Timezone:</strong> {timezone}</div>
              <div><strong>Offset:</strong> UTC{offsetString}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Format Examples</h4>
            <div className="text-sm space-y-1">
              <div><strong>Sample UTC:</strong> {sampleTimestamp}</div>
              <div><strong>Your Local Time:</strong> {formatTimestamp(sampleTimestamp)}</div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">Live Current Time</h4>
          <div className="text-sm">
            <div><strong>UTC:</strong> {currentTime}</div>
            <div><strong>Your Time:</strong> {formatTimestamp(currentTime)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
