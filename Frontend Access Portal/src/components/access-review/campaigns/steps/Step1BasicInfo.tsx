import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Shield, Server, Key, AlertTriangle, GitMerge, Repeat, Activity, FileText } from 'lucide-react';
import { complianceFrameworks, mockManagers } from '@/data/mock-iga-entities';
import { CampaignWizardData } from '../CampaignCreationWizard';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

interface Step1Props {
  data: CampaignWizardData;
  updateData: (updates: Partial<CampaignWizardData>) => void;
  templates: Array<{ id: string; name: string; description: string; defaults: any }>;
}

const Step1BasicInfo = ({ data, updateData, templates }: Step1Props) => {
  const campaignTypes = [
    { value: 'user-based', label: 'User-based', icon: Users, description: 'Review user access & entitlements' },
    { value: 'role-based', label: 'Role-based', icon: Shield, description: 'Review role memberships' },
    { value: 'application-based', label: 'Application', icon: Server, description: 'Review app access' },
    { value: 'entitlement-based', label: 'Entitlement', icon: Key, description: 'Review specific entitlements' },
    { value: 'sod-based', label: 'SoD Review', icon: AlertTriangle, description: 'Review SoD violations' },
    { value: 'event-driven', label: 'Event-driven', icon: Activity, description: 'Lifecycle event reviews' },
    { value: 'hybrid', label: 'Hybrid', icon: GitMerge, description: 'Multiple types combined' },
    { value: 'continuous', label: 'Continuous', icon: Repeat, description: 'Ongoing monitoring' },
  ];

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      updateData({ template: templateId, ...template.defaults });
    } else {
      updateData({ template: '' });
    }
  };

  const toggleComplianceFramework = (framework: string) => {
    const current = data.complianceFrameworks || [];
    const updated = current.includes(framework)
      ? current.filter(f => f !== framework)
      : [...current, framework];
    updateData({ complianceFrameworks: updated });
  };

  return (
    <div className="space-y-5">
      {/* Template Selection */}
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-dashed border-border">
        <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
        <div className="flex-1">
          <Select value={data.template} onValueChange={applyTemplate}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Start from a template (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No template</SelectItem>
              {templates.map(t => (
                <SelectItem key={t.id} value={t.id}>
                  <div>
                    <span className="font-medium">{t.name}</span>
                    <span className="text-muted-foreground ml-2 text-xs">— {t.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Name & Description */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Campaign Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Q1 2024 User Access Review"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the purpose and scope of this campaign..."
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            rows={2}
          />
        </div>
      </div>

      {/* Owner & Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label>Campaign Owner *</Label>
            <InfoTooltip text="The person accountable for this campaign's completion and compliance outcomes" />
          </div>
          <Select value={data.owner} onValueChange={(v) => updateData({ owner: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select owner" />
            </SelectTrigger>
            <SelectContent>
              {mockManagers.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name} — {m.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label>Priority</Label>
            <InfoTooltip text="Determines notification urgency and SLA enforcement strictness" />
          </div>
          <Select value={data.priority} onValueChange={(v: any) => updateData({ priority: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campaign Type */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Label>Campaign Type *</Label>
          <InfoTooltip text="Determines what entities are reviewed and which scope filters are available" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {campaignTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => updateData({ campaignType: type.value })}
                className={`flex flex-col items-center p-3 border rounded-lg text-center transition-all ${
                  data.campaignType === type.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon className={`h-5 w-5 mb-1.5 ${data.campaignType === type.value ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="font-medium text-xs">{type.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{type.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Risk Threshold & Compliance */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label>Risk Threshold</Label>
            <InfoTooltip text="Only items at or above this risk level will be included in the review scope" />
          </div>
          <Select value={data.riskThreshold} onValueChange={(v) => updateData({ riskThreshold: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low & Above (All items)</SelectItem>
              <SelectItem value="medium">Medium & Above</SelectItem>
              <SelectItem value="high">High Only</SelectItem>
              <SelectItem value="critical">Critical Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label>Recurrence</Label>
            <InfoTooltip text="Automatically recreate this campaign on a recurring schedule" />
          </div>
          <Select
            value={data.recurrence.frequency}
            onValueChange={(v: any) => updateData({ recurrence: { ...data.recurrence, enabled: v !== 'none', frequency: v } })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">One-time</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {data.recurrence.enabled && (
        <div className="ml-0 space-y-2">
          <Label htmlFor="recurrence-end">Recurrence End Date</Label>
          <Input
            id="recurrence-end"
            type="date"
            value={data.recurrence.endDate}
            onChange={(e) => updateData({ recurrence: { ...data.recurrence, endDate: e.target.value } })}
            className="w-48"
          />
        </div>
      )}

      {/* Compliance Frameworks */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label>Compliance Frameworks</Label>
          <InfoTooltip text="Tag this campaign with applicable regulatory frameworks for audit trails and reporting" />
        </div>
        <div className="flex flex-wrap gap-2">
          {complianceFrameworks.map((framework) => (
            <Badge
              key={framework.id}
              variant={data.complianceFrameworks?.includes(framework.id) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleComplianceFramework(framework.id)}
            >
              {framework.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;
