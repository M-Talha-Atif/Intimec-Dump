import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { OrgNodeData } from '@/types/organization';
import { MapPin, Users } from 'lucide-react';

interface OrgOverviewMetadataProps {
  node: OrgNodeData;
  delegatedApprovers: string[];
}

export function OrgOverviewMetadata({ node, delegatedApprovers }: OrgOverviewMetadataProps) {
  return (
    <>
      {/* Location, Cost Center, Region */}
      <div className="space-y-4">
        {node.location && (
          <div>
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground mb-1">
              <MapPin className="h-3 w-3" />
              Location
            </div>
            <p className="text-sm">{node.location}</p>
          </div>
        )}
        {node.costCenter && (
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Cost Center</Label>
            <p className="text-sm mt-1">{node.costCenter}</p>
          </div>
        )}
        {node.region && (
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Region</Label>
            <p className="text-sm mt-1">{node.region}</p>
          </div>
        )}
      </div>

      {/* Delegated Approvers */}
      {delegatedApprovers.length > 0 && (
        <div>
          <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground mb-2">
            <Users className="h-3 w-3" />
            Delegated Approvers
          </div>
          <div className="flex flex-wrap gap-2">
            {delegatedApprovers.map((approver, index) => (
              <Badge key={index} variant="secondary">
                {approver}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
