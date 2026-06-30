import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CampaignWizardData } from '../CampaignCreationWizard';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

interface Step4Props {
  data: CampaignWizardData;
  updateData: (updates: Partial<CampaignWizardData>) => void;
}

const Step4Configuration = ({ data, updateData }: Step4Props) => {
  const updateConfig = (key: string, value: any) => {
    updateData({ configuration: { ...data.configuration, [key]: value } });
  };

  const updateAutoApprove = (key: string, value: any) => {
    updateData({ configuration: { ...data.configuration, autoApproveRules: { ...data.configuration.autoApproveRules, [key]: value } } });
  };

  const updateException = (key: string, value: any) => {
    updateData({ configuration: { ...data.configuration, exceptionHandling: { ...data.configuration.exceptionHandling, [key]: value } } });
  };

  const toggleDecision = (decision: string) => {
    const current = data.configuration.decisionOptions || [];
    const updated = current.includes(decision) ? current.filter(d => d !== decision) : [...current, decision];
    updateConfig('decisionOptions', updated);
  };

  const toggleNotification = (channel: string) => {
    const current = data.configuration.notificationChannels || [];
    const updated = current.includes(channel) ? current.filter(c => c !== channel) : [...current, channel];
    updateConfig('notificationChannels', updated);
  };

  return (
    <div className="space-y-4">
      {/* Timeline & SLA */}
      <Card className="p-4">
        <div className="flex items-center gap-1.5 mb-4">
          <Label className="text-base">Timeline & SLA</Label>
          <InfoTooltip text="Define when the campaign starts and ends, and the per-item SLA for individual reviewer decisions" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input id="start-date" type="date" value={data.configuration.startDate} onChange={(e) => updateConfig('startDate', e.target.value)} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due-date">Due Date *</Label>
            <Input id="due-date" type="date" value={data.configuration.dueDate} onChange={(e) => updateConfig('dueDate', e.target.value)} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="sla">SLA (hours)</Label>
              <InfoTooltip text="Maximum time allowed for each individual review decision before escalation triggers" />
            </div>
            <div className="flex items-center gap-2">
              <Input id="sla" type="number" value={data.configuration.slaHours} onChange={(e) => updateConfig('slaHours', parseInt(e.target.value))} min={1} className="w-24" />
              <span className="text-xs text-muted-foreground">{Math.floor(data.configuration.slaHours / 24)}d {data.configuration.slaHours % 24}h</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Decision Options */}
      <Card className="p-4">
        <div className="flex items-center gap-1.5 mb-4">
          <Label className="text-base">Decision Options</Label>
          <InfoTooltip text="Configure which actions reviewers can take on each review item and justification requirements" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Allowed Decisions</Label>
            <div className="flex flex-wrap gap-4">
              {[
                { id: 'approve', label: 'Approve' },
                { id: 'revoke', label: 'Revoke' },
                { id: 'modify', label: 'Modify' },
                { id: 'flag', label: 'Flag for Review' },
              ].map(d => (
                <div key={d.id} className="flex items-center space-x-1.5">
                  <Checkbox id={`decision-${d.id}`} checked={data.configuration.decisionOptions?.includes(d.id)} onCheckedChange={() => toggleDecision(d.id)} />
                  <Label htmlFor={`decision-${d.id}`} className="font-normal text-sm">{d.label}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Require Justification</Label>
              <Select value={data.configuration.requireJustification} onValueChange={(v: any) => updateConfig('requireJustification', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">For all decisions</SelectItem>
                  <SelectItem value="revoke">For revoke only</SelectItem>
                  <SelectItem value="approve">For approve only</SelectItem>
                  <SelectItem value="none">Not required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between pt-6">
              <Label htmlFor="bulk-actions" className="font-normal text-sm">Allow Bulk Actions</Label>
              <Switch id="bulk-actions" checked={data.configuration.allowBulkActions} onCheckedChange={(c) => updateConfig('allowBulkActions', c)} />
            </div>
          </div>
        </div>
      </Card>

      {/* Automation Rules */}
      <Card className="p-4">
        <div className="flex items-center gap-1.5 mb-4">
          <Label className="text-base">Automation Rules</Label>
          <InfoTooltip text="Configure AI-driven automation to accelerate low-risk reviews while maintaining governance controls" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-approve" className="font-normal">Auto-approve Low-risk Items</Label>
              <p className="text-xs text-muted-foreground">Automatically approve items below risk threshold</p>
            </div>
            <Switch id="auto-approve" checked={data.configuration.autoApproveRules.enabled} onCheckedChange={(c) => updateAutoApprove('enabled', c)} />
          </div>
          {data.configuration.autoApproveRules.enabled && (
            <div className="ml-6 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Risk threshold (score ≤)</Label>
                <Input type="number" value={data.configuration.autoApproveRules.riskThreshold} onChange={(e) => updateAutoApprove('riskThreshold', parseInt(e.target.value))} min={0} max={100} className="w-24" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">AI confidence (≥)</Label>
                <div className="flex items-center gap-2">
                  <Slider value={[data.configuration.autoApproveRules.confidenceThreshold]} onValueChange={(v) => updateAutoApprove('confidenceThreshold', v[0])} min={50} max={99} step={5} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-10">{data.configuration.autoApproveRules.confidenceThreshold}%</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-ai" className="font-normal">AI Recommendations</Label>
              <p className="text-xs text-muted-foreground">Show AI-powered decision suggestions to reviewers</p>
            </div>
            <Switch id="enable-ai" checked={data.configuration.enableAI} onCheckedChange={(c) => updateConfig('enableAI', c)} />
          </div>
          {data.configuration.enableAI && (
            <div className="ml-6 space-y-2">
              <Label className="text-sm">Confidence threshold: {data.configuration.aiConfidenceThreshold}%</Label>
              <Slider value={[data.configuration.aiConfidenceThreshold]} onValueChange={(v) => updateConfig('aiConfidenceThreshold', v[0])} min={50} max={95} step={5} className="w-full" />
              <p className="text-xs text-muted-foreground">Only show suggestions above this confidence level</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="simulation" className="font-normal">Pre-Review Simulation</Label>
              <p className="text-xs text-muted-foreground">Test campaign before full launch</p>
            </div>
            <Switch id="simulation" checked={data.configuration.enableSimulation} onCheckedChange={(c) => updateConfig('enableSimulation', c)} />
          </div>
        </div>
      </Card>

      {/* Exception Handling */}
      <Card className="p-4">
        <div className="flex items-center gap-1.5 mb-4">
          <Label className="text-base">Exception Handling</Label>
          <InfoTooltip text="Allow reviewers to grant temporary exceptions instead of permanent approve/revoke decisions" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="exceptions" className="font-normal">Allow Exceptions</Label>
              <p className="text-xs text-muted-foreground">Permit time-limited access exceptions</p>
            </div>
            <Switch id="exceptions" checked={data.configuration.exceptionHandling.enabled} onCheckedChange={(c) => updateException('enabled', c)} />
          </div>
          {data.configuration.exceptionHandling.enabled && (
            <div className="ml-6 grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Max exception period (days)</Label>
                <Input type="number" value={data.configuration.exceptionHandling.maxDays} onChange={(e) => updateException('maxDays', parseInt(e.target.value))} min={1} max={365} className="w-24" />
              </div>
              <div className="flex items-center justify-between pt-5">
                <Label htmlFor="exception-approval" className="font-normal text-sm">Require manager approval</Label>
                <Switch id="exception-approval" checked={data.configuration.exceptionHandling.requireApproval} onCheckedChange={(c) => updateException('requireApproval', c)} />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-4">
        <div className="flex items-center gap-1.5 mb-4">
          <Label className="text-base">Notifications</Label>
          <InfoTooltip text="Select channels for campaign notifications, reminders, and escalation alerts" />
        </div>
        <div className="flex flex-wrap gap-4">
          {[
            { id: 'email', label: 'Email' },
            { id: 'slack', label: 'Slack' },
            { id: 'teams', label: 'Microsoft Teams' },
            { id: 'in-app', label: 'In-app' },
          ].map(ch => (
            <div key={ch.id} className="flex items-center space-x-1.5">
              <Checkbox id={`notif-${ch.id}`} checked={data.configuration.notificationChannels?.includes(ch.id)} onCheckedChange={() => toggleNotification(ch.id)} />
              <Label htmlFor={`notif-${ch.id}`} className="font-normal text-sm">{ch.label}</Label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Step4Configuration;
