import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useDebugging } from "@/contexts/debugging-context";

export const LiveLogStream: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { isLiveMode, setIsLiveMode, logs, connectionStatus } = useDebugging();

  const [streamStats, setStreamStats] = useState({
    eventsPerSecond: 0,
    totalEvents: 0,
    errorRate: 0,
  });

  // Calculate real-time stats from actual logs
  useEffect(() => {
    if (!logs || logs.length === 0) return;

    const now = Date.now();
    const oneSecondAgo = now - 1000;
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    // Calculate events per second (events in the last second)
    const recentLogs = logs.filter((log) => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime >= oneSecondAgo;
    });

    // Calculate error rate from logs in the last 5 minutes
    const recentLogsForErrorRate = logs.filter((log) => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime >= fiveMinutesAgo;
    });

    const errorLogs = recentLogsForErrorRate.filter(
      (log) => log.level === "ERROR" || log.level === "FATAL"
    );

    const errorRate =
      recentLogsForErrorRate.length > 0
        ? (errorLogs.length / recentLogsForErrorRate.length) * 100
        : 0;

    setStreamStats({
      eventsPerSecond: recentLogs.length,
      totalEvents: logs.length,
      errorRate: errorRate,
    });
  }, [logs]);

  // Update stats periodically when in live mode
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      if (logs && logs.length > 0) {
        const now = Date.now();
        const oneSecondAgo = now - 1000;
        const fiveMinutesAgo = now - 5 * 60 * 1000;

        const recentLogs = logs.filter((log) => {
          const logTime = new Date(log.timestamp).getTime();
          return logTime >= oneSecondAgo;
        });

        const recentLogsForErrorRate = logs.filter((log) => {
          const logTime = new Date(log.timestamp).getTime();
          return logTime >= fiveMinutesAgo;
        });

        const errorLogs = recentLogsForErrorRate.filter(
          (log) => log.level === "ERROR" || log.level === "FATAL"
        );

        const errorRate =
          recentLogsForErrorRate.length > 0
            ? (errorLogs.length / recentLogsForErrorRate.length) * 100
            : 0;

        setStreamStats({
          eventsPerSecond: recentLogs.length,
          totalEvents: logs.length,
          errorRate: errorRate,
        });
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isLiveMode, logs]);

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500 animate-pulse";
      case "connecting":
        return "bg-yellow-500 animate-pulse";
      case "disconnected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Live Log Stream";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Disconnected";
      default:
        return "Live Log Stream";
    }
  };

  return (
    <div className="space-y-4">
      {/* Live Stream Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${getConnectionStatusColor()}`}
              />
              <span>{getConnectionStatusText()}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={isLiveMode ? "destructive" : "default"}
                size="sm"
                onClick={() => setIsLiveMode(!isLiveMode)}
                disabled={connectionStatus === "connecting"}
              >
                {isLiveMode ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {streamStats.eventsPerSecond}
              </div>
              <div className="text-sm text-muted-foreground">Events/sec</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {streamStats.totalEvents.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {streamStats.errorRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Error Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Logs */}
      <div className="space-y-2">

        {!isLiveMode && (
          <div className="bg-yellow-100 border border-yellow-300 rounded p-2">
            <p className="text-sm text-yellow-800 text-center">
              Stream paused - Click Resume to continue receiving live events
            </p>
          </div>
        )}

        {connectionStatus === "connecting" && (
          <div className="bg-blue-100 border border-blue-300 rounded p-2">
            <p className="text-sm text-blue-800 text-center">
              Connecting to live stream...
            </p>
          </div>
        )}

        {connectionStatus === "disconnected" && isLiveMode && (
          <div className="bg-red-100 border border-red-300 rounded p-2">
            <p className="text-sm text-red-800 text-center">
              Connection lost - Attempting to reconnect...
            </p>
          </div>
        )}

        {children}

      </div>
    </div>
  );
};
