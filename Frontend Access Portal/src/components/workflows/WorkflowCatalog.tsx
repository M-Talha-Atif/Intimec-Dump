import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { workflowApi } from "@/services/workflowApi";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Search, Plus, Filter, Grid, List, SortAsc, SortDesc,
  Users, Shield, CheckCircle, XCircle, Zap, AlertTriangle, MoreVertical,
  Play, Copy, Archive, Download, Settings, Pencil, Trash2, ArrowUpDown, Activity,
} from 'lucide-react';
import { Workflow, WorkflowCategory, WorkflowStatus, TriggerType } from '@/data/mock-workflows';
import WorkflowCard from './WorkflowCard';
import { WorkflowDetailPanel } from './workflow-detail-panel';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkflowCatalogProps {
  workflows: Workflow[];
  onCreateNew?: () => void;
  onEditWorkflow?: (workflow: Workflow) => void;
  onRunWorkflow?: (workflow: Workflow) => void;
  onTestWorkflow?: (workflow: Workflow) => void;
  onCloneWorkflow?: (workflow: Workflow) => void;
  onWorkflowsChange?: () => void; // Callback to refresh workflows after status change
  onStatusUpdate?: (workflowId: string, newStatus: 'draft' | 'enabled' | 'archived') => void; // Optimistic update
}

