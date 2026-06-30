import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, AlertTriangle, Settings, Plus, Eye } from 'lucide-react';
import { useSearchParams } from "next/navigation";
import { useEffect } from 'react';
import { AlertRuleEditor } from './AlertRuleEditor';
import { EventDetailDrawer } from './EventDetailDrawer';
import { monitoringEvents } from './data/monitoring-data';
import { toast } from 'sonner';

export const AlertsManager = () => {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [highlightedAlert, setHighlightedAlert] = useState<string | null>(null);
  const [ruleEditorOpen, setRuleEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [investigateEvent, setInvestigateEvent] = useState<any>(null);
  const searchParams = useSearchParams();

  const [activeAlerts, setActiveAlerts] = useState([
    { id: 'alert-001', type: 'threshold', severity: 'high', title: 'High Job Failure Rate', description: 'Salesforce connector has 15% failure rate in last hour', timestamp: '5 minutes ago', source: 'Salesforce Connector', threshold: '> 10% failure rate', currentValue: '15%', correlationId: 'req-372840', category: 'job-failure', acknowledged: false },
    { id: 'alert-002', type: 'availability', severity: 'medium', title: 'Connector Sync Delay', description: 'AD sync is taking longer than expected', timestamp: '12 minutes ago', source: 'Active Directory', threshold: '< 5s sync time', currentValue: '8.2s', correlationId: 'req-384721', category: 'sync-delay', acknowledged: false },
    { id: 'alert-003', type: 'compliance', severity: 'critical', title: 'SoD Policy Violations', description: '3 new segregation of duties violations detected', timestamp: '18 minutes ago', source: 'Policy Engine', threshold: '0 violations', currentValue: '3 violations', correlationId: 'req-398472', category: 'sod-violations', acknowledged: false },
  ]);

  const [alertRules, setAlertRules] = useState([
    { name: 'Job Failure Rate', type: 'Threshold', condition: 'Failure rate > 10%', enabled: true, notifications: ['Email', 'Slack'] },
    { name: 'Connector Downtime', type: 'Availability', condition: 'Uptime < 99%', enabled: true, notifications: ['Email', 'Teams'] },
    { name: 'SoD Violations', type: 'Compliance', condition: 'Any new violation', enabled: true, notifications: ['Email', 'Webhook'] },
    { name: 'Long Running Jobs', type: 'Performance', condition: 'Job duration > 10min', enabled: false, notifications: ['Email'] },
  ]);

  useEffect(() => {
    const alertType = searchParams.get('alertType');
    const correlationId = searchParams.get('correlationId');
    const shouldFocus = searchParams.get('focus');
    if (shouldFocus === 'true' && (alertType || correlationId)) {
      const matchingAlert = activeAlerts.find(alert =>
        (alertType && alert.category === alertType) || (correlationId && alert.correlationId === correlationId)
      );
      if (matchingAlert) {
        setHighlightedAlert(matchingAlert.id);
        setTimeout(() => { document.getElementById(`alert-${matchingAlert.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 500);
        setTimeout(() => setHighlightedAlert(null), 3000);
      }
    }
  }, [searchParams]);

  const handleAcknowledge = (alertId: string) => {
    setActiveAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    toast.success('Alert acknowledged');
  };

  const handleInvestigate = (alert: any) => {
    const related = monitoringEvents.find(e => e.application.toLowerCase().includes(alert.source.toLowerCase().split(' ')[0]));
    if (related) setInvestigateEvent(related);
  };

  const handleToggleRule = (index: number) => {
    setAlertRules(prev => prev.map((r, i) => i === index ? { ...r, enabled: !r.enabled } : r));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      default: return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Smart Alerts & Notifications
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} id="alerts-enabled" />
                <label htmlFor="alerts-enabled" className="text-sm font-medium">Alerts Enabled</label>
              </div>
              <Button size="sm" onClick={() => { setEditingRule(null); setRuleEditorOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> New Alert Rule
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Active Alerts ({activeAlerts.filter(a => !a.acknowledged).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                id={`alert-${alert.id}`}
                className={`p-4 border rounded-lg transition-all duration-300 ${getSeverityColor(alert.severity)} ${
                  alert.acknowledged ? 'opacity-50' : ''
                } ${highlightedAlert === alert.id ? 'ring-2 ring-primary ring-opacity-50 shadow-lg scale-[1.02]' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm opacity-90 mt-1">{alert.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {!alert.acknowledged && (
                      <Button variant="outline" size="sm" onClick={() => handleAcknowledge(alert.id)}>Acknowledge</Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleInvestigate(alert)}>Investigate</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm opacity-80">
                  <span>{alert.source} • {alert.timestamp}</span>
                  <span>Threshold: {alert.threshold} | Current: {alert.currentValue}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Alert Rules Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertRules.map((rule, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Switch checked={rule.enabled} onCheckedChange={() => handleToggleRule(index)} />
                  <div>
                    <h4 className="font-medium text-foreground">{rule.name}</h4>
                    <p className="text-sm text-muted-foreground">{rule.type} • {rule.condition}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">{rule.notifications.join(', ')}</div>
                  <Button variant="ghost" size="sm" onClick={() => { setEditingRule(rule); setRuleEditorOpen(true); }}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { name: 'Email', status: 'configured', description: 'admin@company.com' },
              { name: 'Slack', status: 'configured', description: '#iga-alerts' },
              { name: 'Microsoft Teams', status: 'not_configured', description: 'Not set up' },
              { name: 'Webhook', status: 'configured', description: 'https://webhook.site/...' },
            ].map((channel, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">{channel.name}</h4>
                  <Badge variant={channel.status === 'configured' ? 'default' : 'secondary'}>
                    {channel.status === 'configured' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{channel.description}</p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => toast.info(`${channel.name} configuration opened`)}>
                  {channel.status === 'configured' ? 'Configure' : 'Set Up'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertRuleEditor open={ruleEditorOpen} onOpenChange={setRuleEditorOpen} existingRule={editingRule} />
      <EventDetailDrawer open={!!investigateEvent} onOpenChange={open => { if (!open) setInvestigateEvent(null); }} event={investigateEvent} />
    </div>
  );
};
