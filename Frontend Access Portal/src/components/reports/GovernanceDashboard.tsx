import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ShieldCheck, ClipboardCheck, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { cn } from '@/lib/utils';
import { getRiskBadgeClass, getStatusBadgeClass } from '@/utils/getBadgeClass';
import {
  ComplianceScoreDrawer,
  CertificationRateDrawer,
  OpenViolationsDrawer,
  RemediationTimeDrawer,
  FrameworkDetailDrawer,
  RiskTrendDetailDrawer,
  CampaignDetailDrawer,
  GovernanceGapDrawer,
} from './dialogs/GovernanceDrilldownDrawers';

const complianceByFramework = [
  { framework: 'SOX', score: 87, target: 95 },
  { framework: 'GDPR', score: 92, target: 90 },
  { framework: 'HIPAA', score: 78, target: 85 },
  { framework: 'SOC2', score: 94, target: 90 },
  { framework: 'ISO 27001', score: 81, target: 85 },
  { framework: 'PCI-DSS', score: 89, target: 90 },
];

const riskTrendData = [
  { month: 'Aug', critical: 8, high: 24, medium: 45 },
  { month: 'Sep', critical: 12, high: 28, medium: 42 },
  { month: 'Oct', critical: 6, high: 22, medium: 48 },
  { month: 'Nov', critical: 9, high: 19, medium: 38 },
  { month: 'Dec', critical: 5, high: 16, medium: 35 },
  { month: 'Jan', critical: 4, high: 14, medium: 31 },
];

const campaignEffectiveness = [
  { name: 'Q4 SOX Certification', completion: 96, onTime: 92, revocationRate: 8.2, reviewerScore: 4.5 },
  { name: 'Annual GDPR Review', completion: 88, onTime: 79, revocationRate: 12.4, reviewerScore: 3.8 },
  { name: 'Privileged Access Review', completion: 100, onTime: 95, revocationRate: 15.1, reviewerScore: 4.7 },
  { name: 'Q1 Entitlement Review', completion: 72, onTime: 68, revocationRate: 6.3, reviewerScore: 4.1 },
  { name: 'Contractor Access Audit', completion: 91, onTime: 85, revocationRate: 22.7, reviewerScore: 4.3 },
];

const governanceGaps = [
  { gap: 'Uncertified privileged accounts', affected: 47, risk: 'critical', action: 'Initiate emergency certification campaign' },
  { gap: 'Orphaned service accounts in SAP', affected: 23, risk: 'high', action: 'Assign owners and schedule review' },
  { gap: 'Stale entitlements (>180 days unused)', affected: 312, risk: 'high', action: 'Generate cleanup report and revoke' },
  { gap: 'Missing SoD policy coverage for Finance', affected: 89, risk: 'medium', action: 'Extend SoD rule matrix to cover gaps' },
  { gap: 'Expired certifications on cloud apps', affected: 156, risk: 'medium', action: 'Schedule batch re-certification' },
];

