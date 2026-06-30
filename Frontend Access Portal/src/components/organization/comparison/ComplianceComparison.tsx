import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { OrgNodeData } from "@/types/organization";

interface ComplianceComparisonProps {
  units: OrgNodeData[];
}

export function ComplianceComparison({ units }: ComplianceComparisonProps) {
  const complianceData = units.map(unit => ({
    name: unit.name,
    status: unit.complianceStatus || 'non-compliant',
    healthScore: unit.healthScore || 0,
  }));

  const statusCounts = {
    compliant: complianceData.filter(u => u.status === 'compliant').length,
    warning: complianceData.filter(u => u.status === 'warning').length,
    'non-compliant': complianceData.filter(u => u.status === 'non-compliant').length,
  };

  const pieData = [
    { name: 'Compliant', value: statusCounts.compliant, color: 'hsl(var(--success))' },
    { name: 'Warning', value: statusCounts.warning, color: 'hsl(var(--warning))' },
    { name: 'Non-Compliant', value: statusCounts['non-compliant'], color: 'hsl(var(--destructive))' },
  ].filter(item => item.value > 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return { icon: CheckCircle2, variant: 'success', label: 'Compliant' };
      case 'warning':
        return { icon: AlertCircle, variant: 'warning', label: 'Warning' };
      default:
        return { icon: XCircle, variant: 'destructive', label: 'Non-Compliant' };
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Compliance Status Comparison</h3>
      
      <div className="grid gap-6">
        {/* Compliance Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">Overall Compliance Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col justify-center space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">Compliant Units</span>
              </div>
              <span className="text-2xl font-bold">{statusCounts.compliant}</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium">Warning Status</span>
              </div>
              <span className="text-2xl font-bold">{statusCounts.warning}</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium">Non-Compliant</span>
              </div>
              <span className="text-2xl font-bold">{statusCounts['non-compliant']}</span>
            </div>
          </div>
        </div>

        {/* Unit Details */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Unit-by-Unit Compliance</h4>
          <div className="grid gap-3">
            {complianceData.map((unit) => {
              const badge = getStatusBadge(unit.status);
              const Icon = badge.icon;
              return (
                <div
                  key={unit.name}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1">
                      <div className="font-medium">{unit.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={badge.variant as any} className="text-xs">
                          <Icon className="w-3 h-3 mr-1" />
                          {badge.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getHealthColor(unit.healthScore)}`}>
                        {unit.healthScore}
                      </div>
                      <div className="text-xs text-muted-foreground">Health Score</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compliance Actions */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Required Actions</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            {complianceData.map((unit, index) => {
              if (unit.status === 'non-compliant') {
                return (
                  <li key={index}>
                    • <span className="font-medium text-foreground">{unit.name}</span>: Immediate compliance review required - Schedule audit
                  </li>
                );
              }
              if (unit.status === 'warning') {
                return (
                  <li key={index}>
                    • <span className="font-medium text-foreground">{unit.name}</span>: Monitor closely - Address identified issues
                  </li>
                );
              }
              return null;
            }).filter(Boolean)}
            {complianceData.every(u => u.status === 'compliant') && (
              <li>✓ All units are compliant - Continue regular monitoring</li>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
}
