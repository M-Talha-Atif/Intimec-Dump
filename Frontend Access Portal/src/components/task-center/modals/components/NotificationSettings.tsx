import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TaskSettings } from '../data/taskSettingsData';

interface NotificationSettingsProps {
  settings: TaskSettings;
  setSettings: (settings: TaskSettings) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ settings, setSettings }) => {
  return (
    <div className="space-y-4 mt-4">
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
    </div>
  );
};
