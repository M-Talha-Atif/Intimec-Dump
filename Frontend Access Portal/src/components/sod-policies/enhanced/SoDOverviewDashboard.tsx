import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import MetricCard from '@/components/dashboard/MetricCard';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Users,
  FileText,
  Activity,
  Target,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useSoDAnalytics, useAIRecommendations } from '@/hooks/useSoDPolicies';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AIRecommendationsModal,
  AlertsListModal,
  AlertInvestigationModal,
  ActivityDetailsModal,
} from '../modals';
import { SoDKpiDrilldownDrawer } from './SoDKpiDrilldownDrawer';

export const SoDOverviewDashboard = () => {
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const [alertInvestigateModalOpen, setAlertInvestigateModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [drilldown, setDrilldown] = useState<{ title: string; description: string } | null>(null);
  
  const { data: analytics, isLoading } = useSoDAnalytics();
  const { data: aiRecommendations } = useAIRecommendations();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const getStatusIcon = (trend: string) => {
    return trend === 'improving' ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const openDrilldown = (title: string, description: string) => {
    setDrilldown({ title, description });
  };

  return (
    <div className="space-y-6">
      {/* Executive KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Policies"
          value={String(analytics?.totalPolicies ?? 0)}
          change={`${analytics?.activePolicies ?? 0} active`}
          trend="up"
          trendDirection="positive"
          icon={Shield}
          onClick={() => openDrilldown('Total Policies', 'All SoD policies configured in the platform.')}
          tooltip="Total number of SoD policies configured in the platform."
        />
        <MetricCard
          title="Active Violations"
          value={String(analytics?.activeViolations ?? 0)}
          change={`${analytics?.criticalViolations ?? 0} critical`}
          trend={analytics?.activeViolations === 0 ? 'down' : 'up'}
          trendDirection={analytics?.activeViolations === 0 ? 'positive' : 'negative'}
          icon={AlertTriangle}
          onClick={() => openDrilldown('Active Violations', 'All currently active SoD violations requiring attention.')}
          tooltip="Active SoD violations requiring attention."
        />
        <MetricCard
          title="Compliance Score"
          value={`${analytics?.complianceScore ?? 0}%`}
          change={analytics?.riskTrend === 'improving' ? 'Improving' : 'Declining'}
          trend={analytics?.riskTrend === 'improving' ? 'up' : 'down'}
          trendDirection={analytics?.riskTrend === 'improving' ? 'positive' : 'negative'}
          icon={Target}
          onClick={() => openDrilldown('Compliance Score', 'Compliance score breakdown by framework.')}
          tooltip="Compliance score based on policy adherence."
        />
        <MetricCard
          title="Avg Resolution Time"
          value={`${analytics?.averageResolutionTime ?? 0}d`}
          change={`${analytics?.violationsResolvedThisMonth ?? 0} resolved`}
          trend="down"
          trendDirection="positive"
          icon={Clock}
          onClick={() => openDrilldown('Avg Resolution Time', 'Resolution time breakdown by category.')}
          tooltip="Average time to resolve SoD violations."
        />
      </div>

      {/* Alert Center */}
      {analytics?.criticalViolations! > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Critical Alerts</CardTitle>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setAlertsModalOpen(true)}>
                View All <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  <div>
                    <p className="font-medium">{analytics?.criticalViolations} Critical Violations Require Immediate Action</p>
                    <p className="text-sm text-muted-foreground">SOX compliance at risk - SLA breach in 24h</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setAlertInvestigateModalOpen(true)}>Investigate</Button>
              </div>
              
              {aiRecommendations && aiRecommendations.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">AI Detected {aiRecommendations.length} Policy Recommendations</p>
                      <p className="text-sm text-muted-foreground">{aiRecommendations[0]?.title}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setAiModalOpen(true)}>Review</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Violation Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.violationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--destructive))" strokeWidth={2} name="Violations" onClick={() => openDrilldown('Violation Trend', 'Detailed violation trend data over time.')} className="cursor-pointer" />
                <Line type="monotone" dataKey="resolved" stroke="hsl(var(--primary))" strokeWidth={2} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors" onClick={() => openDrilldown('Detection Rate', 'Violation detection rate metrics and trends.')}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Detection Rate</span>
                  <span className="text-sm font-bold">{analytics?.violationDetectionRate}%</span>
                </div>
                <Progress value={analytics?.violationDetectionRate} className="h-2" />
              </div>
              
              <div className="cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors" onClick={() => openDrilldown('Compliance Score', 'Compliance coverage breakdown by area.')}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Compliance Coverage</span>
                  <span className="text-sm font-bold">{analytics?.complianceScore}%</span>
                </div>
                <Progress value={analytics?.complianceScore} className="h-2" />
              </div>

              <div className="cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors" onClick={() => openDrilldown('Policy Effectiveness', 'Policy effectiveness analysis across all active policies.')}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Policy Effectiveness</span>
                  <span className="text-sm font-bold">82%</span>
                </div>
                <Progress value={82} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => openDrilldown('Total Resolved', 'All resolved violations with resolution details.')}>
                  <p className="text-2xl font-bold text-primary">{analytics?.resolvedViolations}</p>
                  <p className="text-xs text-muted-foreground">Total Resolved</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => openDrilldown('Active Exceptions', 'Currently active exception grants and their expiration.')}>
                  <p className="text-2xl font-bold text-orange-600">{analytics?.activeExceptions}</p>
                  <p className="text-xs text-muted-foreground">Active Exceptions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: CheckCircle, color: 'text-green-600', text: '3 violations resolved today', drillTitle: 'Resolved Violations Today' },
                { icon: AlertTriangle, color: 'text-orange-600', text: '2 new violations detected', drillTitle: 'New Violations Detected' },
                { icon: FileText, color: 'text-blue-600', text: '1 policy updated', drillTitle: 'Policy Updates' },
                { icon: Users, color: 'text-purple-600', text: '5 exception requests pending', drillTitle: 'Pending Exception Requests' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-muted/50 rounded-md p-1.5 transition-colors" onClick={() => openDrilldown(item.drillTitle, `Details for: ${item.text}`)}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Violated Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { name: 'SOX Financial Controls', count: 8 },
                { name: 'IT Admin Separation', count: 5 },
                { name: 'HR Data Protection', count: 3 },
              ].map((policy, i) => (
                <div key={i} className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 rounded-md p-1.5 transition-colors" onClick={() => openDrilldown(policy.name, `Violations for policy: ${policy.name}`)}>
                  <span className="truncate">{policy.name}</span>
                  <Badge variant="destructive">{policy.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Critical', color: 'bg-red-600', value: analytics?.criticalViolations },
                { label: 'High', color: 'bg-orange-600', value: analytics?.highRiskViolations },
                { label: 'Medium', color: 'bg-yellow-600', value: 8 },
                { label: 'Low', color: 'bg-green-600', value: 12 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-md p-1.5 transition-colors" onClick={() => openDrilldown(`${item.label} Risk Violations`, `All violations classified as ${item.label.toLowerCase()} risk.`)}>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drilldown Drawer */}
      <SoDKpiDrilldownDrawer
        open={!!drilldown}
        onOpenChange={(open) => { if (!open) setDrilldown(null); }}
        title={drilldown?.title || ''}
        description={drilldown?.description || ''}
        items={[]}
      />

      {/* All Modals */}
      <AIRecommendationsModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        recommendations={aiRecommendations || []}
      />

      <AlertsListModal
        open={alertsModalOpen}
        onClose={() => setAlertsModalOpen(false)}
        onInvestigate={() => {
          setAlertsModalOpen(false);
          setAlertInvestigateModalOpen(true);
        }}
      />

      <AlertInvestigationModal
        open={alertInvestigateModalOpen}
        onClose={() => setAlertInvestigateModalOpen(false)}
        alertId="alert-001"
      />

      <ActivityDetailsModal
        open={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        activity={{
          id: 'activity-001',
          type: 'violation_detected',
          title: 'New Violation Detected',
          timestamp: new Date().toISOString(),
          performedBy: 'System',
          details: 'Automatic SoD policy scan detected new violations',
          relatedEntities: [],
        }}
      />
    </div>
  );
};
