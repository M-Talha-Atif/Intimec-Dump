import React, { useState } from 'react';
import { Role } from '@/types/roles';
import { EntitlementResponseDto } from '@/types/entitlements';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, AlertCircle, Server, Loader2 } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  useGroupedRoleEntitlements,
  ApplicationEntitlementGroup,
} from '@/hooks/access-catalogue/roles/entitlements/useGroupedRoleEntitlements';
import { getRiskBadgeClass } from '@/utils/getRiskColor';
import EntitlementsTable, { SortConfig } from '@/components/entitlements/EntitlementsTable';
import CustomPagination from '@/components/applications/common/CustomPagination';

interface RoleEntitlementsViewerProps {
  role: Role;
}

/**
 * Renders entitlements for a single application group using the shared EntitlementsTable.
 * Manages its own sort state since sorting is per-table.
 */
const AppGroupTable: React.FC<{
  appGroup: ApplicationEntitlementGroup;
  entPage: number;
  entSize: number;
  onEntPageChange: (page: number) => void;
  onEntSizeChange: (size: number) => void;
  onEntitlementSelect: (entitlement: EntitlementResponseDto) => void;
}> = ({ appGroup, entPage, entSize, onEntPageChange, onEntSizeChange, onEntitlementSelect }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'displayName',
    direction: 'ascending',
  });

  const { entitlements } = appGroup;

  return (
    <EntitlementsTable
      entitlements={entitlements.content}
      sortConfig={sortConfig}
      onSort={setSortConfig}
      onEntitlementSelect={onEntitlementSelect}
      serverPagination={{
        currentPage: entPage + 1, // EntitlementsTable uses 1-based pages
        totalPages: entitlements.totalPages,
        totalElements: entitlements.totalElements,
        pageSize: entSize,
        onPageChange: (oneBasedPage) => onEntPageChange(oneBasedPage - 1),
        onPageSizeChange: (size) => onEntSizeChange(size),
      }}
    />
  );
};

const RoleEntitlementsViewer: React.FC<RoleEntitlementsViewerProps> = ({ role }) => {
  const {
    data,
    loading,
    error,
    appPage,
    appSize,
    entPage,
    entSize,
    goToAppPage,
    changeAppSize,
    goToEntPage,
    changeEntSize,
  } = useGroupedRoleEntitlements(role.id);

  /**
   * Callback when a user clicks an entitlement row.
   * Can be wired to open a detail drawer/sheet in the future.
   */
  const handleEntitlementSelect = (entitlement: EntitlementResponseDto) => {
    // TODO: Open entitlement detail drawer/sheet
    console.log('Selected entitlement:', entitlement.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading entitlements...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <AlertCircle className="h-6 w-6 mx-auto mb-2" />
        <p className="font-medium">Failed to load entitlements</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!data || data.totalEntitlements === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="font-medium">No entitlements assigned</p>
        <p className="text-sm mt-1">This role has no entitlements. It may be a container or deprecated role.</p>
      </div>
    );
  }

  const { totalApplications, totalEntitlements, applications } = data;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        {/* Summary Strip */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border text-sm">
          <span className="font-medium">
            {totalEntitlements} entitlement{totalEntitlements !== 1 ? 's' : ''}
          </span>
          <span className="text-muted-foreground">across</span>
          <span className="font-medium">
            {totalApplications} application{totalApplications !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Application Groups — pre-grouped by backend */}
        {applications.content.map((appGroup) => {
          const riskCount = appGroup.highRiskCount;
          const riskLevel = riskCount > 0 ? 'High' : 'Low';

          return (
            <Collapsible key={appGroup.resourceId} defaultOpen>
              <CollapsibleTrigger className="flex items-center w-full text-left p-3 rounded-lg hover:bg-muted/50 group border">
                <Server className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium flex-1">{appGroup.resourceName}</span>
                {riskCount > 0 && (
                  <Badge
                    className={cn('text-xs mr-2', getRiskBadgeClass('High'))}
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {riskCount} High Risk
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs mr-2">
                  {appGroup.entitlementCount}
                </Badge>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1">
                <AppGroupTable
                  appGroup={appGroup}
                  entPage={entPage}
                  entSize={entSize}
                  onEntPageChange={goToEntPage}
                  onEntSizeChange={changeEntSize}
                  onEntitlementSelect={handleEntitlementSelect}
                />
              </CollapsibleContent>
            </Collapsible>
          );
        })}

        {/* Application-level pagination */}
        {applications.totalPages > 1 && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-2 font-medium">
              Applications ({applications.totalElements})
            </div>
            <CustomPagination
              useCallbackMode={true}
              totalElements={applications.totalElements}
              totalPages={applications.totalPages}
              page={appPage}
              size={appSize}
              defaultSize={5}
              onPageChange={(page) => goToAppPage(page)}
              onSizeChange={(size) => changeAppSize(size)}
            />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default RoleEntitlementsViewer;