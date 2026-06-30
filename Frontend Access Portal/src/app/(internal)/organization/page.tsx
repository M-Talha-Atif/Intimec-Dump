'use client';
import { useMemo, useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, Upload, Download, Network, ListTree, Workflow } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StandardTabs from '@/components/shared/StandardTabs';
import IconTabs from '@/components/shared/IconTabs';
import EnhancedTreeView from "@/components/organization/EnhancedTreeView";
import EnhancedGraphView from "@/components/organization/EnhancedGraphView";
import { ComparisonView } from "@/components/organization/ComparisonView";
import { MatrixView } from "@/components/organization/MatrixView";
import { ReviewLauncher } from "@/components/organization/ReviewLauncher";
import { OrgAnalyticsDashboardV2 } from "@/components/organization/OrgAnalyticsDashboardV2";
import { ImportOrgWizard } from "@/components/organization/ImportOrgWizard";
import { ExportOrgDialog } from "@/components/organization/ExportOrgDialog";
import { orgData as initialOrgData } from '@/data/mock-organization';
import { mockRoles } from '@/data/mock-roles';
import { OrgNodeData } from '@/types/organization';
import { getRoleHealthIssues } from '@/lib/role-health';
import { useAIAssistant } from '@/contexts/AIAssistantContext';

const OrganizationPage = () => {
  useDocumentTitle('Organization');
  const { setIsAssistantOpen } = useAIAssistant();
  const [primaryTab, setPrimaryTab] = useState('analytics');
  const [explorerTab, setExplorerTab] = useState('tree');
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showReviewLauncher, setShowReviewLauncher] = useState(false);
  const [selectedUnitsForReview, setSelectedUnitsForReview] = useState<OrgNodeData[]>([]);
  const [selectedUnitsForComparison, setSelectedUnitsForComparison] = useState<OrgNodeData[]>([]);

  const orgData = useMemo(() => {
    const augment = (node: OrgNodeData): OrgNodeData => {
      const rolesInNode = mockRoles.filter(role => role.businessUnit === node.name);
      const hasStaleRolesInNode = rolesInNode.some(role =>
        getRoleHealthIssues(role).some(issue => issue.key === 'stale-review')
      );
      let childrenRoleCount = 0;
      let hasStaleRolesInChildren = false;
      let augmentedChildren;
      if (node.children) {
        augmentedChildren = node.children.map(child => {
          const augmentedChild = augment(child);
          childrenRoleCount += augmentedChild.roleCount;
          if (augmentedChild.hasStaleRoles) hasStaleRolesInChildren = true;
          return augmentedChild;
        });
      }
      return {
        ...node,
        roleCount: rolesInNode.length + childrenRoleCount,
        hasStaleRoles: hasStaleRolesInNode || hasStaleRolesInChildren,
        children: augmentedChildren,
      };
    };
    return augment(initialOrgData);
  }, []);

  const handleAIAnalysis = () => {
    setIsAssistantOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      <div className="mb-6">
        <PageHeader
          title="Organizational Explorer"
          description="Interactive visualization of departments, reporting lines, access relationships, and risk insights"
          icon={<Network className="h-6 w-6 text-primary" />}
          tooltip="Interactive visualization of departments, reporting lines, access relationships, and risk insights. Analytics provides organizational governance intelligence. Explorer offers tree, graph, matrix, and comparison views."
          actions={
            <>
              <Button variant="outline" size="sm" onClick={() => setShowImportWizard(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </>
          }
        />
      </div>

      <Tabs value={primaryTab} onValueChange={setPrimaryTab} className="flex-1 flex flex-col">
        <div className="mb-4">
          <StandardTabs
            tabs={[
              { value: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
              { value: "explorer", label: "Explorer", icon: <Network className="h-4 w-4" /> },
            ]}
          />
        </div>

        <TabsContent value="analytics" className="flex-1 overflow-auto">
          <OrgAnalyticsDashboardV2 data={orgData} />
        </TabsContent>

        <TabsContent value="explorer" className="flex-1 flex flex-col">
          <Tabs value={explorerTab} onValueChange={setExplorerTab} className="flex-1 flex flex-col">
            <IconTabs
              tabs={[
                { value: "tree", label: "Tree View", icon: ListTree },
                { value: "graph", label: "Graph View", icon: Workflow },
                { value: "matrix", label: "Matrix View", icon: Workflow },
                { value: "comparison", label: "Comparison", icon: ListTree },
              ]}
              columns={4}
            />

            <TabsContent value="tree" className="flex-1 mt-4">
              <EnhancedTreeView data={orgData} onAIAnalysis={handleAIAnalysis} />
            </TabsContent>
            <TabsContent value="graph" className="flex-1 mt-4">
              <EnhancedGraphView data={orgData} onAIAnalysis={handleAIAnalysis} onImport={() => setShowImportWizard(true)} />
            </TabsContent>
            <TabsContent value="matrix" className="flex-1 overflow-auto mt-4">
              <MatrixView data={orgData} />
            </TabsContent>
            <TabsContent value="comparison" className="flex-1 overflow-auto mt-4">
              <ComparisonView currentTree={orgData} selectedUnits={selectedUnitsForComparison} historicalTrees={[]} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <ImportOrgWizard open={showImportWizard} onOpenChange={setShowImportWizard} onImportComplete={() => {}} />
      <ExportOrgDialog open={showExportDialog} onOpenChange={setShowExportDialog} data={orgData} />
      <ReviewLauncher open={showReviewLauncher} onOpenChange={setShowReviewLauncher} selectedUnits={selectedUnitsForReview} />
    </div>
  );
};

export default OrganizationPage;
