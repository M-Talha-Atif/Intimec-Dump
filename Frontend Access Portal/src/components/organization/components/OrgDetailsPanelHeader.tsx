import { Badge } from '@/components/ui/badge';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { OrgNodeData } from '@/types/organization';

interface OrgDetailsPanelHeaderProps {
  node: OrgNodeData;
}

export function OrgDetailsPanelHeader({ node }: OrgDetailsPanelHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 flex-shrink-0">
      <div>
        <CardTitle className="text-2xl mb-2">{node.name}</CardTitle>
        <div className="flex gap-2">
          <Badge variant="outline">{node.type}</Badge>
          {node.riskLevel && (
            <Badge variant={node.riskLevel === 'High' ? 'destructive' : node.riskLevel === 'Medium' ? 'default' : 'secondary'}>
              {node.riskLevel} Risk
            </Badge>
          )}
          {node.complianceStatus && (
            <Badge variant={node.complianceStatus === 'compliant' ? 'default' : node.complianceStatus === 'warning' ? 'secondary' : 'destructive'}>
              {node.complianceStatus}
            </Badge>
          )}
        </div>
      </div>
    </CardHeader>
  );
}
