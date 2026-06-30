import { Card } from "@/components/ui/card";
import { OrgNodeData } from "@/types/organization";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AccessPatternComparisonProps {
  units: OrgNodeData[];
}

export function AccessPatternComparison({ units }: AccessPatternComparisonProps) {
  const accessData = units.map(unit => ({
    name: unit.name,
    privilegedUsers: unit.privilegedUserCount || 0,
    contractors: unit.contractorCount || 0,
    applications: unit.applicationCount || 0,
    privilegedPercentage: unit.userCount > 0 
      ? ((unit.privilegedUserCount || 0) / unit.userCount * 100).toFixed(1)
      : 0,
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Access Pattern Analysis</h3>
      
      <div className="grid gap-6">
        <div>
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Privileged vs Standard Access</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={accessData}>
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
              <Bar dataKey="privilegedUsers" name="Privileged Users" fill="hsl(var(--destructive))" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accessData.map((unit) => (
            <Card key={unit.name} className="p-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">{unit.name}</div>
              <div className="space-y-2">
                <div>
                  <div className="text-2xl font-bold">{unit.privilegedPercentage}%</div>
                  <div className="text-xs text-muted-foreground">Privileged Access Rate</div>
                </div>
                <div className="pt-2 border-t space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Contractors:</span>
                    <span className="font-medium">{unit.contractors}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Applications:</span>
                    <span className="font-medium">{unit.applications}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Key Insights</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            {accessData.map((unit, index) => {
              const privilegedPct = parseFloat(unit.privilegedPercentage as string);
              if (privilegedPct > 10) {
                return (
                  <li key={index}>
                    • <span className="font-medium text-foreground">{unit.name}</span>: High privileged access rate ({unit.privilegedPercentage}%) - Review access necessity
                  </li>
                );
              }
              return null;
            }).filter(Boolean)}
            {accessData.every(u => parseFloat(u.privilegedPercentage as string) <= 10) && (
              <li>• All units have appropriate privileged access levels</li>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
}
