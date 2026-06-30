import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrgNodeData } from '@/types/organization';
import { Grid3x3 } from 'lucide-react';

interface MatrixViewProps {
  data: OrgNodeData;
}

export function MatrixView({ data }: MatrixViewProps) {
  const matrixData = useMemo(() => {
    const units: OrgNodeData[] = [];
    const collectUnits = (node: OrgNodeData) => {
      units.push(node);
      if (node.children) {
        node.children.forEach(collectUnits);
      }
    };
    collectUnits(data);

    return units.filter(u => u.type === 'Division' || u.type === 'Department');
  }, [data]);

  const riskLevels = ['Low', 'Medium', 'High'] as const;
  const complianceStatuses = ['compliant', 'warning', 'non-compliant'] as const;

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-amber-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getComplianceColor = (status?: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-500';
      case 'warning': return 'bg-amber-500';
      case 'non-compliant': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5" />
            Risk Level Matrix
          </CardTitle>
          <CardDescription>
            Organization units mapped by risk level and size
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted text-left font-medium">Unit</th>
                  {riskLevels.map(level => (
                    <th key={level} className="border p-2 bg-muted text-center font-medium">
                      {level} Risk
                    </th>
                  ))}
                  <th className="border p-2 bg-muted text-center font-medium">Total Users</th>
                </tr>
              </thead>
              <tbody>
                {matrixData.map(unit => (
                  <tr key={unit.id} className="hover:bg-muted/50 transition-colors">
                    <td className="border p-2 font-medium">
                      <div>
                        <div>{unit.name}</div>
                        <div className="text-xs text-muted-foreground">{unit.type}</div>
                      </div>
                    </td>
                    {riskLevels.map(level => (
                      <td key={level} className="border p-2 text-center">
                        {unit.riskLevel === level ? (
                          <div className="flex items-center justify-center">
                            <div className={`w-4 h-4 rounded-full ${getRiskColor(level)}`} />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-gray-200" />
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="border p-2 text-center font-medium">
                      {unit.userCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Status Matrix</CardTitle>
          <CardDescription>
            Organization units mapped by compliance status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted text-left font-medium">Unit</th>
                  {complianceStatuses.map(status => (
                    <th key={status} className="border p-2 bg-muted text-center font-medium capitalize">
                      {status}
                    </th>
                  ))}
                  <th className="border p-2 bg-muted text-center font-medium">Health Score</th>
                </tr>
              </thead>
              <tbody>
                {matrixData.map(unit => (
                  <tr key={unit.id} className="hover:bg-muted/50 transition-colors">
                    <td className="border p-2 font-medium">
                      <div>
                        <div>{unit.name}</div>
                        <div className="text-xs text-muted-foreground">{unit.type}</div>
                      </div>
                    </td>
                    {complianceStatuses.map(status => (
                      <td key={status} className="border p-2 text-center">
                        {unit.complianceStatus === status ? (
                          <div className="flex items-center justify-center">
                            <div className={`w-4 h-4 rounded-full ${getComplianceColor(status)}`} />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-gray-200" />
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="border p-2 text-center">
                      <Badge variant={
                        (unit.healthScore || 0) >= 80 ? 'default' :
                        (unit.healthScore || 0) >= 60 ? 'secondary' :
                        'destructive'
                      }>
                        {unit.healthScore || 0}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Risk Levels</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-sm">Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500" />
                <span className="text-sm">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-sm">High</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Compliance Status</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-sm">Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500" />
                <span className="text-sm">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-sm">Non-Compliant</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
