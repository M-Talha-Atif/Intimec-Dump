import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TaskSettings } from '../data/taskSettingsData';

interface SLASettingsProps {
  settings: TaskSettings;
  setSettings: (settings: TaskSettings) => void;
}

export const SLASettings: React.FC<SLASettingsProps> = ({ settings, setSettings }) => {
  return (
    <div className="space-y-4 mt-4">
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
    </div>
  );
};
