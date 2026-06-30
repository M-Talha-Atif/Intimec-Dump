
import { useTranslation } from "react-i18next";
import { useState } from "react";
import MetricCard from "./MetricCard";
import { UserX, Clock, ShieldQuestion, AlertTriangle } from "lucide-react";
import { MetricDetailModal } from "./modals/MetricDetailModal";
import { useDashboardData } from "@/hooks/useDashboardData";

const IdentityRiskOverview = () => {
  const { t } = useTranslation();
  const { data } = useDashboardData();
  const [selectedMetric, setSelectedMetric] = useState<'terminated' | 'inactive' | 'orphan' | 'risky' | null>(null);
  
  if (!data) return null;

  const riskMetrics = [
    { 
      title: t('dashboard.terminatedAccounts'), 
      value: data.identityRisk.terminated.count.toString(), 
      change: data.identityRisk.terminated.trend, 
      trend: 'up' as const, 
      trendDirection: 'negative' as const, 
      icon: UserX,
      metricType: 'terminated' as const
    },
    { 
      title: t('dashboard.inactiveAccounts'), 
      value: data.identityRisk.inactive.count.toString(), 
      change: data.identityRisk.inactive.trend, 
      trend: 'down' as const, 
      trendDirection: 'positive' as const, 
      icon: Clock,
      metricType: 'inactive' as const
    },
    { 
      title: t('dashboard.orphanAccounts'), 
      value: data.identityRisk.orphan.count.toString(), 
      change: data.identityRisk.orphan.trend, 
      trend: 'up' as const, 
      trendDirection: 'negative' as const, 
      icon: ShieldQuestion,
      metricType: 'orphan' as const
    },
    { 
      title: t('dashboard.riskyUsers'), 
      value: data.identityRisk.risky.count.toString(), 
      change: data.identityRisk.risky.trend, 
      trend: 'down' as const, 
      trendDirection: 'positive' as const, 
      icon: AlertTriangle,
      metricType: 'risky' as const
    },
  ];

  return (
    <>
      <section>
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.identityRiskOverview')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {riskMetrics.map((metric) => (
            <MetricCard 
              key={metric.title} 
              {...metric} 
              onClick={() => setSelectedMetric(metric.metricType)}
            />
          ))}
        </div>
      </section>

      {selectedMetric && (
        <MetricDetailModal
          open={!!selectedMetric}
          onClose={() => setSelectedMetric(null)}
          metricType={selectedMetric}
          data={data.identityRisk[selectedMetric]}
        />
      )}
    </>
  );
};

export default IdentityRiskOverview;
