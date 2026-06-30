
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface ManagerKPICardProps {
  kpi: {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    label: string;
  };
  value: number;
}

export const ManagerKPICard = ({ kpi, value }: ManagerKPICardProps) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{kpi.label}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
        <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
      </div>
    </CardContent>
  </Card>
);
