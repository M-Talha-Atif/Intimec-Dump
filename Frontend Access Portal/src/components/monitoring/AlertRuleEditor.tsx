import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AlertRule {
  name: string;
  type: string;
  metric: string;
  operator: string;
  threshold: string;
  severity: string;
  enabled: boolean;
  channels: string[];
}

interface AlertRuleEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingRule?: { name: string; type: string; condition: string; enabled: boolean; notifications: string[] } | null;
}

export const AlertRuleEditor = ({ open, onOpenChange, existingRule }: AlertRuleEditorProps) => {
  const [rule, setRule] = useState<AlertRule>({
    name: existingRule?.name || '',
    type: existingRule?.type || 'Threshold',
    metric: '',
    operator: '>',
    threshold: '',
    severity: 'medium',
    enabled: existingRule?.enabled ?? true,
    channels: existingRule?.notifications || ['Email'],
  });

  const handleSave = () => {
    if (!rule.name) { toast.error('Rule name is required'); return; }
    toast.success(existingRule ? 'Alert rule updated' : 'Alert rule created');
    onOpenChange(false);
  };

  const toggleChannel = (ch: string) => {
    setRule(prev => ({
      ...prev,
      channels: prev.channels.includes(ch) ? prev.channels.filter(c => c !== ch) : [...prev.channels, ch],
    }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] flex flex-col p-0 h-full">
        <div className="flex-shrink-0 px-6 py-4">
          <SheetHeader className="space-y-1">
            <SheetTitle>{existingRule ? 'Edit Alert Rule' : 'New Alert Rule'}</SheetTitle>
            <SheetDescription>Configure conditions, thresholds, and notification channels.</SheetDescription>
          </SheetHeader>
        </div>
        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-6">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input value={rule.name} onChange={e => setRule(p => ({ ...p, name: e.target.value }))} placeholder="e.g., High Error Rate Alert" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Alert Type</Label>
                <Select value={rule.type} onValueChange={v => setRule(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Threshold">Threshold</SelectItem>
                    <SelectItem value="Availability">Availability</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="Anomaly">Anomaly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={rule.severity} onValueChange={v => setRule(p => ({ ...p, severity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Condition Builder */}
            <div className="space-y-2">
              <Label>Condition</Label>
              <div className="flex items-center gap-2">
                <Select value={rule.metric} onValueChange={v => setRule(p => ({ ...p, metric: v }))}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select metric" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="error_rate">Error Rate</SelectItem>
                    <SelectItem value="job_failure_rate">Job Failure Rate</SelectItem>
                    <SelectItem value="connector_uptime">Connector Uptime</SelectItem>
                    <SelectItem value="sync_latency">Sync Latency</SelectItem>
                    <SelectItem value="sod_violations">SoD Violations</SelectItem>
                    <SelectItem value="provisioning_queue">Provisioning Queue Size</SelectItem>
                    <SelectItem value="sla_compliance">SLA Compliance</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={rule.operator} onValueChange={v => setRule(p => ({ ...p, operator: v }))}>
                  <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value=">">{'>'}</SelectItem>
                    <SelectItem value="<">{'<'}</SelectItem>
                    <SelectItem value=">=">{'≥'}</SelectItem>
                    <SelectItem value="<=">{'≤'}</SelectItem>
                    <SelectItem value="==">{'='}</SelectItem>
                  </SelectContent>
                </Select>
                <Input className="w-28" value={rule.threshold} onChange={e => setRule(p => ({ ...p, threshold: e.target.value }))} placeholder="Value" />
              </div>
            </div>

            {/* Notification Channels */}
            <div className="space-y-2">
              <Label>Notification Channels</Label>
              <div className="flex flex-wrap gap-2">
                {['Email', 'Slack', 'Teams', 'Webhook', 'PagerDuty', 'SMS'].map(ch => (
                  <Badge
                    key={ch}
                    variant={rule.channels.includes(ch) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleChannel(ch)}
                  >
                    {ch}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Enable/Disable */}
            <div className="flex items-center gap-3">
              <Switch checked={rule.enabled} onCheckedChange={v => setRule(p => ({ ...p, enabled: v }))} />
              <Label>Rule Enabled</Label>
            </div>
          </div>
        </ScrollArea>
        <div className="flex-shrink-0 px-6 py-4 flex items-center gap-3">
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" /> {existingRule ? 'Update Rule' : 'Create Rule'}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
