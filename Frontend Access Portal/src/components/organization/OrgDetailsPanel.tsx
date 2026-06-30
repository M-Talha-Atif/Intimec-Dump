import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrgNodeData } from '@/types/organization';
import { UsersTab } from './details/UsersTab';
import { RolesTab } from './details/RolesTab';
import { ComplianceTab } from './details/ComplianceTab';
import { AuditTrailTab } from './details/AuditTrailTab';
import { OrgOverviewBasicInfo } from './components/OrgOverviewBasicInfo';
import { OrgOverviewMetrics } from './components/OrgOverviewMetrics';
import { OrgOverviewScores } from './components/OrgOverviewScores';
import { OrgOverviewMetadata } from './components/OrgOverviewMetadata';
import { OrgOverviewSuggestedActions } from './components/OrgOverviewSuggestedActions';
import { OrgOverviewActions } from './components/OrgOverviewActions';
import { Badge } from '@/components/ui/badge';

interface OrgDetailsPanelProps {
  node: OrgNodeData | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrgDetailsPanel = ({ node, isOpen, onClose }: OrgDetailsPanelProps) => {
  const extendedData = node
    ? {
        location: node.location || 'San Francisco, CA',
        lastReviewDate: '2024-10-15',
        applicationCount: node.applicationCount || 12,
        delegatedApprovers: node.delegates?.map((d) => d.name) || ['Sarah Johnson', 'Mike Chen'],
        privilegedUserCount: node.privilegedUserCount || Math.floor(node.userCount * 0.15),
        lastAuditDate: '2024-11-20',
        suggestedActions: [
          'Review 3 stale role assignments',
          'Audit privileged access for 2 users',
          'Update approval workflows',
        ],
      }
    : null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {node?.name}
          </SheetTitle>
          <SheetDescription className="flex gap-2 flex-wrap">
            {node?.type && <Badge variant="outline">{node.type}</Badge>}
            {node?.riskLevel && (
              <Badge
                variant={
                  node.riskLevel === 'High'
                    ? 'destructive'
                    : node.riskLevel === 'Medium'
                    ? 'default'
                    : 'secondary'
                }
              >
                {node.riskLevel} Risk
              </Badge>
            )}
            {node?.complianceStatus && (
              <Badge
                variant={
                  node.complianceStatus === 'compliant'
                    ? 'default'
                    : node.complianceStatus === 'warning'
                    ? 'secondary'
                    : 'destructive'
                }
              >
                {node.complianceStatus}
              </Badge>
            )}
          </SheetDescription>
        </SheetHeader>

        {node && extendedData && (
          <div className="space-y-6 px-4 py-2">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="audit">Audit Trail</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-4">
                <OrgOverviewBasicInfo node={node} />
                <OrgOverviewMetrics node={node} applicationCount={extendedData.applicationCount} />
                <OrgOverviewScores node={node} />
                <OrgOverviewMetadata node={node} delegatedApprovers={extendedData.delegatedApprovers} />
                <OrgOverviewSuggestedActions actions={extendedData.suggestedActions} />
              </TabsContent>

              <TabsContent value="users" className="mt-4">
                <UsersTab />
              </TabsContent>

              <TabsContent value="roles" className="mt-4">
                <RolesTab />
              </TabsContent>

              <TabsContent value="compliance" className="mt-4">
                <ComplianceTab />
              </TabsContent>

              <TabsContent value="audit" className="mt-4">
                <AuditTrailTab />
              </TabsContent>
            </Tabs>
          </div>
        )}

        <SheetFooter>
          <OrgOverviewActions />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default OrgDetailsPanel;
  