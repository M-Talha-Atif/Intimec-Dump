import { Label } from '@/components/ui/label';
import { OrgNodeData } from '@/types/organization';

interface OrgOverviewBasicInfoProps {
  node: OrgNodeData;
}

export function OrgOverviewBasicInfo({ node }: OrgOverviewBasicInfoProps) {
  if (!node.head && !node.description) return null;

  return (
    <div className="space-y-3">
      {node.head && (
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Head</Label>
          <p className="text-sm mt-1">{node.head}</p>
        </div>
      )}
      {node.description && (
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Description</Label>
          <p className="text-sm mt-1">{node.description}</p>
        </div>
      )}
    </div>
  );
}
