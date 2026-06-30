import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp, Clock, Shield,
  BarChart3, Activity, RefreshCw, Loader2
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Loader } from '@/components/ui/Loader';

const AccessAnalytics: React.FC = () => {
  const [periodDays, setPeriodDays] = useState(30);
  const { analytics, loading, error, refetch } = useAnalytics(periodDays);

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* <h2 className="text-xl font-semibold text-foreground">Access Analytics</h2> */}
        <div className="flex items-center gap-2">
          <Select
            value={String(periodDays)}
            onValueChange={(value) => setPeriodDays(Number(value))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                Total Requests
              </span>
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            </div>

            <div className="text-xl font-bold text-foreground">
              {analytics.totalRequests}
            </div>

            <div className="text-xs text-muted-foreground mt-1">
              Last {analytics.periodDays} days
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                Approval Rate
              </span>
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            </div>

            <div className="text-xl font-bold text-foreground">
              {Math.round(analytics.approvalRate)}%
            </div>

            <div className="text-xs text-muted-foreground mt-1">
              {analytics.approvedCount} approved
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                Avg Risk Score
              </span>
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
            </div>

            <div className="text-xl font-bold text-foreground">
              0.0
              {/* {analytics.avgRiskScore.toFixed(1)} */}
            </div>

            <div className="text-xs text-muted-foreground mt-1">
              Out of 100
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                Avg Processing Time
              </span>
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            </div>

            <div className="text-xl font-bold text-foreground">
              {analytics.avgProcessingTimeHours}h
            </div>

            <div className="text-xs text-muted-foreground mt-1">
              Average duration
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Request Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Request Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {analytics.pendingCount}
              </div>
              <div className="text-sm text-gray-600 mt-1">Pending</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                <div
                  className="bg-yellow-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${analytics.pendingPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round(analytics.pendingPercentage)}% of total
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {analytics.approvedCount}
              </div>
              <div className="text-sm text-gray-600 mt-1">Approved</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                <div
                  className="bg-green-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${analytics.approvedPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round(analytics.approvedPercentage)}% of total
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {analytics.rejectedCount}
              </div>
              <div className="text-sm text-gray-600 mt-1">Rejected</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                <div
                  className="bg-red-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${analytics.rejectedPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round(analytics.rejectedPercentage)}% of total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Most Requested Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Most Requested Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.mostRequestedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No request data available
            </p>
          ) : (
            <div className="space-y-4">
              {analytics.mostRequestedItems.map((item, index) => (
                <div key={item.itemId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{item.itemName}</div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {item.requestCount} request{item.requestCount !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessAnalytics;