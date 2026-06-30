import { OrgNodeData } from '@/types/organization';
import { Building2, Users, Shield } from 'lucide-react';

interface OrgOverviewMetricsProps {
  node: OrgNodeData;
  applicationCount: number;
}

export function OrgOverviewMetrics({ node, applicationCount }: OrgOverviewMetricsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-3 w-3" />
          Users
        </div>
        <p className="text-2xl font-bold">{node.userCount}</p>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Shield className="h-3 w-3" />
          Roles
        </div>
        <p className="text-2xl font-bold">{node.roleCount}</p>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Building2 className="h-3 w-3" />
          Apps
        </div>
        <p className="text-2xl font-bold">{applicationCount}</p>
      </div>
    </div>
  );
}
