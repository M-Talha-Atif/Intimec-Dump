
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  History, Calendar, Clock, Play, Pause, Trash2, 
  CheckCircle, XCircle, AlertCircle, Loader2, User
} from 'lucide-react';
import { ScheduledTask, TaskExecution } from '@/types/scheduling';
import { useTaskScheduling } from '@/hooks/useTaskScheduling';
import { format } from 'date-fns';

interface TaskHistoryProps {
  trigger?: React.ReactNode;
}

export const TaskHistory: React.FC<TaskHistoryProps> = ({ trigger }) => {
  const { scheduledTasks, taskExecutions, executeTask, cancelTask, deleteTask } = useTaskScheduling();
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline',
      cancelled: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const getTaskExecutionsForTask = (taskId: string) => {
    return taskExecutions.filter(e => e.taskId === taskId);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            Task History
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Scheduled Tasks & Execution History
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="scheduled" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scheduled">Scheduled Tasks</TabsTrigger>
            <TabsTrigger value="executions">Execution History</TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled" className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-4">
              {scheduledTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <CardTitle className="text-base">{task.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {task.type === 'data-import' ? '📥 Data Import' : '🧠 AI Analysis'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(task.status)}
                        <Badge variant="outline">
                          {task.schedule.frequency}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Schedule:</span>
                        <p>{task.schedule.time} ({task.schedule.timezone})</p>
                        <p className="text-muted-foreground">{task.schedule.frequency}</p>
                      </div>
                      <div>
                        <span className="font-medium">Last Run:</span>
                        <p>{task.lastRun ? formatDateTime(task.lastRun) : 'Never'}</p>
                        <p className="text-muted-foreground">Runs: {task.runCount}</p>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>
                        <p>{formatDateTime(task.createdAt)}</p>
                        <p className="text-muted-foreground">By: {task.createdBy}</p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                      {task.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => executeTask(task.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Run Now
                        </Button>
                      )}
                      {task.status === 'running' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => cancelTask(task.id)}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedTask(task)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="executions" className="space-y-4 max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taskExecutions.map((execution) => {
                  const task = scheduledTasks.find(t => t.id === execution.taskId);
                  const duration = execution.endTime 
                    ? Math.round((new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()) / 1000)
                    : null;
                  
                  return (
                    <TableRow key={execution.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{task?.name || 'Unknown Task'}</p>
                          <p className="text-sm text-muted-foreground">
                            {task?.type === 'data-import' ? 'Data Import' : 'AI Analysis'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(execution.startTime)}</TableCell>
                      <TableCell>
                        {duration ? `${duration}s` : execution.status === 'running' ? 'Running...' : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(execution.status)}</TableCell>
                      <TableCell>
                        {execution.result && (
                          <div className="text-sm">
                            <p>Items: {execution.result.processedItems}</p>
                            <p className="text-muted-foreground">Errors: {execution.result.errors}</p>
                          </div>
                        )}
                        {execution.errorMessage && (
                          <p className="text-sm text-red-600">{execution.errorMessage}</p>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
