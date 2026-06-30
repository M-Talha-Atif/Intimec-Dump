import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Upload,
  Grid3x3,
  List,
  MoreVertical,
  Play,
  Copy,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useSoDPolicies, useDeletePolicy } from '@/hooks/useSoDPolicies';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { SoDPolicy } from '@/types/sodPolicies';
import {
  PolicyDetailsModal,
  PolicyEditModal,
  PolicyCloneModal,
  PolicyTestModal,
  PolicyImportModal,
  PolicyExportModal,
  AdvancedPolicyFiltersModal,
  BulkPolicyTestModal,
} from '../modals';

interface PolicyManagementHubProps {
  onCreatePolicy?: () => void;
  onEditPolicy?: (policy: SoDPolicy) => void;
  onViewPolicy?: (policy: SoDPolicy) => void;
}

export const PolicyManagementHub = ({ 
  onCreatePolicy, 
  onEditPolicy,
  onViewPolicy 
}: PolicyManagementHubProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState<string[]>([]);
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  
  // Modal states
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const [bulkTestModalOpen, setBulkTestModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<SoDPolicy | null>(null);

  const { data: policies, isLoading } = useSoDPolicies({
    search: searchQuery,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    riskLevel: riskFilter.length > 0 ? riskFilter.join(',') : undefined,
  });

  const deletePolicy = useDeletePolicy();

  const togglePolicySelection = (policyId: string) => {
    setSelectedPolicies(prev =>
      prev.includes(policyId)
        ? prev.filter(id => id !== policyId)
        : [...prev, policyId]
    );
  };

  const selectAllPolicies = () => {
    if (selectedPolicies.length === policies?.length) {
      setSelectedPolicies([]);
    } else {
      setSelectedPolicies(policies?.map(p => p.id) || []);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Policy Library</h2>
          <p className="text-muted-foreground mt-1">
            {policies?.length || 0} policies · {selectedPolicies.length} selected
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={() => setExportModalOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => { setSelectedPolicy(null); setEditModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Policy
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search policies by name, description, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setFiltersModalOpen(true)}>
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
              
              <div className="border-l pl-2 flex gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Risk Filter Pills */}
          <div className="flex gap-2 mt-4">
            {['critical', 'high', 'medium', 'low'].map((risk) => (
              <Badge
                key={risk}
                variant={riskFilter.includes(risk) ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => {
                  setRiskFilter(prev =>
                    prev.includes(risk)
                      ? prev.filter(r => r !== risk)
                      : [...prev, risk]
                  );
                }}
              >
                {risk}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedPolicies.length > 0 && (
        <Card className="bg-primary/5 border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedPolicies.length === policies?.length}
                  onCheckedChange={selectAllPolicies}
                />
                <span className="font-medium">{selectedPolicies.length} selected</span>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setBulkTestModalOpen(true)}>
                  <Play className="h-4 w-4 mr-2" />
                  Test Selected
                </Button>
                <Button variant="outline" size="sm" onClick={() => setExportModalOpen(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  Activate
                </Button>
                <Button variant="outline" size="sm">
                  Deactivate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policies Grid/List */}
      {isLoading ? (
        <div className="text-center py-12">Loading policies...</div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies?.map((policy) => (
            <Card key={policy.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Checkbox
                    checked={selectedPolicies.includes(policy.id)}
                    onCheckedChange={() => togglePolicySelection(policy.id)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setSelectedPolicy(policy); setDetailsModalOpen(true); }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedPolicy(policy); setEditModalOpen(true); }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedPolicy(policy); setCloneModalOpen(true); }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Clone
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedPolicy(policy); setTestModalOpen(true); }}>
                        <Play className="h-4 w-4 mr-2" />
                        Test Policy
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => deletePolicy.mutate(policy.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(policy.status)}
                    <CardTitle className="text-base line-clamp-1">{policy.name}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{policy.description}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Badge variant={getRiskBadgeVariant(policy.riskLevel)} className="capitalize">
                      {policy.riskLevel}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {policy.enforcementMode}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-muted rounded-lg">
                      <p className="text-lg font-bold">{policy.violationCount}</p>
                      <p className="text-xs text-muted-foreground">Violations</p>
                    </div>
                    <div className="p-2 bg-muted rounded-lg">
                      <p className="text-lg font-bold">{policy.exceptionCount}</p>
                      <p className="text-xs text-muted-foreground">Exceptions</p>
                    </div>
                    <div className="p-2 bg-muted rounded-lg">
                      <p className="text-lg font-bold">{policy.affectedUsers}</p>
                      <p className="text-xs text-muted-foreground">Users</p>
                    </div>
                  </div>

                  {policy.complianceFrameworks && policy.complianceFrameworks.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {policy.complianceFrameworks.slice(0, 3).map((framework, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {framework.framework}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Modified {new Date(policy.lastModified).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {policies?.map((policy) => (
                <div key={policy.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Checkbox
                        checked={selectedPolicies.includes(policy.id)}
                        onCheckedChange={() => togglePolicySelection(policy.id)}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(policy.status)}
                          <h3 className="font-medium truncate">{policy.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{policy.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant={getRiskBadgeVariant(policy.riskLevel)} className="capitalize">
                        {policy.riskLevel}
                      </Badge>

                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-bold">{policy.violationCount}</p>
                          <p className="text-xs text-muted-foreground">Violations</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold">{policy.exceptionCount}</p>
                          <p className="text-xs text-muted-foreground">Exceptions</p>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedPolicy(policy); setDetailsModalOpen(true); }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedPolicy(policy); setEditModalOpen(true); }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedPolicy(policy); setCloneModalOpen(true); }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Clone
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deletePolicy.mutate(policy.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {policies?.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No policies found</p>
            <Button onClick={() => { setSelectedPolicy(null); setEditModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Policy
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All Modals */}
      {selectedPolicy && (
        <>
          <PolicyDetailsModal
            policy={selectedPolicy}
            open={detailsModalOpen}
            onOpenChange={setDetailsModalOpen}
            onEdit={() => { setDetailsModalOpen(false); setEditModalOpen(true); }}
            onTest={() => { setDetailsModalOpen(false); setTestModalOpen(true); }}
          />
          <PolicyCloneModal
            policy={selectedPolicy}
            open={cloneModalOpen}
            onClose={() => setCloneModalOpen(false)}
            onClone={() => setCloneModalOpen(false)}
          />
          <PolicyTestModal
            policy={selectedPolicy}
            open={testModalOpen}
            onOpenChange={setTestModalOpen}
          />
        </>
      )}

      <PolicyEditModal
        policy={selectedPolicy}
        open={editModalOpen}
        onOpenChange={(open) => { 
          setEditModalOpen(open); 
          if (!open) setSelectedPolicy(null); 
        }}
        onSave={() => { setEditModalOpen(false); setSelectedPolicy(null); }}
      />

      <PolicyImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={() => setImportModalOpen(false)}
      />

      <PolicyExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        selectedPolicies={selectedPolicies}
      />

      <AdvancedPolicyFiltersModal
        open={filtersModalOpen}
        onClose={() => setFiltersModalOpen(false)}
        onApply={(filters) => {
          console.log('Applied filters:', filters);
          setFiltersModalOpen(false);
        }}
      />

      <BulkPolicyTestModal
        open={bulkTestModalOpen}
        onClose={() => setBulkTestModalOpen(false)}
        selectedPolicies={selectedPolicies}
      />
    </div>
  );
};
