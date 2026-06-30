import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AccessItem } from '@/data/mock-access-portal';
import { mockHierarchicalAccessItems } from '@/data/mock-access-hierarchy';
import CategoryTiles from './CategoryTiles';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import AccessCatalog from './AccessCatalog';
import HierarchicalNavigator from './HierarchicalNavigator';
import AccessItemDetailsModal from './AccessItemDetailsModal';
import { useTileManagement } from '@/hooks/useTileManagement';
import { useTileAccessScope } from '@/hooks/useTileAccessScope';
import { combineFilters } from '@/utils/objectTypeFilterEngine';
import { useToast } from '@/hooks/use-toast';
import CustomPagination from "@/components/applications/common/CustomPagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, List } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RequestAccessTabProps {
  accessItems: AccessItem[];
  onAddToCart: (item: AccessItem) => void;
  cartItems: AccessItem[];
}

const RequestAccessTab: React.FC<RequestAccessTabProps> = ({
  accessItems,
  onAddToCart,
  cartItems,
}) => {
  const { tiles } = useTileManagement();
  const { fetchTileAccessItems, loading: loadingAccessScope } = useTileAccessScope();
  const { toast } = useToast();

  const [view, setView] = useState<'categories' | 'catalog' | 'hierarchical'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [detailsModalItem, setDetailsModalItem] = useState<AccessItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // State for dynamically loaded access items
  const [dynamicAccessItems, setDynamicAccessItems] = useState<AccessItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    last: true,
  });

  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');



  const handleCategoryClick = async (category: string, tileId: string) => {
    console.log('[handleCategoryClick]', { category, tileId });

    setSelectedCategory(category);
    setSelectedTileId(tileId);
    setNavigationPath([category]);
    setCurrentParentId(null);
    setCurrentPage(0);              // reset page
    setDynamicAccessItems([]);      // clear previous items
    setView('hierarchical');

    try {
      // fetchTileAccessItems returns an object, not an array!

      const result = await fetchTileAccessItems(tileId, 0, pageSize);
      const items = result.items; // Extract items from result

      console.log('[handleCategoryClick] Fetched result:', result);
      console.log('[handleCategoryClick] Items:', items);

      if (items.length === 0) {
        toast({
          title: 'No items found',
          description: 'This tile has no configured access items.',
          variant: 'default',
        });
      }

      // Items already have category and tileId from the hook
      setDynamicAccessItems(items);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading tile items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load access items for this tile.',
        variant: 'destructive',
      });
      setDynamicAccessItems([]);
    }
  };


  const handlePageSizeChange = async (value: string) => {
    const newSize = parseInt(value);
    setPageSize(newSize);
    setCurrentPage(0);

    if (!selectedTileId) return;
    try {
      const result = await fetchTileAccessItems(selectedTileId, 0, newSize);
      setDynamicAccessItems(result.items);
      setPagination(result.pagination);
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error',
        description: 'Failed to reload items.',
        variant: 'destructive',
      });
    }
  };



  const handleNavigateToItem = (item: AccessItem) => {
    if (item.childCount && item.childCount > 0) {
      setNavigationPath([...navigationPath, item.name]);
      setCurrentParentId(item.id);
    }
  };

  const handleNavigateBack = () => {
    if (navigationPath.length > 1) {
      const newPath = navigationPath.slice(0, -1);
      setNavigationPath(newPath);

      const parentItem = getHierarchicalItems().find(
        (item) => item.name === newPath[newPath.length - 1]
      );
      setCurrentParentId(parentItem?.id || null);
    } else {
      setView('categories');
      setNavigationPath([]);
      setCurrentParentId(null);
      setSelectedCategory(null);
      setSelectedTileId(null);
      setDynamicAccessItems([]);
    }
  };

  const handleViewDetails = (item: AccessItem) => {
    setDetailsModalItem(item);
    setDetailsModalOpen(true);
  };

  /**
  * Get hierarchical items - use dynamic items if available
  */
  const getHierarchicalItems = (): AccessItem[] => {
    if (!selectedCategory) return [];

    const tile = tiles.find((t) => t.category === selectedCategory);

    // Use dynamically loaded items directly without filtering by parentId
    const sourceItems = dynamicAccessItems.length > 0
      ? dynamicAccessItems
      : mockHierarchicalAccessItems.filter(item => item.category === selectedCategory);

    // For API-loaded items, skip filters entirely
    if (dynamicAccessItems.length > 0) {
      console.log('[getHierarchicalItems] Returning API items directly:', sourceItems.length);
      return sourceItems; // Return items without any filtering
    }

    // Original logic for mock hierarchical items
    if (!tile) {
      if (!currentParentId) {
        return sourceItems.filter((item) => !item.parentId);
      }
      return sourceItems.filter((item) => item.parentId === currentParentId);
    }

    // Apply object type and visual filters ONLY for mock data
    const filteredItems = sourceItems.filter((item) =>
      combineFilters(item, tile.objectTypeFilter, tile.visualFilters, selectedCategory)
    );

    if (!currentParentId) {
      return filteredItems.filter((item) => !item.parentId);
    }

    return filteredItems.filter((item) => item.parentId === currentParentId);
  };

  const getFilteredAccessItems = () => {
    if (!selectedCategory) return accessItems;

    const tile = tiles.find((t) => t.category === selectedCategory);

    if (!tile) {
      return accessItems.filter((item) => item.category === selectedCategory);
    }

    return accessItems.filter((item) =>
      combineFilters(item, tile.objectTypeFilter, tile.visualFilters, selectedCategory)
    );
  };

  const getCartCount = (itemId: string) => {
    return cartItems.filter(item => item.id === itemId).length;
  };



  return (
    <TooltipProvider>
      <div className="space-y-6">

        {view === 'categories' ? (
          <CategoryTiles
            onCategoryClick={handleCategoryClick}
            selectedCategory={selectedCategory}
            isAdmin={true}
          />
        ) : view === 'hierarchical' ? (
          <div className="space-y-4">
            <>
              {/* Header Card with Navigation and Controls */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  {/* Breadcrumb Navigation */}
                  {navigationPath.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={handleNavigateBack} className="h-8">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>Return to previous level</p>
                        </TooltipContent>
                      </Tooltip>

                      <div className="flex items-center gap-2 flex-1 flex-wrap">
                        {navigationPath.map((path, index) => (
                          <React.Fragment key={index}>
                            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="cursor-help text-xs py-1">
                                  {path}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Current location: {path}</p>
                              </TooltipContent>
                            </Tooltip>

                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Title and Controls Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl font-semibold tracking-tight">
                        Access Items
                      </CardTitle>
                      {pagination.totalElements > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Showing <span className="font-medium">{getHierarchicalItems().length}</span> of{' '}
                          <span className="font-medium">{pagination.totalElements}</span> total items
                          {selectedCategory && (
                            <> in <span className="font-medium">{selectedCategory}</span></>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Items Per Page with Tooltip */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">Items per page:</span>
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
                          <p>Number of items displayed per page</p>
                        </TooltipContent>
                      </Tooltip>


                      {/* View Toggle with Tooltip */}
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
                    </div>
                  </div>

                  {/* Navigation Context */}
                  {navigationPath.length > 0 && (
                    <div className="flex flex-wrap items-center gap-4 pt-3 mt-2">
                      <span className="text-xs font-medium text-muted-foreground">Current location:</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 cursor-help">
                            <div className="text-xs text-muted-foreground">
                              Level {navigationPath.length} {navigationPath.length === 1 ? '' : 'deep'}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs max-w-xs">
                          <p className="font-medium">Navigation depth</p>
                          <p className="text-muted-foreground">You are {navigationPath.length} level{navigationPath.length !== 1 ? 's' : ''} deep in the hierarchy</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 cursor-help">
                            <Badge variant="outline" className="text-xs">
                              {getHierarchicalItems().length} items
                            </Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs max-w-xs">
                          <p className="font-medium">Available items</p>
                          <p className="text-muted-foreground">Number of items at current level</p>
                        </TooltipContent>
                      </Tooltip>

                    </div>
                  )}
                </CardHeader>
              </Card>

              {/* Hierarchical Navigator */}
              <HierarchicalNavigator
                items={getHierarchicalItems()}
                currentPath={navigationPath}
                onNavigate={handleNavigateToItem}
                onBack={handleNavigateBack}
                onAddToCart={onAddToCart}
                onViewDetails={handleViewDetails}
                cartItems={cartItems}
                displayMode={viewMode}
                isLoading={loadingAccessScope}
              />

              {/* Pagination */}
              {!loadingAccessScope && pagination.totalPages > 1 && (
                <CustomPagination
                  totalElements={pagination.totalElements}
                  totalPages={pagination.totalPages}
                  useCallbackMode={true}
                  page={currentPage}
                  size={pageSize}
                  defaultSize={10}
                  onPageChange={async (newPage) => {
                    if (!selectedTileId || newPage === currentPage) return;
                    try {
                      const result = await fetchTileAccessItems(selectedTileId, newPage, pageSize);
                      setDynamicAccessItems(result.items);
                      setPagination(result.pagination);
                      setCurrentPage(newPage);
                    } catch (error) {
                      console.log(error);
                      toast({
                        title: 'Error',
                        description: 'Failed to load page.',
                        variant: 'destructive',
                      });
                    }
                  }}
                  onSizeChange={async (newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(0);
                    if (!selectedTileId) return;
                    try {
                      const result = await fetchTileAccessItems(selectedTileId, 0, newSize);
                      setDynamicAccessItems(result.items);
                      setPagination(result.pagination);
                    } catch (error) {
                      console.log(error);
                      toast({
                        title: 'Error',
                        description: 'Failed to reload items.',
                        variant: 'destructive',
                      });
                    }
                  }}
                />
              )}
            </>

          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setView('categories');
                  setSelectedCategory(null);
                  setSelectedTileId(null);
                  setDynamicAccessItems([]);
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>
              {selectedCategory && (
                <Badge variant="secondary" className="text-sm">
                  Viewing: {selectedCategory}
                </Badge>
              )}
            </div>
            <AccessCatalog
              items={getFilteredAccessItems()}
              onAddToCart={onAddToCart}
              cartItems={cartItems}
            />
          </div>
        )}

        <AccessItemDetailsModal
          item={detailsModalItem}
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
          onAddToCart={onAddToCart}
          isInCart={false}
          getCartCount={getCartCount}
        />


      </div>
    </TooltipProvider>
  );
};

export default RequestAccessTab;