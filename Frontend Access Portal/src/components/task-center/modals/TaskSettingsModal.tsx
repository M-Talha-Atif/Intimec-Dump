import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Bell, Clock, Database, RefreshCw } from 'lucide-react';

interface TaskSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskSettingsModal: React.FC<TaskSettingsModalProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // SLA Settings
    defaultSlaMinutes: '60',
    escalationThresholdMinutes: '30',
    autoEscalate: true,
    escalationEmail: 'ops-team@company.com',
    
    // Notification Settings
    emailNotifications: true,
    webhookNotifications: false,
    webhookUrl: '',
    notifyOnSuccess: false,
    notifyOnFailure: true,
    notifyOnEscalation: true,
    
    // Retention Settings
    retainCompletedDays: '30',
    retainFailedDays: '90',
    autoArchive: true,
    
    // Retry Settings
    autoRetryEnabled: true,
    maxRetryAttempts: '3',
    retryIntervalMinutes: '5',
    exponentialBackoff: true,
    
    // Display Settings
    refreshInterval: '30',
    autoRefresh: true,
    defaultView: 'all',
    rowsPerPage: '25',
    showCompletedTasks: true,
    
    // Integration Settings
    prometheusEndpoint: '',
    datadogApiKey: '',
    splunkHecUrl: ''
  });

  const handleSave = () => {
    // Save settings logic here
    toast({
      title: "Settings Saved",
      description: "Your task center settings have been updated successfully"
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <Settings className="h-5 w-5" /> */}
            Task Center Settings
          </DialogTitle>
          <DialogDescription>
            Configure SLA rules, notifications, retention policies, and integrations
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="sla" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sla">SLA</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="sla" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="default-sla">Default SLA (minutes)</Label>
              <Input
                id="default-sla"
                type="number"
                value={settings.defaultSlaMinutes}
                onChange={(e) => setSettings({ ...settings, defaultSlaMinutes: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Default time limit for task completion
              </p>
            </div>

            <div>
              <Label htmlFor="escalation-threshold">Escalation Threshold (minutes)</Label>
              <Input
                id="escalation-threshold"
                type="number"
                value={settings.escalationThresholdMinutes}
                onChange={(e) => setSettings({ ...settings, escalationThresholdMinutes: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Time before SLA breach to trigger escalation warnings
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-escalate">Auto-Escalate Tasks</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically escalate tasks approaching SLA breach
                </p>
              </div>
              <Switch
                id="auto-escalate"
                checked={settings.autoEscalate}
                onCheckedChange={(checked) => setSettings({ ...settings, autoEscalate: checked })}
              />
            </div>

            <div>
              <Label htmlFor="escalation-email">Escalation Email</Label>
              <Input
                id="escalation-email"
                type="email"
                value={settings.escalationEmail}
                onChange={(e) => setSettings({ ...settings, escalationEmail: e.target.value })}
              />
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email alerts for task events
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="webhook-notifications">Webhook Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send webhook payloads to external systems
                </p>
              </div>
              <Switch
                id="webhook-notifications"
                checked={settings.webhookNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, webhookNotifications: checked })}
              />
            </div>

            {settings.webhookNotifications && (
              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={settings.webhookUrl}
                  onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                  placeholder="https://your-webhook-endpoint.com/tasks"
                />
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Label>Notification Triggers</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm">Task Success</span>
                <Switch
                  checked={settings.notifyOnSuccess}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifyOnSuccess: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Task Failure</span>
                <Switch
                  checked={settings.notifyOnFailure}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifyOnFailure: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Task Escalation</span>
                <Switch
                  checked={settings.notifyOnEscalation}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifyOnEscalation: checked })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="retention" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="retain-completed">Retain Completed Tasks (days)</Label>
              <Input
                id="retain-completed"
                type="number"
                value={settings.retainCompletedDays}
                onChange={(e) => setSettings({ ...settings, retainCompletedDays: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-1">
                How long to keep completed task records
              </p>
            </div>

            <div>
              <Label htmlFor="retain-failed">Retain Failed Tasks (days)</Label>
              <Input
                id="retain-failed"
                type="number"
                value={settings.retainFailedDays}
                onChange={(e) => setSettings({ ...settings, retainFailedDays: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-1">
                How long to keep failed task records
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-archive">Auto-Archive Old Tasks</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically archive tasks after retention period
                </p>
              </div>
              <Switch
                id="auto-archive"
                checked={settings.autoArchive}
                onCheckedChange={(checked) => setSettings({ ...settings, autoArchive: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-retry">Auto-Retry Failed Tasks</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically retry failed tasks
                </p>
              </div>
              <Switch
                id="auto-retry"
                checked={settings.autoRetryEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, autoRetryEnabled: checked })}
              />
            </div>

            {settings.autoRetryEnabled && (
              <>
                <div>
                  <Label htmlFor="max-retry">Max Retry Attempts</Label>
                  <Input
                    id="max-retry"
                    type="number"
                    value={settings.maxRetryAttempts}
                    onChange={(e) => setSettings({ ...settings, maxRetryAttempts: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="retry-interval">Retry Interval (minutes)</Label>
                  <Input
                    id="retry-interval"
                    type="number"
                    value={settings.retryIntervalMinutes}
                    onChange={(e) => setSettings({ ...settings, retryIntervalMinutes: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="exponential-backoff">Exponential Backoff</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase retry interval after each attempt
                    </p>
                  </div>
                  <Switch
                    id="exponential-backoff"
                    checked={settings.exponentialBackoff}
                    onCheckedChange={(checked) => setSettings({ ...settings, exponentialBackoff: checked })}
                  />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="display" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="refresh-interval">Auto-Refresh Interval (seconds)</Label>
              <Input
                id="refresh-interval"
                type="number"
                value={settings.refreshInterval}
                onChange={(e) => setSettings({ ...settings, refreshInterval: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-refresh">Enable Auto-Refresh</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically refresh task list
                </p>
              </div>
              <Switch
                id="auto-refresh"
                checked={settings.autoRefresh}
                onCheckedChange={(checked) => setSettings({ ...settings, autoRefresh: checked })}
              />
            </div>

            <div>
              <Label htmlFor="default-view">Default View</Label>
              <Select value={settings.defaultView} onValueChange={(value) => setSettings({ ...settings, defaultView: value })}>
                <SelectTrigger id="default-view">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="pending">Pending Only</SelectItem>
                  <SelectItem value="running">Running Only</SelectItem>
                  <SelectItem value="failed">Failed Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rows-per-page">Rows Per Page</Label>
              <Select value={settings.rowsPerPage} onValueChange={(value) => setSettings({ ...settings, rowsPerPage: value })}>
                <SelectTrigger id="rows-per-page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-completed">Show Completed Tasks</Label>
                <p className="text-sm text-muted-foreground">
                  Display completed tasks in the list
                </p>
              </div>
              <Switch
                id="show-completed"
                checked={settings.showCompletedTasks}
                onCheckedChange={(checked) => setSettings({ ...settings, showCompletedTasks: checked })}
              />
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="prometheus">Prometheus Endpoint</Label>
              <Input
                id="prometheus"
                value={settings.prometheusEndpoint}
                onChange={(e) => setSettings({ ...settings, prometheusEndpoint: e.target.value })}
                placeholder="http://prometheus:9090/api/v1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Export task metrics to Prometheus
              </p>
            </div>

            <div>
              <Label htmlFor="datadog">Datadog API Key</Label>
              <Input
                id="datadog"
                type="password"
                value={settings.datadogApiKey}
                onChange={(e) => setSettings({ ...settings, datadogApiKey: e.target.value })}
                placeholder="Enter Datadog API key"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Send task events to Datadog
              </p>
            </div>

            <div>
              <Label htmlFor="splunk">Splunk HEC URL</Label>
              <Input
                id="splunk"
                value={settings.splunkHecUrl}
                onChange={(e) => setSettings({ ...settings, splunkHecUrl: e.target.value })}
                placeholder="https://splunk:8088/services/collector"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Forward task logs to Splunk
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
