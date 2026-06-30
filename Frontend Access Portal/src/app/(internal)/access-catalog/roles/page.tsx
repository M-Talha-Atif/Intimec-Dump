'use client';

import RoleDetailView from "@/components/roles/RoleDetailView";
import RoleHierarchyTree from "@/components/roles/RoleHierarchyTree";
import { Role, RoleFilterState } from "@/types/roles";
import IconTabs from "@/components/shared/IconTabs";
import { Upload, Download, Plus, X, BarChart3, FolderTree, BookOpen, UserCheck, Activity, ClipboardCheck, Shield, LoaderCircle } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import "@/styles/react-flow.css";
import RoleFilterPanel from "@/components/roles/RoleFilterPanel";
import RoleIntelligence from "@/components/roles/analytics/RoleIntelligence";
import RoleUsageCoverage from "@/components/roles/analytics/RoleUsageCoverage";
import RoleOwnershipHealth from "@/components/roles/analytics/RoleOwnershipHealth";
import RoleRiskCompliance from "@/components/roles/analytics/RoleRiskCompliance";
import RoleReviewsAnalytics from "@/components/roles/analytics/RoleReviewsAnalytics";
import AddRoleWizard from "@/components/roles/wizards/AddRoleWizard";
import ImportExportDialog from "@/components/shared/ImportExportDialog";
import StandardTabs from "@/components/shared/StandardTabs";
import PageHeader from "@/components/shared/PageHeader";
import { useAccessRoles } from "@/hooks/access-catalogue/roles/use-access-roles";
import { toUiRoles } from "@/lib/role-adapter";

const ROLE_TEMPLATE_FIELDS = ["name", "type", "businessUnit", "classification", "status", "owner", "description"];

const roleAnalyticsTabs = [
  { value: "intelligence", label: "Intelligence", icon: Activity },
  { value: "usage", label: "Usage & Coverage", icon: BarChart3 },
  { value: "ownership", label: "Ownership & Health", icon: UserCheck },
  { value: "risk", label: "Risk & Compliance", icon: Shield },
  { value: "reviews", label: "Reviews", icon: ClipboardCheck },
];

export default function Page() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<RoleFilterState>({ types: [], statuses: [], risks: [], classifications: [], businessUnits: [] });
  const [activeTab, setActiveTab] = useState("analytics");
  const [analyticsSubTab, setAnalyticsSubTab] = useState("intelligence");
  const [isAddWizardOpen, setIsAddWizardOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  const { roles: apiRoles, loading, error, refresh } = useAccessRoles({
    size: 100,
    sort: "name,asc",
  });

  const roles: Role[] = useMemo(() => toUiRoles(apiRoles), [apiRoles]);

  const handleRoleCreated = () => {
    refresh();
  };

  /**
   * Called by RoleDetailView after a successful save.
   * Updates the selected role with fresh data from backend and refreshes the sidebar list.
   */
  const handleRoleUpdated = useCallback((freshRole: Role) => {
    setSelectedRole(freshRole);
    refresh();
  }, [refresh]);

  const clearFilters = () => setFilters({ types: [], statuses: [], risks: [], classifications: [], businessUnits: [] });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-background">
      <div>
        <PageHeader
          title="Roles Catalog"
          description="Browse, analyze, and manage roles in an interactive tree-based layout."
          icon={<FolderTree className="h-6 w-6 text-primary" />}
          actions={
            <>
              <Button variant="outline" onClick={() => setIsImportExportOpen(true)}>
                <Upload className="h-4 w-4" /> Import
              </Button>
              <Button variant="outline" onClick={() => setIsImportExportOpen(true)}>
                <Download className="h-4 w-4" /> Export
              </Button>
              <Button onClick={() => setIsAddWizardOpen(true)}>
                <Plus className="h-4 w-4" /> Add Role
              </Button>
            </>
          }
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <StandardTabs
          value={activeTab}
          onValueChange={setActiveTab}
          tabs={[
            { value: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
            { value: "directory", label: "Directory", icon: <BookOpen className="h-4 w-4" /> },
          ]}
        />

        <TabsContent value="analytics" className="flex-1 overflow-y-auto m-0">
          <div className="mt-4">
            <Tabs value={analyticsSubTab} onValueChange={setAnalyticsSubTab}>
              <IconTabs tabs={roleAnalyticsTabs} columns={5} />
              <TabsContent value="intelligence"><RoleIntelligence /></TabsContent>
              <TabsContent value="usage"><RoleUsageCoverage /></TabsContent>
              <TabsContent value="ownership"><RoleOwnershipHealth /></TabsContent>
              <TabsContent value="risk"><RoleRiskCompliance /></TabsContent>
              <TabsContent value="reviews"><RoleReviewsAnalytics /></TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="directory" className="flex-1 overflow-hidden m-0">
          <div className="flex flex-1 h-full overflow-hidden">
            <aside className="w-80 lg:w-96 flex-shrink-0 overflow-y-auto border-r bg-white">
              {loading && (
                <div className="flex items-center justify-center p-6">
                  <LoaderCircle className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">Loading roles...</span>
                </div>
              )}
              {error && !loading && (
                <div className="p-3 mx-2 mt-2 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-xs text-destructive font-medium">Failed to load roles</p>
                  <p className="text-xs text-destructive/70 mt-1">{error}</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={refresh}>Retry</Button>
                </div>
              )}
              {!loading && !error && roles.length === 0 && (
                <div className="text-center p-8 text-sm text-muted-foreground">
                  <p className="font-semibold mb-2">No roles found</p>
                  <p>Create your first role to get started.</p>
                  <Button size="sm" className="mt-4" onClick={() => setIsAddWizardOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Add Role
                  </Button>
                </div>
              )}
              {!loading && !error && roles.length > 0 && (
                <RoleHierarchyTree
                  roles={roles}
                  selectedRole={selectedRole}
                  onSelectRole={setSelectedRole}
                  filters={filters}
                  onFiltersChange={setFilters}
                  onToggleFilters={() => setIsFilterPanelOpen(prev => !prev)}
                />
              )}
            </aside>
            <div className="flex-1 bg-slate-50 overflow-y-auto">
              {selectedRole ? (
                <RoleDetailView
                  role={selectedRole}
                  allRoles={roles}
                  onSelectRole={setSelectedRole}
                  onRoleUpdated={handleRoleUpdated}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">Select a role from the navigator</p>
                </div>
              )}
            </div>
            {isFilterPanelOpen && (
              <aside className="w-80 border-l pl-4 bg-white flex flex-col flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-slate-800">Filter Roles</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsFilterPanelOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <RoleFilterPanel filters={filters} onFiltersChange={setFilters} />
                <div className="p-4 mt-auto">
                  <Button onClick={clearFilters} variant="secondary" className="w-full">Clear All Filters</Button>
                </div>
              </aside>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AddRoleWizard open={isAddWizardOpen} onOpenChange={setIsAddWizardOpen} onRoleCreated={handleRoleCreated} />
      <ImportExportDialog
        open={isImportExportOpen}
        onOpenChange={setIsImportExportOpen}
        entityType="role"
        data={roles}
        templateFields={ROLE_TEMPLATE_FIELDS}
      />
    </div>
  );
}