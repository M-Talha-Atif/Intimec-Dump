
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, Brain } from 'lucide-react';
import TreeBranch from './TreeBranch';
import OrgFilterSidebar from './OrgFilterSidebar';
import { ReviewLauncher } from './ReviewLauncher';
import { OrgNodeData } from '@/types/organization';
import OrgDetailsPanel from './OrgDetailsPanel';

interface FilterState {
  search: string;
  riskLevels: string[];
  hasStaleRoles: boolean;
  minUserCount: number;
  regions: string[];
}

interface EnhancedTreeViewProps {
  data: OrgNodeData;
  onAIAnalysis?: () => void;
}

const EnhancedTreeView = ({ data, onAIAnalysis }: EnhancedTreeViewProps) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    riskLevels: [],
    hasStaleRoles: false,
    minUserCount: 0,
    regions: []
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNode, setSelectedNode] = useState<OrgNodeData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReviewLauncher, setShowReviewLauncher] = useState(false);
  const [selectedNodeForReview, setSelectedNodeForReview] = useState<OrgNodeData | null>(null);

  const filteredData = useMemo(() => {
    const filterNode = (node: OrgNodeData): OrgNodeData | null => {
      // Search filter
      if (filters.search && !node.name.toLowerCase().includes(filters.search.toLowerCase()) && 
          !node.head?.toLowerCase().includes(filters.search.toLowerCase()) &&
          !node.id.toLowerCase().includes(filters.search.toLowerCase())) {
        // Check if any children match
        const hasMatchingChildren = node.children?.some(child => filterNode(child) !== null);
        if (!hasMatchingChildren) return null;
      }

      // Risk level filter
      if (filters.riskLevels.length > 0 && node.riskLevel && !filters.riskLevels.includes(node.riskLevel)) {
        return null;
      }

      // Stale roles filter
      if (filters.hasStaleRoles && !node.hasStaleRoles) {
        return null;
      }

      // Filter children recursively
      const filteredChildren = node.children?.map(filterNode).filter(Boolean) as OrgNodeData[] | undefined;

      return {
        ...node,
        children: filteredChildren
      };
    };

    return filterNode(data) || data;
  }, [data, filters]);

  const handleNodeAction = (action: string, node: OrgNodeData) => {
    switch (action) {
      case 'viewDetails':
        setSelectedNode(node);
        setShowDetails(true);
        break;
      case 'launchReview':
        setSelectedNodeForReview(node);
        setShowReviewLauncher(true);
        break;
      case 'openRoleReport':
        console.log('Opening role report for:', node.name);
        break;
      case 'exportUnit':
        console.log('Exporting unit info for:', node.name);
        break;
    }
  };

  return (
    <div className="flex h-full">
      <OrgFilterSidebar
        filters={filters}
        onFiltersChange={setFilters}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            {onAIAnalysis && (
              <Button variant="outline" size="sm" onClick={onAIAnalysis}>
                <Brain className="h-4 w-4 mr-2" />
                AI Analysis
              </Button>
            )}
          </div>
          
          {(filters.search || filters.riskLevels.length > 0 || filters.hasStaleRoles) && (
            <div className="text-sm text-gray-600">
              Filters active ({Object.values(filters).filter(v => 
                Array.isArray(v) ? v.length > 0 : Boolean(v)
              ).length})
            </div>
          )}
        </div>

        <Card className="flex-1 border-0 rounded-none">
          <CardContent className="p-6">
            <div className="space-y-2">
              <TreeBranch 
                node={filteredData} 
                isRoot={true}
                onNodeAction={handleNodeAction}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <OrgDetailsPanel
        node={selectedNode}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />

      <ReviewLauncher
        open={showReviewLauncher}
        onOpenChange={setShowReviewLauncher}
        selectedUnits={selectedNodeForReview ? [selectedNodeForReview] : []}
      />
    </div>
  );
};

export default EnhancedTreeView;
