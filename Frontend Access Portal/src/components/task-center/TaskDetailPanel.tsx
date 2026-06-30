
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X, RotateCcw, ArrowUp } from 'lucide-react';
import { Task } from './types';
import { useTaskDetailPanel } from './hooks/useTaskDetailPanel';
import { TaskDetailOverview } from './components/TaskDetailOverview';
import { TaskDetailPayload } from './components/TaskDetailPayload';
import { TaskDetailLogs } from './components/TaskDetailLogs';
import { TaskDetailHistory } from './components/TaskDetailHistory';
import { TaskDetailLinkedObjects } from './components/TaskDetailLinkedObjects';
import { TaskDetailAIInsights } from './components/TaskDetailAIInsights';
import { TaskDetailActions } from './components/TaskDetailActions';

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onTaskAction: (taskId: string, action: string, additionalData?: any) => void;
}

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  onClose,
  onTaskAction
}) => {
  const {
    activeTab,
    setActiveTab,
    newNote,
    setNewNote,
    newTag,
    setNewTag,
    aiInsights,
    handleAddNote,
    handleAddTag
  } = useTaskDetailPanel({ task, onTaskAction });

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto p-6">
        <SheetHeader className="space-y-0 pb-4">
          <SheetTitle className="text-lg">Task Details</SheetTitle>
        </SheetHeader>
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payload">Payload</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            <div className="mt-4 space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="linked">Linked</TabsTrigger>
                <TabsTrigger value="ai">AI Insights</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4">
              <TaskDetailOverview task={task} />
            </TabsContent>

            <TabsContent value="payload">
              <TaskDetailPayload payload={task.payload} />
            </TabsContent>

            <TabsContent value="logs">
              <TaskDetailLogs logs={task.logs} />
            </TabsContent>

            <TabsContent value="history">
              <TaskDetailHistory history={task.history} />
            </TabsContent>

            <TabsContent value="linked">
              <TaskDetailLinkedObjects linkedObjects={task.linkedObjects} />
            </TabsContent>

            <TabsContent value="ai">
              <TaskDetailAIInsights 
                task={task} 
                aiInsights={aiInsights} 
                onRetry={() => onTaskAction(task.id, 'retry')} 
              />
            </TabsContent>

            <TabsContent value="actions">
              <TaskDetailActions
                task={task}
                newNote={newNote}
                setNewNote={setNewNote}
                newTag={newTag}
                setNewTag={setNewTag}
                onAddNote={handleAddNote}
                onAddTag={handleAddTag}
              />
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4 border-t">
            {task.status === 'failed' && (
              <Button size="sm" onClick={() => onTaskAction(task.id, 'retry')}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Retry Task
              </Button>
            )}
            {task.status === 'running' && (
              <Button variant="outline" size="sm" onClick={() => onTaskAction(task.id, 'abort')}>
                <X className="h-4 w-4 mr-1" />
                Abort Task
              </Button>
            )}
            {['pending', 'running', 'failed'].includes(task.status) && (
              <Button variant="outline" size="sm" onClick={() => onTaskAction(task.id, 'escalate')}>
                <ArrowUp className="h-4 w-4 mr-1" />
                Escalate
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