export const GovernanceDashboard = () => {
  const [complianceDrawerOpen, setComplianceDrawerOpen] = useState(false);
  const [certificationDrawerOpen, setCertificationDrawerOpen] = useState(false);
  const [violationsDrawerOpen, setViolationsDrawerOpen] = useState(false);
  const [remediationDrawerOpen, setRemediationDrawerOpen] = useState(false);
  const [frameworkDrawerOpen, setFrameworkDrawerOpen] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState('SOX');
  const [riskTrendDrawerOpen, setRiskTrendDrawerOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('Jan');
  const [campaignDrawerOpen, setCampaignDrawerOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [gapDrawerOpen, setGapDrawerOpen] = useState(false);
  const [selectedGap, setSelectedGap] = useState(governanceGaps[0]);

  const handleBarClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload?.framework) {
      setSelectedFramework(data.activePayload[0].payload.framework);
      setFrameworkDrawerOpen(true);
    }
  };

  const handleAreaClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload?.month) {
      setSelectedMonth(data.activePayload[0].payload.month);
      setRiskTrendDrawerOpen(true);
    }
  };

  const kpiCards = [
    {
      title: "Compliance Score",
      value: "87",
      suffix: "/ 100",
      tooltip:
        "Weighted average compliance score across all active frameworks. Target: 90+. Click for breakdown.",
      icon: ShieldCheck,
      iconColor: "text-primary",
      trendIcon: TrendingUp,
      trendText: "+3.2 pts from last quarter",
      trendColor: "text-green-600 dark:text-green-400",
      onClick: () => setComplianceDrawerOpen(true),
    },
    {
      title: "Certification Rate",
      value: "91.4%",
      tooltip:
        "Percentage of access reviews completed on-time across all active campaigns. Click for details.",
      icon: ClipboardCheck,
      iconColor: "text-green-600 dark:text-green-400",
      trendIcon: TrendingUp,
      trendText: "+5.1% from last period",
      trendColor: "text-green-600 dark:text-green-400",
      onClick: () => setCertificationDrawerOpen(true),
    },
    {
      title: "Open Violations",
      value: "49",
      tooltip:
        "Active policy violations requiring remediation. Breakdown: 4 critical, 14 high, 31 medium. Click for full list.",
      icon: AlertTriangle,
      iconColor: "text-destructive",
      trendIcon: TrendingDown,
      trendText: "-12 from last month",
      trendColor: "text-green-600 dark:text-green-400",
      onClick: () => setViolationsDrawerOpen(true),
    },
    {
      title: "Avg Remediation",
      value: "11.3",
      suffix: "days",
      tooltip:
        "Average time to remediate policy violations. SLA target: 14 days. Click for analysis.",
      icon: Clock,
      iconColor: "text-amber-500",
      trendIcon: TrendingDown,
      trendText: "Within 14-day SLA",
      trendColor: "text-green-600 dark:text-green-400",
      onClick: () => setRemediationDrawerOpen(true),
    },
  ];


  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          const TrendIcon = card.trendIcon;

          return (
            <Card
              key={card.id}
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={card.onClick}
            >
              <CardContent className="p-3">
                {/* header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-muted-foreground truncate">
                      {card.title}
                    </span>
                    <InfoTooltip text={card.tooltip} />
                  </div>

                  <Icon className={`h-3.5 w-3.5 shrink-0 ${card.iconColor}`} />
                </div>

                {/* value */}
                <div className="text-xl font-bold text-foreground flex items-baseline gap-1">
                  {card.value}
                  {card.suffix && (
                    <span className="text-xs text-muted-foreground">{card.suffix}</span>
                  )}
                </div>

                {/* trend */}
                <div className="flex items-center gap-1 mt-1">
                  {card.trendUp ? (
                    <TrendingUp className={`h-3 w-3 ${card.trendColor}`} />
                  ) : (
                    <TrendingDown className={`h-3 w-3 ${card.trendColor}`} />
                  )}

                  <span className={`text-xs ${card.trendColor}`}>
                    {card.trendText}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    vs last period
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Compliance by Framework
              <InfoTooltip text="Click any bar to see detailed controls and findings for that framework." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={complianceByFramework} layout="vertical" margin={{ left: 20 }} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" domain={[0, 100]} className="text-xs fill-muted-foreground" />
                <YAxis type="category" dataKey="framework" width={80} className="text-xs fill-muted-foreground" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                />
                <Bar dataKey="score" name="Score" radius={[0, 4, 4, 0]}>
                  {complianceByFramework.map((entry, index) => (
                    <Cell key={index} fill={entry.score >= entry.target ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-4))'} />
                  ))}
                </Bar>
                <Bar dataKey="target" name="Target" fill="hsl(var(--muted-foreground))" opacity={0.25} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Risk Trend (6 Months)
              <InfoTooltip text="Click any month to see all violations for that period." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={riskTrendData} onClick={handleAreaClick} style={{ cursor: 'pointer' }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                />
                <Area type="monotone" dataKey="medium" stackId="1" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.3} name="Medium" />
                <Area type="monotone" dataKey="high" stackId="1" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5))" fillOpacity={0.4} name="High" />
                <Area type="monotone" dataKey="critical" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.5} name="Critical" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Certification Campaign Effectiveness
              <InfoTooltip text="Click any campaign row for reviewer breakdown and decision analysis." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead className="text-right">Completion</TableHead>
                  <TableHead className="text-right">On-Time</TableHead>
                  <TableHead className="text-right">Revocation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignEffectiveness.map((campaign) => (
                  <TableRow
                    key={campaign.name}
                    className="cursor-pointer"
                    onClick={() => { setSelectedCampaign(campaign.name); setCampaignDrawerOpen(true); }}
                  >
                    <TableCell className="font-medium text-sm">{campaign.name}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={cn(
                        campaign.completion >= 90 ? getStatusBadgeClass('active') : getStatusBadgeClass('pending'),
                        "border text-xs"
                      )}>
                        {campaign.completion}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{campaign.onTime}%</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{campaign.revocationRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Top Governance Gaps
              <InfoTooltip text="Click any gap to see affected identities and remediation steps." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {governanceGaps.map((gap, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => { setSelectedGap(gap); setGapDrawerOpen(true); }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{gap.gap}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn(getRiskBadgeClass(gap.risk), "border text-xs")}>{gap.risk}</Badge>
                      <span className="text-xs text-muted-foreground">{gap.affected} identities affected</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drawers */}
      <ComplianceScoreDrawer open={complianceDrawerOpen} onOpenChange={setComplianceDrawerOpen} />
      <CertificationRateDrawer open={certificationDrawerOpen} onOpenChange={setCertificationDrawerOpen} />
      <OpenViolationsDrawer open={violationsDrawerOpen} onOpenChange={setViolationsDrawerOpen} />
      <RemediationTimeDrawer open={remediationDrawerOpen} onOpenChange={setRemediationDrawerOpen} />
      <FrameworkDetailDrawer open={frameworkDrawerOpen} onOpenChange={setFrameworkDrawerOpen} framework={selectedFramework} />
      <RiskTrendDetailDrawer open={riskTrendDrawerOpen} onOpenChange={setRiskTrendDrawerOpen} month={selectedMonth} />
      <CampaignDetailDrawer open={campaignDrawerOpen} onOpenChange={setCampaignDrawerOpen} campaignName={selectedCampaign} />
      <GovernanceGapDrawer open={gapDrawerOpen} onOpenChange={setGapDrawerOpen} gap={selectedGap} />
    </div>
  );
};
