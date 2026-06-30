
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const riskTrendData = [
  { month: 'Sep', score: 35 }, { month: 'Oct', score: 42 }, { month: 'Nov', score: 58 },
  { month: 'Dec', score: 72 }, { month: 'Jan', score: 85 }, { month: 'Feb', score: 78 },
];

const riskLevelColors = { High: 'text-red-600', Medium: 'text-yellow-600', Low: 'text-green-600' };

const NhiRiskTab = ({ identity }: { identity: any }) => {
  const riskScore = identity.riskScore ?? (identity.riskLevel === 'High' ? 92 : identity.riskLevel === 'Medium' ? 65 : 25);
  const riskLevel = identity.riskLevel || 'Low';
  
  const contributors = identity.riskContributors || [
    ...(identity.rotationStatus === 'Overdue' ? [{ title: 'Rotation Overdue', severity: 'High', note: 'Credentials not rotated within policy window' }] : []),
    ...((identity.daysUnused ?? 0) >= 30 ? [{ title: 'Dormant Usage', severity: 'Medium', note: `No activity for ${identity.daysUnused} days` }] : []),
    ...(identity.privileges?.some((p: string) => p.toLowerCase().includes('admin')) ? [{ title: 'Privileged Scope', severity: 'High', note: 'Administrative privileges detected' }] : []),
  ];

  const getRiskBarColor = (score: number) => score >= 66 ? 'bg-red-500' : score >= 33 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="space-y-4 pt-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Identity Risk Score</CardTitle>
          <CardDescription>Overall risk assessment for this service identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className={cn("text-3xl font-bold", riskLevelColors[riskLevel as keyof typeof riskLevelColors])}>{riskScore}</span>
              <Badge variant="outline" className={cn(riskLevelColors[riskLevel as keyof typeof riskLevelColors], 'border-current font-semibold')}>{riskLevel} Risk</Badge>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all", getRiskBarColor(riskScore))} style={{ width: `${riskScore}%` }} />
              <div className="absolute top-0 left-[33%] h-full w-0.5 bg-slate-400/50" />
              <div className="absolute top-0 left-[66%] h-full w-0.5 bg-slate-400/50" />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5"><span>Low</span><span>Medium</span><span>High</span></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Risk Trend (6 Months)</CardTitle></CardHeader>
        <CardContent>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#ef4444" fill="#fecaca" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Risk Contributors</CardTitle>
          <CardDescription>Factors contributing to risk with remediation actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {contributors.length === 0 ? (
            <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-md">
              <ShieldCheck className="w-6 h-6" /><p className="font-medium">No significant risk factors detected.</p>
            </div>
          ) : contributors.map((factor: any, i: number) => (
            <Alert key={i} variant={factor.severity === 'High' ? 'destructive' : 'default'}>
              <div className="flex items-start justify-between w-full">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <div><AlertTitle className="text-sm">{factor.title}</AlertTitle><AlertDescription className="text-xs">{factor.note}</AlertDescription></div>
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-xs">Remediate</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground">Accept</Button>
                </div>
              </div>
            </Alert>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default NhiRiskTab;
