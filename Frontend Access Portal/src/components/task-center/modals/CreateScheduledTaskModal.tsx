import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CreateScheduledTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: (task: any) => void;
}

export const CreateScheduledTaskModal: React.FC<CreateScheduledTaskModalProps> = ({
  open, onOpenChange, onTaskCreated
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '', description: '', type: 'provisioning', frequency: 'daily',
    time: '02:00', timezone: 'UTC', date: '', cronExpression: '',
    runImmediately: false, targetApplication: '', targetIdentities: '',
    slaMinutes: '60', retryAttempts: '3', notificationEmails: '', enabled: true
  });

  const taskTypes = [
    { value: 'provisioning', label: 'Provisioning' },
    { value: 'deprovisioning', label: 'Deprovisioning' },
    { value: 'review', label: 'Access Review' },
    { value: 'certification', label: 'Certification' },
    { value: 'sync', label: 'Data Sync' },
    { value: 'data-import', label: 'Data Import' },
    { value: 'ai-analysis', label: 'AI Analysis' },
    { value: 'workflow', label: 'Workflow' }
  ];

  const frequencies = [
    { value: 'one-time', label: 'One Time' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom (Cron)' }
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'GMT (London)' },
    { value: 'Europe/Paris', label: 'CET (Paris)' }
  ];

  const handleSubmit = () => {
    if (!formData.name) { toast({ title: "Validation Error", description: "Task name is required", variant: "destructive" }); return; }
    if (formData.frequency === 'one-time' && !formData.date) { toast({ title: "Validation Error", description: "Date is required for one-time tasks", variant: "destructive" }); return; }
    if (formData.frequency === 'custom' && !formData.cronExpression) { toast({ title: "Validation Error", description: "Cron expression is required", variant: "destructive" }); return; }

    onTaskCreated?.({ id: `SCHED-${Date.now()}`, ...formData, createdAt: new Date().toISOString(), createdBy: 'current-user@company.com', status: 'pending', runCount: 0 });
    toast({ title: "Scheduled Task Created", description: `"${formData.name}" has been scheduled successfully` });
    onOpenChange(false);
    setFormData({ name: '', description: '', type: 'provisioning', frequency: 'daily', time: '02:00', timezone: 'UTC', date: '', cronExpression: '', runImmediately: false, targetApplication: '', targetIdentities: '', slaMinutes: '60', retryAttempts: '3', notificationEmails: '', enabled: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl flex flex-col p-0 h-[90vh]">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle>Create Scheduled Task</DialogTitle>
              <DialogDescription>
                Schedule a new automated IGA task with custom configuration.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[calc(100%-44px)] pr-2">
                <TabsContent value="basic" className="space-y-6 mt-4">
                  <div>
                    <Label htmlFor="task-name">Task Name *</Label>
                    <Input id="task-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Daily AD User Import" />
                  </div>
                  <div>
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea id="task-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the purpose..." rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="task-type">Task Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger id="task-type"><SelectValue /></SelectTrigger>
                      <SelectContent>{taskTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="target-application">Target Application</Label>
                    <Input id="target-application" value={formData.targetApplication} onChange={(e) => setFormData({ ...formData, targetApplication: e.target.value })} placeholder="e.g., Active Directory, SAP" />
                  </div>
                  <div>
                    <Label htmlFor="target-identities">Target Identities</Label>
                    <Input id="target-identities" value={formData.targetIdentities} onChange={(e) => setFormData({ ...formData, targetIdentities: e.target.value })} placeholder="e.g., employees, contractors, all" />
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-6 mt-4">
                  <div>
                    <Label>Frequency *</Label>
                    <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{frequencies.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  {formData.frequency === 'one-time' && (
                    <div><Label>Date *</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} /></div>
                  )}
                  {formData.frequency === 'custom' && (
                    <div><Label>Cron Expression *</Label><Input value={formData.cronExpression} onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })} placeholder="e.g., 0 2 * * *" /></div>
                  )}
                  <div><Label>Time *</Label><Input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} /></div>
                  <div>
                    <Label>Timezone *</Label>
                    <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{timezones.map(tz => <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="run-immediately" checked={formData.runImmediately} onCheckedChange={(checked) => setFormData({ ...formData, runImmediately: checked })} />
                    <Label htmlFor="run-immediately" className="cursor-pointer">Run immediately after creation</Label>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6 mt-4">
                  <div><Label>SLA (minutes)</Label><Input type="number" value={formData.slaMinutes} onChange={(e) => setFormData({ ...formData, slaMinutes: e.target.value })} /><p className="text-sm text-muted-foreground mt-1">Maximum time allowed for completion</p></div>
                  <div><Label>Retry Attempts</Label><Input type="number" value={formData.retryAttempts} onChange={(e) => setFormData({ ...formData, retryAttempts: e.target.value })} /></div>
                  <div><Label>Notification Emails</Label><Input value={formData.notificationEmails} onChange={(e) => setFormData({ ...formData, notificationEmails: e.target.value })} placeholder="admin@company.com" /></div>
                  <div className="flex items-center space-x-2">
                    <Switch id="enabled" checked={formData.enabled} onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })} />
                    <Label htmlFor="enabled" className="cursor-pointer">Enable task after creation</Label>
                  </div>
                  <div className="bg-muted p-4 rounded-lg flex items-start space-x-3 border">
                    <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">Task Execution Notes</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Tasks will execute in the specified timezone</li>
                        <li>Failed tasks will be retried automatically</li>
                        <li>Notification emails will receive failure and SLA breach alerts</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
          <div className="flex-shrink-0 px-6 py-4">
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Create Scheduled Task</Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
