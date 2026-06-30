import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskSettings } from '../data/taskSettingsData';

interface DisplaySettingsProps {
  settings: TaskSettings;
  setSettings: (settings: TaskSettings) => void;
}

export const DisplaySettings: React.FC<DisplaySettingsProps> = ({ settings, setSettings }) => {
  return (
    <div className="space-y-4 mt-4">
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
    </div>
  );
};
