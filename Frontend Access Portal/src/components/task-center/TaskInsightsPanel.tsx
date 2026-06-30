import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Clock, CheckCircle } from "lucide-react";
import { Task } from "@/services/responsibilities";

interface TaskInsightsPanelProps {
  tasks: Task[];
}

interface TaskMetrics {
  totalTasks: number;
  pendingTasks: number;
  approvedTasks: number;
  rejectedTasks: number;
  completedTasks: number;
  approvalRate: number;
}

export function TaskInsightsPanel({ tasks }: TaskInsightsPanelProps) {
  const calculateMetrics = (): TaskMetrics => {
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter((t) => t.status === "pending").length;
    const approvedTasks = tasks.filter((t) => t.status === "approved").length;
    const rejectedTasks = tasks.filter((t) => t.status === "rejected").length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;

    const processedTasks = approvedTasks + rejectedTasks + completedTasks;
    const approvalRate =
      processedTasks > 0 ? (approvedTasks / processedTasks) * 100 : 0;

    return {
      totalTasks,
      pendingTasks,
      approvedTasks,
      rejectedTasks,
      completedTasks,
      approvalRate,
    };
  };

  const metrics = calculateMetrics();

  const getPerformanceTrend = () => {
    // Simple mock trend calculation
    const recentTasks = tasks.slice(-10);
    const olderTasks = tasks.slice(-20, -10);

    const recentApproved = recentTasks.filter(
      (t) => t.status === "approved",
    ).length;
    const olderApproved = olderTasks.filter(
      (t) => t.status === "approved",
    ).length;

    const recentRate =
      recentTasks.length > 0 ? (recentApproved / recentTasks.length) * 100 : 0;
    const olderRate =
      olderTasks.length > 0 ? (olderApproved / olderTasks.length) * 100 : 0;

    return recentRate - olderRate;
  };

  const performanceTrend = getPerformanceTrend();

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{metrics.totalTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-2xl font-bold">
                  {metrics.approvalRate.toFixed(1)}%
                </p>
              </div>
              <div className="flex items-center space-x-1">
                {performanceTrend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-xs ${performanceTrend > 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {Math.abs(performanceTrend).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{metrics.pendingTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{metrics.approvedTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Task Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Approved Tasks</span>
                <span>
                  {metrics.approvedTasks} of {metrics.totalTasks}
                </span>
              </div>
              <Progress value={metrics.approvalRate} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Approved</p>
                <p className="text-lg font-semibold text-green-600">
                  {metrics.approvedTasks}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Rejected</p>
                <p className="text-lg font-semibold text-red-600">
                  {metrics.rejectedTasks}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Pending</p>
                <p className="text-lg font-semibold text-orange-600">
                  {metrics.pendingTasks}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Types Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Task Types Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["role_approval", "certification", "workflow", "delegation"].map(
              (type) => {
                const typeCount = tasks.filter((t) => t.type === type).length;
                const percentage =
                  metrics.totalTasks > 0
                    ? (typeCount / metrics.totalTasks) * 100
                    : 0;

                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">
                        {type.replace("_", " ")}
                      </span>
                      <span>
                        {typeCount} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              },
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
