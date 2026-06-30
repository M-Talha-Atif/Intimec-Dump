import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertCircle, Info, Rocket, FlaskConical, Save, Calendar } from 'lucide-react';
import { CampaignWizardData } from '../CampaignCreationWizard';
import { scopeAnalysisService } from '@/services/scopeAnalysisService';
import ImpactAnalysis from '../preview/ImpactAnalysis';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { complianceFrameworks } from '@/data/mock-iga-entities';

interface Step5Props {
  data: CampaignWizardData;
  onComplete: (launchType: 'draft' | 'simulate' | 'launch' | 'schedule') => void;
}

const Step5Review = ({ data, onComplete }: Step5Props) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const result = await scopeAnalysisService.analyzeCampaignScope({
          campaignType: data.campaignType,
          ...data.scopeConfig,
        });
        setAnalysis(result);
      } catch (error) {
        console.error('Failed to load analysis:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getPreflightChecks = () => {
    const checks = [];
    checks.push({ status: data.name && data.campaignType ? 'success' : 'error', message: 'Basic information completed' });
    checks.push({ status: data.owner ? 'success' : 'warning', message: data.owner ? 'Campaign owner assigned' : 'No campaign owner assigned' });
    checks.push({ status: 'success', message: 'Scope defined' });
    checks.push({ status: data.reviewerStrategy ? 'success' : 'warning', message: data.reviewerStrategy ? 'Reviewer strategy selected' : 'No reviewer strategy selected' });
    checks.push({ status: data.configuration.dueDate ? 'success' : 'error', message: data.configuration.dueDate ? 'Due date configured' : 'Due date required' });

    if (data.configuration.dueDate && data.configuration.startDate && data.configuration.startDate > data.configuration.dueDate) {
      checks.push({ status: 'error', message: 'Start date must be before due date' });
    }

    if (data.reviewerConfig.escalationEnabled) {
      checks.push({ status: 'success', message: `Escalation configured (${data.reviewerConfig.escalationAfterHours}h)` });
    }

    if (data.configuration.slaHours > 0 && data.configuration.dueDate) {
      const dueDateMs = new Date(data.configuration.dueDate).getTime();
      const nowMs = Date.now();
      const hoursUntilDue = (dueDateMs - nowMs) / (1000 * 60 * 60);
      if (data.configuration.slaHours > hoursUntilDue) {
        checks.push({ status: 'warning', message: 'SLA exceeds time until due date' });
      }
    }

    if (analysis?.estimatedReviewers > 0) {
      checks.push({ status: 'success', message: `${analysis.estimatedReviewers} reviewers estimated` });
    }
    if (analysis?.warnings?.length > 0) {
      analysis.warnings.forEach((w: string) => checks.push({ status: 'warning', message: w }));
    }
    return checks;
  };

  const checks = getPreflightChecks();
  const hasErrors = checks.some(c => c.status === 'error');

  const selectedFrameworks = complianceFrameworks.filter(f => data.complianceFrameworks.includes(f.id));

  return (
    <div className="space-y-5">
      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-5">
        {/* Left: Campaign Summary */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-1.5 mb-3">
              <h3 className="font-semibold text-base">Campaign Overview</h3>
              <InfoTooltip text="Summary of all campaign parameters configured in previous steps" />
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{data.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><Badge variant="outline">{data.campaignType}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><Badge variant={data.priority === 'critical' ? 'destructive' : 'secondary'}>{data.priority}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Risk Threshold</span><Badge variant="outline">{data.riskThreshold}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Reviewer Strategy</span><span className="font-medium capitalize">{data.reviewerStrategy}</span></div>
              {data.recurrence.enabled && (
                <div className="flex justify-between"><span className="text-muted-foreground">Recurrence</span><Badge variant="secondary">{data.recurrence.frequency}</Badge></div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-1.5 mb-3">
              <h3 className="font-semibold text-base">Configuration</h3>
              <InfoTooltip text="Timeline, SLA, automation, and notification settings" />
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span className="font-medium">{data.configuration.dueDate || 'Not set'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SLA</span><span className="font-medium">{data.configuration.slaHours}h</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Justification</span><span className="font-medium capitalize">{data.configuration.requireJustification}</span></div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Notifications</span>
                <div className="flex gap-1">{data.configuration.notificationChannels.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}</div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI Assistance</span>
                <Badge variant={data.configuration.enableAI ? 'default' : 'secondary'}>{data.configuration.enableAI ? 'Enabled' : 'Disabled'}</Badge>
              </div>
              {data.configuration.autoApproveRules.enabled && (
                <div className="flex justify-between"><span className="text-muted-foreground">Auto-approve</span><span className="font-medium">Risk ≤ {data.configuration.autoApproveRules.riskThreshold}</span></div>
              )}
              {data.configuration.exceptionHandling.enabled && (
                <div className="flex justify-between"><span className="text-muted-foreground">Exceptions</span><span className="font-medium">Up to {data.configuration.exceptionHandling.maxDays} days</span></div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Scope & Impact */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-1.5 mb-3">
              <h3 className="font-semibold text-base">Scope Summary</h3>
              <InfoTooltip text="Estimated volume and risk distribution of items in this campaign" />
            </div>
            {loading ? (
              <div className="text-center py-6 text-muted-foreground text-sm">Analyzing scope...</div>
            ) : analysis ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Items</p>
                    <p className="text-2xl font-bold">{analysis.estimatedItems}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Reviewers</p>
                    <p className="text-2xl font-bold">{analysis.estimatedReviewers}</p>
                  </div>
                </div>
                {Object.keys(analysis.breakdown).length > 0 && (
                  <div className="space-y-1.5">
                    {Object.entries(analysis.breakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{key}</span>
                        <span className="font-medium">{value as number}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </Card>

          {/* Compliance Coverage */}
          {selectedFrameworks.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-1.5 mb-3">
                <h3 className="font-semibold text-base">Compliance Coverage</h3>
                <InfoTooltip text="Regulatory frameworks addressed by this campaign for audit evidence" />
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedFrameworks.map(f => (
                  <div key={f.id} className="flex items-center gap-1.5 p-2 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Impact Analysis */}
      {analysis && <ImpactAnalysis analysis={analysis} configuration={data.configuration} />}

      {/* Pre-flight Checks */}
      <Card className="p-5">
        <div className="flex items-center gap-1.5 mb-3">
          <h3 className="font-semibold text-base">Pre-flight Checks</h3>
          <InfoTooltip text="Validation of all required configuration before campaign can be launched" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {checks.map((check, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {check.status === 'success' && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
              {check.status === 'warning' && <AlertCircle className="h-4 w-4 text-warning shrink-0" />}
              {check.status === 'error' && <AlertCircle className="h-4 w-4 text-destructive shrink-0" />}
              {check.status === 'info' && <Info className="h-4 w-4 text-muted-foreground shrink-0" />}
              <span className={check.status === 'error' ? 'text-destructive' : ''}>{check.message}</span>
            </div>
          ))}
        </div>
      </Card>

      <Separator />

      {/* Launch Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => onComplete('draft')}>
          <Save className="h-4 w-4 mr-2" />Save as Draft
        </Button>
        <Button variant="outline" onClick={() => onComplete('schedule')} disabled={hasErrors}>
          <Calendar className="h-4 w-4 mr-2" />Schedule
        </Button>
        {data.configuration.enableSimulation && (
          <Button variant="outline" onClick={() => onComplete('simulate')} disabled={hasErrors}>
            <FlaskConical className="h-4 w-4 mr-2" />Simulate
          </Button>
        )}
        <Button onClick={() => onComplete('launch')} disabled={hasErrors} size="lg">
          <Rocket className="h-4 w-4 mr-2" />Launch Campaign
        </Button>
      </div>
    </div>
  );
};

export default Step5Review;
