import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TrendingUp, ChevronDown, Search } from 'lucide-react';
import { CampaignWizardData } from '../CampaignCreationWizard';
import { scopeAnalysisService } from '@/services/scopeAnalysisService';
import { mockReviewers } from '@/data/mock-iga-entities';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

interface Step3Props {
  data: CampaignWizardData;
  updateData: (updates: Partial<CampaignWizardData>) => void;
}

const Step3Reviewers = ({ data, updateData }: Step3Props) => {
  const [suggestedReviewers, setSuggestedReviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionOpen, setSectionOpen] = useState({ assignment: true, workload: true, escalation: true });

  useEffect(() => { loadSuggestions(); }, [data.reviewerStrategy]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const suggestions = await scopeAnalysisService.suggestReviewers(
        { campaignType: data.campaignType, ...data.scopeConfig },
        data.reviewerStrategy
      );
      setSuggestedReviewers(suggestions);
    } catch (error) {
      console.error('Failed to load reviewer suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReviewer = (reviewerId: string) => {
    const current = data.selectedReviewers || [];
    const updated = current.includes(reviewerId)
      ? current.filter(id => id !== reviewerId)
      : [...current, reviewerId];
    updateData({ selectedReviewers: updated });
  };

  const updateConfig = (key: string, value: any) => {
    updateData({ reviewerConfig: { ...data.reviewerConfig, [key]: value } });
  };

  const toggleReminder = (day: number) => {
    const current = data.reviewerConfig.reminderSchedule || [];
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day].sort((a, b) => b - a);
    updateConfig('reminderSchedule', updated);
  };

  const filteredReviewers = mockReviewers.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const strategies = [
    { value: 'manager', label: 'Auto-assign to Manager', desc: "Each user's direct manager reviews their access" },
    { value: 'resource-owner', label: 'Auto-assign to Resource Owner', desc: 'Application/role owners review their resources' },
    { value: 'org-unit', label: 'Assign by Organizational Unit', desc: 'Map org units to specific reviewers' },
    { value: 'role', label: 'Assign by Role', desc: 'Map user roles to reviewers' },
    { value: 'custom', label: 'Custom Reviewer Pool', desc: 'Manually select and distribute to reviewers' },
  ];

  return (
    <div className="space-y-4">
      {/* Section 1: Assignment Strategy */}
      <Collapsible open={sectionOpen.assignment} onOpenChange={(o) => setSectionOpen(s => ({ ...s, assignment: o }))}>
        <Card className="p-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <Label className="text-base cursor-pointer">Reviewer Assignment Strategy</Label>
              <InfoTooltip text="Determines how review items are distributed to reviewers. Manager-based is most common for user access reviews." />
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${sectionOpen.assignment ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <RadioGroup value={data.reviewerStrategy} onValueChange={(v) => updateData({ reviewerStrategy: v })}>
              <div className="space-y-2">
                {strategies.map(s => (
                  <div key={s.value} className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors ${data.reviewerStrategy === s.value ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <RadioGroupItem value={s.value} id={s.value} />
                    <div className="flex-1">
                      <Label htmlFor={s.value} className="font-normal cursor-pointer">{s.label}</Label>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {data.reviewerStrategy === 'custom' && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Select Reviewers ({data.selectedReviewers?.length || 0} selected)</Label>
                  <Button variant="outline" size="sm" onClick={loadSuggestions}>
                    <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                    Suggest
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search reviewers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
                </div>
                {loading ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">Loading...</div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {filteredReviewers.map((reviewer) => {
                      const suggestion = suggestedReviewers.find(s => s.id === reviewer.id);
                      const isSelected = data.selectedReviewers?.includes(reviewer.id);
                      return (
                        <div key={reviewer.id} className={`flex items-center justify-between p-2.5 border rounded-lg text-sm ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}>
                          <div className="flex items-center gap-2.5">
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleReviewer(reviewer.id)} />
                            <div>
                              <p className="font-medium">{reviewer.name}</p>
                              <p className="text-xs text-muted-foreground">{reviewer.email}</p>
                            </div>
                          </div>
                          {suggestion && (
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="text-xs">~{suggestion.estimatedItems} items</Badge>
                              <Badge variant={suggestion.utilizationPercent > 80 ? 'destructive' : 'secondary'} className="text-xs">{suggestion.utilizationPercent}%</Badge>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Section 2: Workload & Delegation */}
      <Collapsible open={sectionOpen.workload} onOpenChange={(o) => setSectionOpen(s => ({ ...s, workload: o }))}>
        <Card className="p-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <Label className="text-base cursor-pointer">Workload & Delegation</Label>
              <InfoTooltip text="Control how review items are balanced across reviewers and whether delegation is permitted" />
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${sectionOpen.workload ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="load-balance" className="font-normal">Load Balancing</Label>
                <p className="text-xs text-muted-foreground">Distribute items evenly across reviewers</p>
              </div>
              <Switch id="load-balance" checked={data.reviewerConfig.loadBalancing} onCheckedChange={(c) => updateConfig('loadBalancing', c)} />
            </div>
            {data.reviewerConfig.loadBalancing && (
              <div className="ml-6 flex items-center gap-3">
                <Label htmlFor="max-items" className="text-sm whitespace-nowrap">Max items per reviewer</Label>
                <Input id="max-items" type="number" placeholder="50" value={data.reviewerConfig.maxItemsPerReviewer || ''} onChange={(e) => updateConfig('maxItemsPerReviewer', parseInt(e.target.value))} className="w-24" />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="delegation" className="font-normal">Enable Delegation</Label>
                <p className="text-xs text-muted-foreground">Allow reviewers to delegate items to others</p>
              </div>
              <Switch id="delegation" checked={data.reviewerConfig.enableDelegation} onCheckedChange={(c) => updateConfig('enableDelegation', c)} />
            </div>
            {data.reviewerConfig.enableDelegation && (
              <div className="ml-6 grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Delegate to</Label>
                  <Select value={data.reviewerConfig.delegationTarget} onValueChange={(v: any) => updateConfig('delegationTarget', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anyone">Anyone</SelectItem>
                      <SelectItem value="team">Team Members</SelectItem>
                      <SelectItem value="pool">Reviewer Pool</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Max delegation depth</Label>
                  <Select value={String(data.reviewerConfig.delegationMaxDepth)} onValueChange={(v) => updateConfig('delegationMaxDepth', parseInt(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 level</SelectItem>
                      <SelectItem value="2">2 levels</SelectItem>
                      <SelectItem value="3">3 levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="multi-level" className="font-normal">Multi-level Review</Label>
                <p className="text-xs text-muted-foreground">Require sequential approvals from multiple reviewers</p>
              </div>
              <Switch id="multi-level" checked={data.reviewerConfig.multiLevel} onCheckedChange={(c) => updateConfig('multiLevel', c)} />
            </div>
            {data.reviewerConfig.multiLevel && (
              <div className="ml-6 grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Review levels</Label>
                  <Select value={String(data.reviewerConfig.multiLevelCount)} onValueChange={(v) => updateConfig('multiLevelCount', parseInt(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 levels</SelectItem>
                      <SelectItem value="3">3 levels</SelectItem>
                      <SelectItem value="4">4 levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Approval mode</Label>
                  <Select value={data.reviewerConfig.approvalMode} onValueChange={(v: any) => updateConfig('approvalMode', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All must approve</SelectItem>
                      <SelectItem value="any">Any one approves</SelectItem>
                      <SelectItem value="majority">Majority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Section 3: Escalation & Reminders */}
      <Collapsible open={sectionOpen.escalation} onOpenChange={(o) => setSectionOpen(s => ({ ...s, escalation: o }))}>
        <Card className="p-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <Label className="text-base cursor-pointer">Escalation & Reminders</Label>
              <InfoTooltip text="Configure automated escalation paths for overdue reviews and reminder notifications" />
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${sectionOpen.escalation ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="escalation" className="font-normal">Enable Escalation</Label>
                <p className="text-xs text-muted-foreground">Automatically escalate overdue review items</p>
              </div>
              <Switch id="escalation" checked={data.reviewerConfig.escalationEnabled} onCheckedChange={(c) => updateConfig('escalationEnabled', c)} />
            </div>
            {data.reviewerConfig.escalationEnabled && (
              <div className="ml-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">First escalation after (hours)</Label>
                    <Input type="number" value={data.reviewerConfig.escalationAfterHours} onChange={(e) => updateConfig('escalationAfterHours', parseInt(e.target.value))} className="w-full" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Escalate to</Label>
                    <Select value={data.reviewerConfig.escalationTo} onValueChange={(v) => updateConfig('escalationTo', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">Direct Manager</SelectItem>
                        <SelectItem value="admin">Campaign Admin</SelectItem>
                        <SelectItem value="owner">Campaign Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Second escalation after (hours)</Label>
                    <Input type="number" value={data.reviewerConfig.secondEscalationAfterHours} onChange={(e) => updateConfig('secondEscalationAfterHours', parseInt(e.target.value))} className="w-full" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Second escalate to</Label>
                    <Select value={data.reviewerConfig.secondEscalationTo} onValueChange={(v) => updateConfig('secondEscalationTo', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Campaign Admin</SelectItem>
                        <SelectItem value="owner">Campaign Owner</SelectItem>
                        <SelectItem value="executive">Executive Sponsor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm">Reminder Schedule</Label>
                <InfoTooltip text="Send automated reminders to reviewers at these intervals before the campaign due date" />
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { day: 7, label: '7 days before' },
                  { day: 3, label: '3 days before' },
                  { day: 1, label: '1 day before' },
                  { day: 0, label: 'On due date' },
                  { day: -1, label: 'Daily after due' },
                ].map(r => (
                  <div key={r.day} className="flex items-center space-x-1.5">
                    <Checkbox
                      id={`reminder-${r.day}`}
                      checked={data.reviewerConfig.reminderSchedule?.includes(r.day)}
                      onCheckedChange={() => toggleReminder(r.day)}
                    />
                    <Label htmlFor={`reminder-${r.day}`} className="font-normal text-sm cursor-pointer">{r.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Workload Preview */}
      {suggestedReviewers.length > 0 && (
        <Card className="p-4 bg-muted/50">
          <Label className="mb-2 block text-sm">Estimated Workload Distribution</Label>
          <div className="space-y-1.5">
            {suggestedReviewers.map((reviewer) => (
              <div key={reviewer.id} className="flex items-center justify-between text-sm">
                <span>{reviewer.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{reviewer.estimatedItems} items</span>
                  <div className="w-20 h-1.5 bg-background rounded-full overflow-hidden">
                    <div
                      className={`h-full ${reviewer.utilizationPercent > 80 ? 'bg-destructive' : reviewer.utilizationPercent > 60 ? 'bg-warning' : 'bg-primary'}`}
                      style={{ width: `${Math.min(100, reviewer.utilizationPercent)}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground w-10 text-right">{reviewer.utilizationPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Step3Reviewers;
