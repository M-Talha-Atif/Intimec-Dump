import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TaskSettings } from '../data/taskSettingsData';

interface IntegrationSettingsProps {
  settings: TaskSettings;
  setSettings: (settings: TaskSettings) => void;
}

export const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ settings, setSettings }) => {
  return (
    <div className="space-y-4 mt-4">
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
    </div>
  );
};
