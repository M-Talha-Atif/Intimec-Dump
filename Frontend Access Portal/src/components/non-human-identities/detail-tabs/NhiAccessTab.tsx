
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const mockGrants = [
  { objectType: 'Policy', name: 'S3FullAccess', risk: 'High', source: 'Manual', lastUsed: '2025-02-25' },
  { objectType: 'Role', name: 'EC2Admin', risk: 'High', source: 'Role-Based', lastUsed: '2025-02-26' },
  { objectType: 'Permission', name: 'CloudWatch:ReadLogs', risk: 'Low', source: 'Role-Based', lastUsed: '2025-02-26' },
  { objectType: 'Permission', name: 'IAM:ListUsers', risk: 'Medium', source: 'Derived', lastUsed: '2025-02-20' },
  { objectType: 'Policy', name: 'DatabaseBackup', risk: 'Low', source: 'Role-Based', lastUsed: '2025-02-24' },
];

const riskColors = { Low: 'bg-green-100 text-green-800', Medium: 'bg-yellow-100 text-yellow-800', High: 'bg-red-100 text-red-800' };

const NhiAccessTab = ({ identity }: { identity: any }) => {
  const [hideLowRisk, setHideLowRisk] = useState(false);
  const privileges = identity.privileges || ['Read', 'Write', 'Admin'];
  const grants = identity.grants || mockGrants;
  const filtered = grants.filter((g: any) => !hideLowRisk || g.risk !== 'Low');
  const highRisk = grants.filter((g: any) => g.risk === 'High').length;

  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><p className="text-xs text-muted-foreground">Total Privileges</p><p className="text-xl font-bold">{privileges.length}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Grants</p><p className="text-xl font-bold text-blue-600">{grants.length}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground">Manual</p><p className="text-xl font-bold text-purple-600">{grants.filter((g: any) => g.source === 'Manual').length}</p></Card>
        <Card className="p-3">
          <div className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-red-500" /><p className="text-xs text-muted-foreground">High Risk</p></div>
          <p className="text-xl font-bold text-red-600">{highRisk}</p>
        </Card>
      </div>

      {/* Privileges */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Assigned Privileges</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {privileges.map((priv: string, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div><p className="text-sm font-medium">{priv}</p><p className="text-xs text-muted-foreground">Direct assignment</p></div>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Grants */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Access Grants ({filtered.length})</CardTitle>
            <Button size="sm" variant={hideLowRisk ? 'default' : 'outline'} onClick={() => setHideLowRisk(!hideLowRisk)} className="text-xs">
              <Filter className="h-3 w-3 mr-1" />Hide Low Risk
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.map((grant: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{grant.name}</p>
                    <p className="text-xs text-muted-foreground">{grant.objectType} • {grant.source}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn('text-xs', riskColors[grant.risk as keyof typeof riskColors])}>{grant.risk}</Badge>
                  <span className="text-xs text-muted-foreground">{grant.lastUsed}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NhiAccessTab;
