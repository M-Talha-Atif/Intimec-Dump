
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { identityRiskSegments } from '@/data/mock-risk-analytics';
import { IdentityRiskSegment } from '@/types/riskAnalytics';

interface Props {
  onSegmentClick?: (segment: IdentityRiskSegment) => void;
}

export const IdentityRiskDistribution: React.FC<Props> = ({ onSegmentClick }) => {
  const data = identityRiskSegments.map(s => ({
    name: s.type,
    value: s.highRiskCount,
    total: s.count,
    avgRisk: s.avgRiskScore,
    color: s.color,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-lg text-sm">
          <p className="font-medium text-foreground">{d.name}</p>
          <p className="text-muted-foreground">High-Risk: <span className="font-medium text-foreground">{d.value}</span></p>
          <p className="text-muted-foreground">Total: <span className="font-medium text-foreground">{d.total.toLocaleString()}</span></p>
          <p className="text-muted-foreground">Avg Risk: <span className="font-medium text-foreground">{d.avgRisk}/100</span></p>
        </div>
      );
    }
    return null;
  };

  const handlePieClick = (_: any, index: number) => {
    if (onSegmentClick) {
      onSegmentClick(identityRiskSegments[index]);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          Identity Risk Distribution
          <InfoTooltip text="Distribution of high-risk identities by type. Click a segment to drill down into that identity category." />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              onClick={handlePieClick}
              style={{ cursor: 'pointer' }}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {identityRiskSegments.map(s => (
            <div key={s.type} className="flex items-center justify-between text-xs p-2 rounded bg-muted/50 cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => onSegmentClick?.(s)}>
              <span className="text-muted-foreground">{s.type}</span>
              <span className="font-medium text-foreground">Avg: {s.avgRiskScore}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
