
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { riskTrendData } from '@/data/mock-risk-analytics';
import { TrendAnalysisModal } from './modals/TrendAnalysisModal';

export const RiskTrendChart: React.FC = () => {
  const [trendModalOpen, setTrendModalOpen] = useState(false);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-lg text-sm">
          <p className="font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-muted-foreground">
              <span className="inline-block w-2.5 h-2.5 rounded mr-1.5" style={{ backgroundColor: entry.color }} />
              {entry.name}: <span className="font-medium text-foreground">{entry.value}</span>
            </p>
          ))}
          <p className="text-xs text-muted-foreground mt-1 italic">Click for detailed analysis</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Card className="cursor-pointer" onClick={() => setTrendModalOpen(true)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            IGA Risk Trend — 12 Months
            <InfoTooltip text="Stacked area chart showing 4 IGA risk categories over 12 months. Click to open detailed trend analysis." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={riskTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(v) => v.split(' ')[0]} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="accessRisk" stackId="1" stroke="hsl(0, 70%, 55%)" fill="hsl(0, 70%, 55%)" fillOpacity={0.5} name="Access Risk" />
              <Area type="monotone" dataKey="policyViolations" stackId="1" stroke="hsl(30, 80%, 55%)" fill="hsl(30, 80%, 55%)" fillOpacity={0.5} name="Policy Violations" />
              <Area type="monotone" dataKey="certificationRisk" stackId="1" stroke="hsl(45, 80%, 50%)" fill="hsl(45, 80%, 50%)" fillOpacity={0.5} name="Certification Risk" />
              <Area type="monotone" dataKey="lifecycleRisk" stackId="1" stroke="hsl(220, 60%, 55%)" fill="hsl(220, 60%, 55%)" fillOpacity={0.5} name="Lifecycle Risk" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <TrendAnalysisModal isOpen={trendModalOpen} onClose={() => setTrendModalOpen(false)} />
    </>
  );
};
