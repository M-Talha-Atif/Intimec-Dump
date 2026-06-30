
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Trash2, Edit, Calendar, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { ScheduledTask, getSuccessRate, formatNextRun, formatLastRun } from '../utils/schedulingUtils';

interface SchedulingListProps {
  tasks: ScheduledTask[];
  onRunNow: (id: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SchedulingList: React.FC<SchedulingListProps> = ({ 
  tasks, 
  onRunNow, 
  onToggle, 
  onDelete 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };

  return (
    <div className="grid gap-4">
      {tasks.map(task => (
        <Card key={task.id} className={!task.enabled ? 'opacity-60' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-lg ${task.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Calendar className={`h-5 w-5 ${task.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base">{task.name}</CardTitle>
                    <Badge variant={task.enabled ? 'default' : 'secondary'}>
                      {task.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {task.type.replace('-', ' ')}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => onRunNow(task.id)}>
                  <Play className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onToggle(task.id)}>
                  {task.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Schedule</p>
                <p className="font-medium capitalize">{task.frequency}</p>
                <p className="text-xs text-muted-foreground">{task.time} {task.timezone}</p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Next Run</p>
                <p className="font-medium">{formatNextRun(task.nextRun)}</p>
                {task.nextRun && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(task.nextRun).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Last Run</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <span className="font-medium">{formatLastRun(task.lastRun)}</span>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Execution Stats</p>
                <p className="font-medium">{task.runCount} runs</p>
                <p className="text-xs text-muted-foreground">
                  {getSuccessRate(task)}% success rate
                </p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Created By</p>
                <p className="font-medium text-xs">{task.createdBy}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(task.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Execution History Preview */}
            {task.lastRun && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Recent Executions</p>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const isSuccess = Math.random() > 0.1;
                    return (
                      <div
                        key={idx}
                        className={`h-6 flex-1 rounded ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}
                        title={`Run ${idx + 1}: ${isSuccess ? 'Success' : 'Failed'}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
