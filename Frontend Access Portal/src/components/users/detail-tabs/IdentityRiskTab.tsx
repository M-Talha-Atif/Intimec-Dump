
import React from 'react';
import { type User, type RiskContributor } from '@/data/mock-users';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ShieldCheck, Star, FileWarning, CalendarClock, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getIdentityProfile } from '@/data/mock-identity-profiles';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const riskLevelColors = {
  High: 'text-red-600',
  Medium: 'text-yellow-600',
  Low: 'text-green-600'
};

const riskSourceIcons: { [key in RiskContributor['source']]: React.ReactNode } = {
  'Role': <Users className="h-4 w-4" />,
  'Entitlement': <Star className="h-4 w-4" />,
  'Policy': <FileWarning className="h-4 w-4" />,
  'Certification Age': <CalendarClock className="h-4 w-4" />,
  'Identity Attribute': <AlertTriangle className="h-4 w-4" />,
};

const riskTrendData = [
  { month: 'Sep', score: 45 },
  { month: 'Oct', score: 52 },
  { month: 'Nov', score: 68 },
  { month: 'Dec', score: 72 },
  { month: 'Jan', score: 78 },
  { month: 'Feb', score: 65 },
];

const IdentityRiskTab = ({ user }: { user: User }) => {
  const profile = getIdentityProfile(user.id);
  const riskEvents = profile?.riskEvents || [];
  const riskContributors = user.riskContributors || [];
  
  const allRiskContributors = [
    ...riskContributors,
    ...riskEvents.map(event => ({
      source: event.source as RiskContributor['source'],
      level: event.severity as RiskContributor['level'],
      description: event.description
    }))
  ];

  const riskScore = user.riskLevel === 'High' ? 92 : user.riskLevel === 'Medium' ? 65 : 23;
  const deptAvg = 48;

  const getRiskBarColor = (score: number) => {
    if (score >= 66) return 'bg-red-500';
    if (score >= 33) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4 pt-4">
      {/* Risk Score Gauge */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Identity Risk Score</CardTitle>
          <CardDescription>Overall risk assessment with peer comparison</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className={cn("text-3xl font-bold", riskLevelColors[user.riskLevel])}>{riskScore}</span>
              <Badge variant="outline" className={cn(riskLevelColors[user.riskLevel], 'border-current font-semibold')}>
                {user.riskLevel} Risk
              </Badge>
            </div>
            <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all", getRiskBarColor(riskScore))} style={{ width: `${riskScore}%` }} />
              {/* Threshold markers */}
              <div className="absolute top-0 left-[33%] h-full w-0.5 bg-slate-400/50" />
              <div className="absolute top-0 left-[66%] h-full w-0.5 bg-slate-400/50" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>Low</span><span>Medium</span><span>High</span>
            </div>
          </div>

          {/* Peer comparison */}
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs font-medium text-slate-600 mb-2">vs Department Average ({deptAvg})</p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>This Identity</span>
                  <span className="font-semibold">{riskScore}</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full">
                  <div className={cn("h-full rounded-full", getRiskBarColor(riskScore))} style={{ width: `${riskScore}%` }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Dept Avg</span>
                  <span className="font-semibold">{deptAvg}</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full">
                  <div className={cn("h-full rounded-full", getRiskBarColor(deptAvg))} style={{ width: `${deptAvg}%` }} />
                </div>
              </div>
            </div>
            {riskScore > deptAvg && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> {riskScore - deptAvg} points above department average
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Risk Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Risk Trend (6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#ef4444" fill="#fecaca" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Risk Contributors with Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Risk Contributors</CardTitle>
          <CardDescription>Factors contributing to risk with remediation actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {allRiskContributors.length === 0 ? (
            <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-md">
              <ShieldCheck className="w-6 h-6"/>
              <p className="font-medium">No significant risk factors detected.</p>
            </div>
          ) : (
            allRiskContributors.map((factor, index) => (
              <Alert key={index} variant={factor.level === 'High' ? 'destructive' : 'default'}>
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-start gap-2">
                    {riskSourceIcons[factor.source]}
                    <div>
                      <AlertTitle className="text-sm">{factor.source} Risk</AlertTitle>
                      <AlertDescription className="text-xs">{factor.description}</AlertDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <Button size="sm" variant="outline" className="h-7 text-xs">Remediate</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-500">Accept</Button>
                  </div>
                </div>
              </Alert>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IdentityRiskTab;
