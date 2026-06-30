import React from 'react';
import MetricCard from '@/components/dashboard/MetricCard';
import {
  AlertTriangle,
  Shield,
  UserX,
  ShieldAlert,
  Clock,
  Award,
  KeyRound,
  FileWarning,
} from 'lucide-react';
import { riskKPIs } from '@/data/mock-risk-analytics';

interface RiskKPICardsProps {
  onCardClick: (riskId: string) => void;
}

const iconMap: Record<string, React.ElementType> = {
  'overall-risk': AlertTriangle,
  'sod-violations': Shield,
  'orphaned-accounts': UserX,
  'excessive-access': ShieldAlert,
  'unused-access': Clock,
  'overdue-certs': Award,
  'privileged-risk': KeyRound,
  'compliance-gaps': FileWarning,
};

export const RiskKPICards: React.FC<RiskKPICardsProps> = ({ onCardClick }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {riskKPIs.map((kpi) => {
        const diff = Math.abs(kpi.value - kpi.previousValue);
        const isRiskMetric = kpi.trend === 'up'; // for risk metrics, "up" is negative
        const trendDirection: 'positive' | 'negative' = 
          kpi.trend === 'down' ? 'positive' : kpi.trend === 'up' ? 'negative' : 'positive';

        return (
          <MetricCard
            key={kpi.id}
            title={kpi.name}
            value={kpi.id === 'overall-risk' ? `${kpi.value}/100` : kpi.value.toLocaleString()}
            change={`${kpi.trend === 'up' ? '+' : kpi.trend === 'down' ? '-' : ''}${diff}`}
            trend={kpi.trend === 'stable' ? 'up' : kpi.trend}
            trendDirection={trendDirection}
            icon={iconMap[kpi.id] || AlertTriangle}
            onClick={() => onCardClick(kpi.id)}
            tooltip={kpi.tooltip}
          />
        );
      })}
    </div>
  );
};
