
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Play, Pause, Database, Shield, Users, CheckCircle, XCircle, Clock, Square, AlertTriangle } from 'lucide-react';
import type { ScheduledTask, TaskExecution } from '@/types/scheduling';

interface ScheduledTasksTabProps {
  scheduledTasks: ScheduledTask[];
  taskExecutions: TaskExecution[];
}

export const ScheduledTasksTab: React.FC<ScheduledTasksTabProps> = ({ scheduledTasks, taskExecutions }) => {
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <Square className="h-4 w-4 text-gray-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'data-import':
        return <Database className="h-4 w-4" />;
      case 'ai-analysis':
        return <Shield className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Scheduled Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Scheduled Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {scheduledTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No scheduled tasks</p>
                </div>
              ) : (
                scheduledTasks.map(task => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="pt-0.5">
                        {getTypeIcon(task.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{task.name}</span>
                          <Badge variant="outline">{task.type}</Badge>
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Created: {new Date(task.createdAt).toLocaleDateString()}</div>
                          <div>Runs: {task.runCount}</div>
                          {task.lastRun && (
                            <div>Last run: {new Date(task.lastRun).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Pause className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>Recent Executions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {taskExecutions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Play className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent executions</p>
                </div>
              ) : (
                taskExecutions.map(execution => (
                  <div key={execution.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="pt-0.5">
                        {getStatusIcon(execution.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">Task Execution</span>
                          <Badge variant="outline">{execution.status}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Started: {new Date(execution.startTime).toLocaleString()}</div>
                          {execution.endTime && (
                            <div>Ended: {new Date(execution.endTime).toLocaleString()}</div>
                          )}
                          {execution.errorMessage && (
                            <div className="text-red-600">Error: {execution.errorMessage}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
