import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { OrgNodeData } from "@/types/organization";

interface RiskComparisonProps {
  units: OrgNodeData[];
}

export function RiskComparison({ units }: RiskComparisonProps) {
  const riskData = units.map(unit => ({
    name: unit.name,
    riskScore: unit.riskScore || 0,
    sodViolations: unit.sodViolationCount || 0,
    orphanAccounts: unit.orphanAccountCount || 0,
    dormantAccounts: unit.dormantAccountCount || 0,
    overProvisioned: unit.overProvisionedUserCount || 0,
  }));

  const radarData = units.map(unit => ({
    subject: unit.name.substring(0, 15),
    'Risk Score': unit.riskScore || 0,
    'SoD': (unit.sodViolationCount || 0) / 2,
    'Orphaned': (unit.orphanAccountCount || 0) / 10,
    'Dormant': (unit.dormantAccountCount || 0) / 20,
    'Over-Provisioned': (unit.overProvisionedUserCount || 0) / 10,
  }));

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { label: 'Critical', color: 'destructive', icon: XCircle };
    if (score >= 50) return { label: 'High', color: 'destructive', icon: AlertTriangle };
    if (score >= 30) return { label: 'Medium', color: 'warning', icon: AlertTriangle };
    return { label: 'Low', color: 'success', icon: Shield };
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Risk Analysis Comparison</h3>
      
      <div className="grid gap-6">
        {/* Risk Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {riskData.map((unit) => {
            const risk = getRiskLevel(unit.riskScore);
            const Icon = risk.icon;
            return (
              <Card key={unit.name} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-sm font-medium">{unit.name}</div>
                  <Badge variant={risk.color as any}>
                    <Icon className="w-3 h-3 mr-1" />
                    {risk.label}
                  </Badge>
                </div>
                <div className="text-3xl font-bold mb-2">{unit.riskScore}</div>
                <div className="text-xs text-muted-foreground">Risk Score</div>
              </Card>
            );
          })}
        </div>

        {/* Risk Metrics Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">Risk Indicators</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
                <Bar dataKey="sodViolations" name="SoD Violations" fill="hsl(var(--destructive))" />
                <Bar dataKey="orphanAccounts" name="Orphaned Accounts" fill="hsl(var(--warning))" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">Multi-Dimensional Risk View</h4>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis dataKey="subject" className="text-xs" />
                <PolarRadiusAxis className="text-xs" />
                <Radar name="Risk Factors" dataKey="Risk Score" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Risk Breakdown */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Unit</th>
                <th className="text-right p-2 font-medium">Risk Score</th>
                <th className="text-right p-2 font-medium">SoD Violations</th>
                <th className="text-right p-2 font-medium">Orphaned</th>
                <th className="text-right p-2 font-medium">Dormant</th>
                <th className="text-right p-2 font-medium">Over-Provisioned</th>
              </tr>
            </thead>
            <tbody>
              {riskData.map((unit) => (
                <tr key={unit.name} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">{unit.name}</td>
                  <td className="text-right p-2">{unit.riskScore}</td>
                  <td className="text-right p-2">{unit.sodViolations}</td>
                  <td className="text-right p-2">{unit.orphanAccounts}</td>
                  <td className="text-right p-2">{unit.dormantAccounts}</td>
                  <td className="text-right p-2">{unit.overProvisioned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Risk Recommendations */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <h4 className="text-sm font-semibold mb-2">Risk Mitigation Recommendations</h4>
          {riskData.map((unit, index) => {
            const issues: string[] = [];
            if (unit.sodViolations > 20) issues.push('High SoD violations - Implement role segregation');
            if (unit.orphanAccounts > 50) issues.push('Excessive orphaned accounts - Initiate cleanup campaign');
            if (unit.dormantAccounts > 100) issues.push('High dormant accounts - Review and deactivate');
            if (unit.overProvisioned > 100) issues.push('Over-provisioned users - Conduct access certification');
            
            if (issues.length > 0) {
              return (
                <div key={index} className="text-sm">
                  <span className="font-medium text-foreground">{unit.name}:</span>
                  <ul className="ml-4 mt-1 space-y-1 text-muted-foreground">
                    {issues.map((issue, i) => (
                      <li key={i}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </Card>
  );
}
