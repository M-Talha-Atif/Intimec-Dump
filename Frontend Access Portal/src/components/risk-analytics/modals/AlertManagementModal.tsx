import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Plus, Trash2, Mail, MessageSquare, Webhook, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'greater' | 'less' | 'equal';
  threshold: number;
  channels: string[];
  recipients: string[];
  enabled: boolean;
}

interface AlertManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertManagementModal: React.FC<AlertManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [rules, setRules] = useState<AlertRule[]>([
    {
      id: '1',
      name: 'Critical Risk Threshold',
      metric: 'critical_risks',
      condition: 'greater',
      threshold: 25,
      channels: ['email', 'slack'],
      recipients: ['security@company.com'],
      enabled: true
    },
    {
      id: '2',
      name: 'SoD Violation Alert',
      metric: 'sod_violations',
      condition: 'greater',
      threshold: 10,
      channels: ['email'],
      recipients: ['compliance@company.com'],
      enabled: true
    }
  ]);

  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    name: '',
    metric: 'critical_risks',
    condition: 'greater',
    threshold: 20,
    channels: [],
    recipients: [],
    enabled: true
  });

  const [notificationChannels, setNotificationChannels] = useState({
    email: { enabled: true, configured: true },
    slack: { enabled: true, configured: false },
    teams: { enabled: false, configured: false },
    webhook: { enabled: false, configured: false }
  });

  const handleAddRule = () => {
    if (!newRule.name || !newRule.recipients || newRule.recipients.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide rule name and at least one recipient.",
        variant: "destructive"
      });
      return;
    }

    const rule: AlertRule = {
      id: Date.now().toString(),
      name: newRule.name!,
      metric: newRule.metric!,
      condition: newRule.condition!,
      threshold: newRule.threshold!,
      channels: newRule.channels!,
      recipients: newRule.recipients!,
      enabled: newRule.enabled!
    };

    setRules([...rules, rule]);
    setNewRule({
      name: '',
      metric: 'critical_risks',
      condition: 'greater',
      threshold: 20,
      channels: [],
      recipients: [],
      enabled: true
    });

    toast({
      title: "Alert Rule Created",
      description: `${rule.name} has been added successfully.`
    });
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
    toast({
      title: "Alert Rule Deleted",
      description: "The alert rule has been removed."
    });
  };

  const handleToggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleTestAlert = () => {
    toast({
      title: "Test Alert Sent",
      description: "Check your configured notification channels."
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Alert Management</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="rules" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rules">Alert Rules</TabsTrigger>
            <TabsTrigger value="channels">Notification Channels</TabsTrigger>
            <TabsTrigger value="history">Alert History</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4">
            <TabsContent value="rules" className="space-y-4 mt-0">
              {/* Existing Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active Alert Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {rules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{rule.name}</span>
                          {rule.enabled ? (
                            <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-700">
                              Disabled
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Alert when {rule.metric.replace('_', ' ')} is {rule.condition} than {rule.threshold}
                        </p>
                        <div className="flex space-x-2 mt-2">
                          {rule.channels.map((channel) => (
                            <Badge key={channel} variant="secondary" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => handleToggleRule(rule.id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Create New Rule */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Create New Alert Rule</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rule Name</Label>
                    <Input
                      placeholder="e.g., High Risk Alert"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Metric</Label>
                      <Select
                        value={newRule.metric}
                        onValueChange={(value) => setNewRule({ ...newRule, metric: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical_risks">Critical Risks</SelectItem>
                          <SelectItem value="sod_violations">SoD Violations</SelectItem>
                          <SelectItem value="orphan_accounts">Orphan Accounts</SelectItem>
                          <SelectItem value="excessive_access">Excessive Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Condition</Label>
                      <Select
                        value={newRule.condition}
                        onValueChange={(value: any) => setNewRule({ ...newRule, condition: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="greater">Greater than</SelectItem>
                          <SelectItem value="less">Less than</SelectItem>
                          <SelectItem value="equal">Equal to</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Threshold</Label>
                      <Input
                        type="number"
                        value={newRule.threshold}
                        onChange={(e) => setNewRule({ ...newRule, threshold: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Recipients (comma-separated emails)</Label>
                    <Input
                      placeholder="user@example.com, team@example.com"
                      onChange={(e) => setNewRule({ ...newRule, recipients: e.target.value.split(',').map(r => r.trim()) })}
                    />
                  </div>

                  <Button onClick={handleAddRule} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Alert Rule
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="channels" className="space-y-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Notification Channels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(notificationChannels).map(([channel, config]) => (
                    <div key={channel} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {channel === 'email' && <Mail className="h-5 w-5" />}
                        {channel === 'slack' && <MessageSquare className="h-5 w-5" />}
                        {channel === 'teams' && <MessageSquare className="h-5 w-5" />}
                        {channel === 'webhook' && <Webhook className="h-5 w-5" />}
                        <div>
                          <div className="font-medium capitalize">{channel}</div>
                          <div className="text-xs text-muted-foreground">
                            {config.configured ? (
                              <span className="text-green-600 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Configured
                              </span>
                            ) : (
                              <span className="text-orange-600">Not configured</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!config.configured && (
                          <Button variant="outline" size="sm">Configure</Button>
                        )}
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={(checked) =>
                            setNotificationChannels({
                              ...notificationChannels,
                              [channel]: { ...config, enabled: checked }
                            })
                          }
                          disabled={!config.configured}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button onClick={handleTestAlert} variant="outline" className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                Send Test Alert
              </Button>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>No recent alerts triggered.</p>
                    <p>Configure alert rules and notification channels to get started.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
