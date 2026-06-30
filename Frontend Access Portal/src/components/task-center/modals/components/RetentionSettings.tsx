import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TaskSettings } from '../data/taskSettingsData';

interface RetentionSettingsProps {
  settings: TaskSettings;
  setSettings: (settings: TaskSettings) => void;
}

export const RetentionSettings: React.FC<RetentionSettingsProps> = ({ settings, setSettings }) => {
  return (
    <div className="space-y-4 mt-4">
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
    </div>
  );
};