const WorkflowCatalog: React.FC<WorkflowCatalogProps> = ({
  workflows,
  onCreateNew,
  onEditWorkflow,
  onRunWorkflow,
  onTestWorkflow,
  onCloneWorkflow,
  onWorkflowsChange,
  onStatusUpdate
}) => {
  const [showHeader] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WorkflowCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<WorkflowStatus | 'all'>('all');
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'executions'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(700);
  const [isResizing, setIsResizing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null);

  const { toast } = useToast();

  const categoryStats = useMemo(() => {
    const stats = {
      all: workflows.length,
      'joiner-mover-leaver': 0,
      'access-request': 0,
      'certification': 0,
      'revocation': 0,
      'exception': 0,
      'ai-risk': 0
    };

    workflows.forEach(workflow => {
      stats[workflow.category]++;
    });

    return stats;
  }, [workflows]);

  const filteredWorkflows = useMemo(() => {
    let filtered = workflows.filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || workflow.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || workflow.status === selectedStatus;
      const matchesTrigger = selectedTrigger === 'all' || workflow.triggerType === selectedTrigger;

      return matchesSearch && matchesCategory && matchesStatus && matchesTrigger;
    });

    // Sort workflows
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'executions':
          comparison = a.executionCount - b.executionCount;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [workflows, searchTerm, selectedCategory, selectedStatus, selectedTrigger, sortBy, sortOrder]);

  const handleCardClick = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsPanelOpen(true);
  };

  const handleRunWorkflow = (workflow: Workflow) => {
    console.log('Running workflow:', workflow.name);
    toast({
      title: "Workflow Executed",
      description: `${workflow.name} has been successfully started.`,
    });
    onRunWorkflow?.(workflow);
  };

  const handleArchiveWorkflow = (workflow: Workflow) => {
    const action = workflow.status === 'archived' ? 'unarchived' : 'archived';
    console.log(`Workflow ${action}:`, workflow.name);
    toast({
      title: `Workflow ${action}`,
      description: `${workflow.name} has been ${action}.`,
    });
  };

  const handleExportWorkflow = (workflow: Workflow) => {
    console.log('Workflow exported:', workflow.name);
    toast({
      title: "Workflow Exported",
      description: `${workflow.name} has been exported as JSON.`,
    });
  };

  const handleSetDefault = (workflow: Workflow) => {
    console.log('Set as default:', workflow.name);
    toast({
      title: "Default Workflow Set",
      description: `${workflow.name} is now the default for ${workflow.triggerType} triggers.`,
    });
  };

  const handleAssignOwner = (workflow: Workflow) => {
    console.log('Assign owner dialog opened for:', workflow.name);
    toast({
      title: "Owner Assignment",
      description: "Owner assignment feature will be implemented soon.",
    });
  };

  const handleStatusToggle = async (workflow: Workflow, newStatus: 'draft' | 'enabled' | 'archived') => {
    try {
      console.log(`Toggling workflow ${workflow.name} from ${workflow.status} to ${newStatus}`);

      // Optimistically update UI immediately
      if (onStatusUpdate) {
        onStatusUpdate(workflow.id, newStatus);
      }

      // Call API to update status (frontend: enabled, backend: ACTIVE)
      await workflowApi.updateWorkflowStatus(workflow.id, newStatus);

      toast({
        title: "Workflow Status Updated",
        description: `${workflow.name} is now ${newStatus}.`,
      });

    } catch (error) {
      console.error('Failed to toggle workflow status:', error);
      toast({
        title: "Error",
        description: "Failed to update workflow status. Please try again.",
        variant: "destructive",
      });

      // Revert optimistic update on error
      if (onStatusUpdate) {
        onStatusUpdate(workflow.id, workflow.status);
      }
    }
  };

  const handleDeleteWorkflow = async (workflow: Workflow) => {
    setWorkflowToDelete(workflow);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteWorkflow = async () => {
    if (!workflowToDelete) return;

    try {
      const result = await workflowApi.deleteWorkflow(workflowToDelete.id);

      // Check if operation was denied (403 returns null)
      if (result === null) {
        return;
      }

      toast({
        title: "Workflow Deleted",
        description: `"${workflowToDelete.name}" has been deleted successfully.`,
      });
      setIsPanelOpen(false);
      setShowDeleteConfirm(false);
      setWorkflowToDelete(null);
      onWorkflowsChange?.(); // Refresh workflows list
    } catch (error: any) {
      console.error('Failed to delete workflow:', error);
      toast({
        title: "Delete Failed",
        description: error.response?.data?.message || "Failed to delete workflow. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCategoryLabel = (category: WorkflowCategory | 'all') => {
    const labels = {
      'all': 'All Workflows',
      'joiner-mover-leaver': 'Joiner / Mover / Leaver',
      'access-request': 'Access Request & Approval',
      'certification': 'Certification Campaigns',
      'revocation': 'Access Revocation',
      'exception': 'Manual Fulfillment',
      'ai-risk': 'AI-assisted Risk-Based'
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Workflows</h2>
          <p className="text-sm text-gray-600">Orchestrate Identity and Access Lifecycles with Ease</p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div>
              <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters & Search
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                Search workflows or filter by status, trigger type and sorting
              </p>
            </div>

          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3">

            {/* Search */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search workflows, descriptions, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Search by workflow name, description or tags</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Status */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full sm:w-[150px] max-w-[150px] min-w-0">
                    <Select
                      value={selectedStatus}
                      onValueChange={(v) => setSelectedStatus(v as WorkflowStatus | 'all')}
                    >
                      <SelectTrigger className="h-9 w-full overflow-hidden">
                        <div className="flex items-center gap-2 w-full min-w-0">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate flex-1">
                            <SelectValue placeholder="Status" />
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent align="end">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Filter workflows by status</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Trigger */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full sm:w-[170px] max-w-[170px] min-w-0">
                    <Select
                      value={selectedTrigger}
                      onValueChange={(v) => setSelectedTrigger(v as TriggerType | 'all')}
                    >
                      <SelectTrigger className="h-9 w-full overflow-hidden">
                        <div className="flex items-center gap-2 w-full min-w-0">
                          <Zap className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate flex-1">
                            <SelectValue placeholder="Trigger" />
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent align="end">
                        <SelectItem value="all">All Triggers</SelectItem>
                        <SelectItem value="event-based">Event-based</SelectItem>
                        <SelectItem value="time-based">Time-based</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Filter workflows by trigger type</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Sort */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full sm:w-[160px] max-w-[160px] min-w-0">
                    <Select
                      value={sortBy}
                      onValueChange={(v) => setSortBy(v as 'name' | 'updated' | 'executions')}
                    >
                      <SelectTrigger className="h-9 w-full overflow-hidden">
                        <div className="flex items-center gap-2 w-full min-w-0">
                          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate flex-1">
                            <SelectValue placeholder="Sort by" />
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent align="end">
                        <SelectItem value="updated">Recently Updated</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="executions">Executions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Sort workflows</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Sort Order */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc'
                      ? <SortAsc className="h-4 w-4" />
                      : <SortDesc className="h-4 w-4" />
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Toggle sort order
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* View */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid'
                      ? <List className="h-4 w-4" />
                      : <Grid className="h-4 w-4" />
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Switch view mode
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

          </div>

          {/* Active Filters */}
          {(searchTerm || selectedStatus !== "all" || selectedTrigger !== "all" || sortBy !== "updated") && (
            <div className="flex items-center gap-2 pt-2 flex-wrap">

              <span className="text-xs text-muted-foreground">Active filters:</span>

              {searchTerm && (
                <Badge variant="secondary" className="text-xs gap-1">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}

              {selectedStatus !== "all" && (
                <Badge variant="secondary" className="text-xs gap-1">
                  Status: {selectedStatus}
                  <button onClick={() => setSelectedStatus("all")} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}

              {selectedTrigger !== "all" && (
                <Badge variant="secondary" className="text-xs gap-1">
                  Trigger: {selectedTrigger}
                  <button onClick={() => setSelectedTrigger("all")} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}

              {sortBy !== "updated" && (
                <Badge variant="secondary" className="text-xs gap-1">
                  Sort: {sortBy}
                  <button onClick={() => setSortBy("updated")} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStatus("all");
                  setSelectedTrigger("all");
                  setSortBy("updated");
                }}
              >
                Clear all
              </Button>

            </div>
          )}

        </CardHeader>
      </Card>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as WorkflowCategory | 'all')}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All ({categoryStats.all})
          </TabsTrigger>
          <TabsTrigger value="joiner-mover-leaver" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            JML ({categoryStats['joiner-mover-leaver']})
          </TabsTrigger>
          <TabsTrigger value="access-request" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Access ({categoryStats['access-request']})
          </TabsTrigger>
          <TabsTrigger value="certification" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Cert ({categoryStats['certification']})
          </TabsTrigger>
          <TabsTrigger value="revocation" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Revoke ({categoryStats['revocation']})
          </TabsTrigger>
          <TabsTrigger value="exception" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Exception ({categoryStats['exception']})
          </TabsTrigger>
          <TabsTrigger value="ai-risk" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            AI ({categoryStats['ai-risk']})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          {filteredWorkflows.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Filter className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or create a new workflow.
              </p>
              <Button onClick={onCreateNew} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create New Workflow
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
              {filteredWorkflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onEdit={onEditWorkflow}
                  onRun={handleRunWorkflow}
                  onTest={onTestWorkflow}
                  onClone={onCloneWorkflow}
                  onArchive={handleArchiveWorkflow}
                  onExport={handleExportWorkflow}
                  onSetDefault={handleSetDefault}
                  onAssignOwner={handleAssignOwner}
                  onStatusToggle={handleStatusToggle}
                  onAdvancedSettings={handleCardClick}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <ScrollArea className="h-[calc(100vh-400px)]">
                <Table>
                  <TableHeader className="bg-background sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Workflow Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Trigger</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Executions</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="w-10"><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWorkflows.map((workflow) => (
                      <TableRow key={workflow.id} className="cursor-pointer" onClick={() => handleCardClick(workflow)}>
                        <TableCell className="w-10">
                          {workflow.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium max-w-xs">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold truncate" title={workflow.name}>{workflow.name}</span>
                            <div className="flex flex-wrap gap-1">
                              {workflow.tags.slice(0, 2).map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                              {workflow.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">+{workflow.tags.length - 2}</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <span className="text-sm text-muted-foreground line-clamp-2">{workflow.description}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {workflow.category.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {workflow.triggerType.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={workflow.status === 'enabled' ? 'default' : workflow.status === 'draft' ? 'secondary' : 'outline'}
                            className={`text-xs ${workflow.status === 'enabled' ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' :
                              workflow.status === 'draft' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20' :
                                'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
                              }`}
                          >
                            {workflow.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{workflow.executionCount}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{new Date(workflow.updatedAt).toLocaleDateString()}</span>
                        </TableCell>
                        <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => onEditWorkflow?.(workflow)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRunWorkflow(workflow)}>
                                <Play className="mr-2 h-4 w-4" />
                                Run
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onCloneWorkflow?.(workflow)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Clone
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleExportWorkflow(workflow)}>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleArchiveWorkflow(workflow)}>
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteWorkflow(workflow)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {isPanelOpen && selectedWorkflow && (
        <div
          className="fixed top-0 right-0 h-full z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          style={{ width: `${panelWidth}px` }}
        >
          <div
            className="absolute left-0 top-0 w-2 h-full bg-muted hover:bg-muted/80 cursor-col-resize flex items-center justify-center group"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);

              const handleMouseMove = (e: MouseEvent) => {
                const newWidth = window.innerWidth - e.clientX;
                if (newWidth >= 400 && newWidth <= 1200) {
                  setPanelWidth(newWidth);
                }
              };

              const handleMouseUp = () => {
                setIsResizing(false);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div className="w-0.5 h-8 bg-muted-foreground/60 rounded-full group-hover:bg-muted-foreground"></div>
          </div>

          <WorkflowDetailPanel
            workflow={selectedWorkflow}
            onClose={() => {
              setIsPanelOpen(false);
              setSelectedWorkflow(null);
            }}
            onEdit={(workflow) => {
              setIsPanelOpen(false);
              onEditWorkflow?.(workflow);
            }}
            onRun={handleRunWorkflow}
            onClone={(workflow) => {
              setIsPanelOpen(false);
              onCloneWorkflow?.(workflow);
            }}
            onDelete={handleDeleteWorkflow}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{workflowToDelete?.name}"</strong>?
              This action cannot be undone and will permanently remove the workflow and all its configurations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWorkflowToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteWorkflow}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkflowCatalog;
