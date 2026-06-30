import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle } from 'lucide-react';
import { ScheduledTaskForm } from '../data/scheduledTaskData';

interface AdvancedTabProps {
  formData: ScheduledTaskForm;
  updateFormData: (updates: Partial<ScheduledTaskForm>) => void;
}

export const AdvancedTab: React.FC<AdvancedTabProps> = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label htmlFor="sla-minutes">SLA (minutes)</Label>
        <Input
          id="sla-minutes"
          type="number"
          value={formData.slaMinutes}
          onChange={(e) => updateFormData({ slaMinutes: e.target.value })}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Maximum time allowed for task completion
        </p>
      </div>

      <div>
        <Label htmlFor="retry-attempts">Retry Attempts</Label>
        <Input
          id="retry-attempts"
          type="number"
          value={formData.retryAttempts}
          onChange={(e) => updateFormData({ retryAttempts: e.target.value })}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Number of automatic retry attempts on failure
        </p>
      </div>

      <div>
        <Label htmlFor="notification-emails">Notification Emails (comma-separated)</Label>
        <Input
          id="notification-emails"
          value={formData.notificationEmails}
          onChange={(e) => updateFormData({ notificationEmails: e.target.value })}
          placeholder="admin@company.com, ops@company.com"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="enabled"
          checked={formData.enabled}
          onCheckedChange={(checked) => updateFormData({ enabled: checked })}
        />
        <Label htmlFor="enabled" className="cursor-pointer">
          Enable task after creation
        </Label>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">Task Execution Notes</p>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li>Tasks will execute in the specified timezone</li>
            <li>Failed tasks will be retried automatically based on retry settings</li>
            <li>Notification emails will receive alerts for task failures and SLA breaches</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
