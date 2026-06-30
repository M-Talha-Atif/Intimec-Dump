"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, LucideIcon, Loader2, LayoutGrid, List, Activity, Shield, Database, Clock, Search, Briefcase, Users } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useTileManagement } from '@/hooks/useTileManagement';
import TileManagementDialog from './TileManagementDialog';
import { CategoryTileConfig } from '@/types/access-portal';
import { useCurrentUserRoles } from '@/hooks/useCurrentUserRoles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomPagination from "@/components/applications/common/CustomPagination";
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import TileDeletionGuardDialog from './TileDeletionGuardDialog';

interface CategoryTilesProps {
  onCategoryClick: (category: string, tileId: string) => void;
  selectedCategory: string | null;
  isAdmin?: boolean;
}

const CategoryTiles: React.FC<CategoryTilesProps> = ({
  onCategoryClick,
  selectedCategory,
  isAdmin: isAdminProp,
}) => {
  const {
    tiles,
    loading,
    error,
    updateTile,
    deleteTile,
    addTile,
    fetchTileById,
    isCreating,
    isUpdating,
    isDeleting,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    goToPage,
    changePageSize,
  } = useTileManagement();

  const { toast } = useToast();
  const { loading: loadingRoles } = useCurrentUserRoles();
  const isAdmin = true; // or your actual admin check

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTile, setEditingTile] = useState<CategoryTileConfig | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [loadingTileId, setLoadingTileId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // New state for view mode
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletionGuardOpen, setDeletionGuardOpen] = useState(false);
  const [tileToDelete, setTileToDelete] = useState<{ id: string; title: string } | null>(null);


  // Filter tiles based on search, category, and status
  const filteredTiles = tiles.filter(tile => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      tile.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tile.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tile.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = categoryFilter === 'all' ||
      tile.category.toLowerCase() === categoryFilter.toLowerCase();

    // Status filter
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && tile.isActive) ||
      (statusFilter === 'inactive' && !tile.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Use filteredTiles instead of activeTiles in your render
  const displayTiles = filteredTiles;

  // Filter only active tiles
  // const activeTiles = tiles.filter(t => t.isActive);

  const getIcon = (iconName: string): LucideIcon => {
    return (LucideIcons as any)[iconName] || LucideIcons.AppWindow;
  };
  const handleEditTile = async (tile: CategoryTileConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoadingTileId(tile.id);
      const fullTileData = await fetchTileById(tile.id);
      if (!fullTileData) {
        toast({
          title: "Error",
          description: "Failed to load tile details",
          variant: "destructive",
        });
        return;
      }
      setEditingTile(fullTileData);
      setDialogMode('edit');
      setDialogOpen(true);
    } catch (error) {
      console.error('Error loading tile:', error);
      toast({
        title: "Error",
        description: "Failed to load tile details",
        variant: "destructive",
      });
    } finally {
      setLoadingTileId(null);
    }
  };

  const handleDeleteTile = async (tileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const tile = tiles.find(t => t.id === tileId);
    if (tile) {
      setTileToDelete({ id: tile.id, title: tile.title });
      setDeletionGuardOpen(true);
    }
  };

  const confirmDeleteTile = async () => {
    if (!tileToDelete) return;

    try {
      await deleteTile(tileToDelete.id);
      toast({
        title: "Success",
        description: "Tile deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting tile:', error);
      throw error; // Re-throw to be handled by dialog
    }
  };
  const handleCreateTile = () => {
    setEditingTile(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleSaveTile = async (tileData: Partial<CategoryTileConfig>) => {
    try {
      if (dialogMode === 'create') {
        await addTile(tileData);
        toast({
          title: "Success",
          description: "Tile created successfully",
        });
      } else if (editingTile) {
        await updateTile(editingTile.id, tileData);
        toast({
          title: "Success",
          description: "Tile updated successfully",
        });
      }
      setDialogOpen(false);
      setEditingTile(null);
    } catch (error) {
      console.error('Error saving tile:', error);
      toast({
        title: "Error",
        description: dialogMode === 'create' ? "Failed to create tile" : "Failed to update tile",
        variant: "destructive",
      });
    }
  };

  const handlePageSizeChange = (value: string) => {
    changePageSize(parseInt(value));
  };


  if (error && tiles.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive font-semibold">Error loading tiles</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <>
        {/* Header Card with Filters */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-semibold tracking-tight">
                  Access tiles
                </CardTitle>
                {totalItems > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{displayTiles.length}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> total tiles
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Items Per Page with Tooltip */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Tiles per page:</span>
                        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                          <SelectTrigger className="w-[70px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent align="end">
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="200">200</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Number of tiles displayed per page</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* View Toggle with Tooltip */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                        value={viewMode}
                        onValueChange={(value) => {
                          if (value === 'grid' || value === 'list') {
                            setViewMode(value);
                          }
                        }}
                        className="border rounded-lg"
                      >
                        <ToggleGroupItem value="grid" aria-label="Grid view" className="px-3">
                          <LayoutGrid className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="list" aria-label="List view" className="px-3">
                          <List className="h-4 w-4" />
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Switch between {viewMode === 'grid' ? 'grid' : 'list'} and {viewMode === 'grid' ? 'list' : 'grid'} view</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Admin Action Button */}
                {isAdmin && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={handleCreateTile} size="sm" className="h-9">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Tile
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Create a new access category tile</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>

            {/* Filter Bar - You can add search/filter here if needed */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
              {/* Search with Tooltip */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative flex-1 min-w-[240px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tiles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p>Search by tile title or description or category</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Category Type Filter */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full sm:w-[180px]">
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full h-9">
                          <div className="flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="All categories" />
                          </div>
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="applications">Applications</SelectItem>
                          <SelectItem value="roles">Roles</SelectItem>
                          <SelectItem value="entitlements">Entitlements</SelectItem>
                          <SelectItem value="resources">Resources</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Filter by category type</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Status Filter */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full sm:w-[180px]">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full h-9">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="All statuses" />
                          </div>
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="active">Active Only</SelectItem>
                          <SelectItem value="inactive">Inactive Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Filter by tile status</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Active Filters Summary */}
            {(searchQuery || (categoryFilter !== 'all' && categoryFilter !== '') || (statusFilter !== 'all' && statusFilter !== '')) && (
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-destructive focus:outline-none"
                      aria-label="Remove search filter"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {categoryFilter !== 'all' && categoryFilter !== '' && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    Category: {categoryFilter}
                    <button
                      onClick={() => setCategoryFilter('all')}
                      className="ml-1 hover:text-destructive focus:outline-none"
                      aria-label="Remove category filter"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {statusFilter !== 'all' && statusFilter !== '' && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="ml-1 hover:text-destructive focus:outline-none"
                      aria-label="Remove status filter"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Grid View */}
        {viewMode === 'grid' ? (
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading && tiles.length === 0 ? (
                // Skeleton loader
                <div className="col-span-full flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading category tiles...</span>
                </div>
              ) : (
                <>
                  {displayTiles.map(tile => {
                    const Icon = getIcon(tile.icon);
                    const isLoading = loadingTileId === tile.id;

                    return (
                      <Card
                        key={tile.id}
                        className={cn(
                          "group relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30",
                          isLoading && "opacity-50 pointer-events-none",
                          isLoading && "animate-pulse"
                        )}
                        onClick={() => !isLoading && onCategoryClick(tile.category, tile.id)}
                      >
                        {isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg z-10">
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              <p className="text-xs text-muted-foreground">Loading tile...</p>
                            </div>
                          </div>
                        )}

                        {/* Admin Actions */}
                        {isAdmin && !loading && (
                          <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white shadow-sm border"
                                    onClick={(e) => handleEditTile(tile, e)}
                                    disabled={isLoading}
                                  >
                                    <Edit className="h-3.5 w-3.5 text-blue-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  <p>Edit this tile's configuration and settings</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white shadow-sm border"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTileToDelete({ id: tile.id, title: tile.title });
                                      setDeletionGuardOpen(true);
                                    }}
                                    disabled={isLoading}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  <p>Delete this tile permanently</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}

                        {/* Card Header with Icon */}
                        <CardHeader className="pb-2 pt-6 px-5">
                          <div className="flex items-start gap-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={cn(
                                  "p-2.5 rounded-xl flex-shrink-0 transition-colors cursor-help",
                                  tile.isActive
                                    ? "bg-gradient-to-br from-primary/20 to-primary/5"
                                    : "bg-muted"
                                )}>
                                  <Icon className={cn(
                                    "h-6 w-6",
                                    tile.isActive ? "text-primary" : "text-muted-foreground"
                                  )} />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="text-xs">
                                <p>Tile icon: {tile.icon || 'Default'}</p>
                              </TooltipContent>
                            </Tooltip>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <CardTitle className="text-lg font-semibold text-foreground leading-tight truncate cursor-help">
                                      {tile.title}
                                    </CardTitle>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    <p>Tile title: {tile.title}</p>
                                    <p className="text-muted-foreground">Click to view all items in this category</p>
                                  </TooltipContent>
                                </Tooltip>

                                {!tile.isActive && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="text-[10px] px-1.5 h-4 border-muted-foreground/30 text-muted-foreground cursor-help">
                                        Inactive
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      <p>This tile is currently inactive and hidden from users</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="text-xs text-muted-foreground truncate cursor-help">
                                    Category: {tile.category}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                  <p>Access category: {tile.category}</p>
                                  <p className="text-muted-foreground">Groups related access items together</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4 px-5 pb-5">
                          {/* Description with Tooltip */}

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.5rem] cursor-help">
                                {tile.description || "No description provided"}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs max-w-xs">
                              <p className="font-medium mb-1">Description:</p>
                              <p className="text-muted-foreground">{tile.description || "No description available for this tile"}</p>
                            </TooltipContent>
                          </Tooltip>

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-2 gap-3 pt-3">
                            {/* Total Items */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-muted/30 rounded-lg p-2 hover:bg-muted/50 transition-colors cursor-help">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                      <Database className="h-3 w-3" />
                                      <span>Items</span>
                                    </div>
                                    <div className="font-semibold text-lg">{tile.itemCount ?? 0}</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                  <p>Total number of access items in this category</p>
                                  <p className="text-muted-foreground">Includes applications, roles, and entitlements</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {/* Approval Rate */}
                            {/* Approval Rate */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-muted/30 rounded-lg p-2 hover:bg-muted/50 transition-colors cursor-help">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                      <Shield className="h-3 w-3" />
                                      <span>Approval</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="font-semibold text-lg">
                                        {tile.approvalRate != null ? Math.round(tile.approvalRate) : 0}%
                                      </div>
                                      <Badge
                                        variant="secondary"
                                        className={cn(
                                          "text-[10px] px-1.5 h-4",
                                          (tile.approvalRate ?? 0) >= 90
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            : (tile.approvalRate ?? 0) >= 70
                                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                        )}
                                      >
                                        {(tile.approvalRate ?? 0) >= 90
                                          ? 'High'
                                          : (tile.approvalRate ?? 0) >= 70
                                            ? 'Medium'
                                            : 'Low'}
                                      </Badge>
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                  <p>Tile approval rate: {tile.approvalRate != null ? tile.approvalRate.toFixed(2) : 0}%</p>
                                  <p className="text-muted-foreground">
                                    Aggregated from all {tile.itemCount ?? 0} items in this category
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                        </CardContent>


                        <Tooltip open={false}>
                          <TooltipTrigger asChild>
                            <div className="absolute inset-0 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            <p>Click to view all {tile.category} items</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Hover Overlay Effect */}
                        <div className="absolute inset-0 rounded-lg pointer-events-none bg-gradient-to-t from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Card>

                    );
                  })}
                </>
              )}
            </div>
          </div>
        ) : (
          /* List/Table View */
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]"></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Approval Rate</TableHead>
                  {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && tiles.length === 0 ? (
                  // Skeleton rows for initial load
                  Array.from({ length: pageSize }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  displayTiles.map((tile) => {
                    const Icon = getIcon(tile.icon);
                    const isLoading = loadingTileId === tile.id;

                    return (
                      <TableRow
                        key={tile.id}
                        className={`cursor-pointer hover:bg-muted/50 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                        onClick={() => onCategoryClick(tile.category, tile.id)}
                      >
                        <TableCell>
                          <div className="p-2 bg-brand-teal/10 rounded-lg w-fit">
                            <Icon className="h-5 w-5 text-brand-teal" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{tile.title}</TableCell>
                        <TableCell className="text-muted-foreground max-w-md truncate">
                          {tile.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {tile.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{tile.itemCount ?? 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {tile.approvalRate != null ? Math.round(tile.approvalRate) : 0}%
                            </span>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[10px] px-1.5 h-4",
                                (tile.approvalRate ?? 0) >= 90
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : (tile.approvalRate ?? 0) >= 70
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              )}
                            >
                              {(tile.approvalRate ?? 0) >= 90
                                ? 'High'
                                : (tile.approvalRate ?? 0) >= 70
                                  ? 'Medium'
                                  : 'Low'}
                            </Badge>
                          </div>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={(e) => handleEditTile(tile, e)}
                                disabled={isLoading}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => handleDeleteTile(tile.id, e)}
                                disabled={isLoading || isDeleting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Loading indicator */}
        {loading && tiles.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating tiles...</span>
          </div>
        )}

        {/* Pagination */}
        {/* Pagination */}
        {totalPages > 1 && (
          <CustomPagination
            totalElements={totalItems}
            totalPages={totalPages}
            useCallbackMode={true}
            page={currentPage}
            size={pageSize}
            defaultSize={25}
            onPageChange={(newPage) => goToPage(newPage)}
            onSizeChange={(newSize) => changePageSize(newSize)}
          />
        )}

        {/* Tile Management Dialog */}
        <TileManagementDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          tile={editingTile}
          onSave={handleSaveTile}
          mode={dialogMode}
          isLoading={isCreating || isUpdating}
        />

        {/* Tile Deletion Guard Dialog */}
        {tileToDelete && (
          <TileDeletionGuardDialog
            open={deletionGuardOpen}
            onOpenChange={setDeletionGuardOpen}
            tileId={tileToDelete.id}
            tileTitle={tileToDelete.title}
            onConfirmDelete={confirmDeleteTile}
          />
        )}
      </>
    </TooltipProvider>
  );
};

export default CategoryTiles;