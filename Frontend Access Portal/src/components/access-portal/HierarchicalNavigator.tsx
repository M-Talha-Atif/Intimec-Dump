import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Table as TableIcon,
  TrendingUp,
  Shield,
  ShoppingCart,
  Loader2
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { AccessItem } from '@/data/mock-access-portal';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getRiskColorForAccessItem } from '@/components/app-permissions/role-management/utils/roleUtils';
import { getRiskBadgeClass, getRiskIconColor } from '@/utils/getRiskColor';

interface HierarchicalNavigatorProps {
  items: AccessItem[];
  currentPath: string[];
  onNavigate: (item: AccessItem) => void;
  onBack: () => void;
  onAddToCart: (item: AccessItem) => void;
  onViewDetails: (item: AccessItem) => void;
  cartItems: AccessItem[];
  displayMode?: 'grid' | 'list' | 'table';
  onDisplayModeChange?: (mode: 'grid' | 'list' | 'table') => void;
  isLoading?: boolean;
}

const HierarchicalNavigator: React.FC<HierarchicalNavigatorProps> = ({
  items,
  currentPath,
  onNavigate,
  onBack,
  onAddToCart,
  onViewDetails,
  cartItems,
  displayMode = 'grid',
  onDisplayModeChange,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (iconName: string) => {
    return (LucideIcons as any)[iconName] || LucideIcons.Box;
  };


  const isNavigable = (item: AccessItem) => item.childCount && item.childCount > 0;

  // Updated: Make all items requestable (roles, applications, entitlements)
  const isRequestable = (item: AccessItem) => {
    // Items are requestable if they are:
    // 1. Application type
    // 2. Role type (business roles or internal roles)
    // 3. Entitlement type
    // 4. Have no children (leaf nodes)
    return (
      item.type === 'application' ||
      item.type === 'role' ||
      item.type === 'entitlement' ||
      item.type === 'group' ||
      !isNavigable(item)
    );
  };

  // Handle button clicks with event propagation stop
  const handleAddToCart = (e: React.MouseEvent, item: AccessItem) => {
    e.stopPropagation();
    console.log('[HierarchicalNavigator] Adding to cart:', item);
    onAddToCart(item);
  };

  const handleViewDetails = (e: React.MouseEvent, item: AccessItem) => {
    e.stopPropagation();
    console.log('[HierarchicalNavigator] Viewing details:', item);
    onViewDetails(item);
  };

  const handleNavigate = (e: React.MouseEvent, item: AccessItem) => {
    e.stopPropagation();
    console.log('[HierarchicalNavigator] Navigating to:', item);
    onNavigate(item);
  };

  /**
 * Get count of how many times this item is in the cart
 */
  const getCartCount = (itemId: string) => {
    return cartItems.filter(item => item.id === itemId).length;
  };

  return (
    <div className="space-y-4">

      {/* Items Display - Grid Mode */}
      {displayMode === 'grid' && (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">


          {isLoading ? (
            // Loader inside the grid
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading access items...</span>
            </div>
          ) : filteredItems.length > 0 ? (filteredItems.map(item => {
            const Icon = getIcon(item.icon);
            const canRequest = isRequestable(item);
            const risk = item.riskLevel?.toLowerCase();
            const canNavigate = isNavigable(item);

            // Get the badge variant for risk level
            const riskBadgeVariant = getRiskColorForAccessItem(item.riskLevel || '');

            return (
              <Card
                key={item.id}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 cursor-pointer"
              // onClick={(e) => handleViewDetails(e, item)}
              >
                <CardContent className="p-6">
                  {/* Header with Icon and Type */}
                  <div className="flex items-start justify-between mb-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "p-3 rounded-xl transition-colors cursor-help",
                          )}
                          onClick={(e) => e.stopPropagation()} // Prevent card click
                        >
                          <Icon className={cn("h-6 w-6", getRiskIconColor(item.riskLevel))} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-xs">
                        <p>Item type: {item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}</p>
                      </TooltipContent>
                    </Tooltip>

                    <div className="flex flex-col items-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-xs cursor-help" onClick={(e) => e.stopPropagation()}>
                            {item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          <p>Access item type: {item.type}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Title with Tooltip */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1 cursor-help hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-xs">
                      <p className="font-medium mb-1">Item Name:</p>
                      <p className="text-muted-foreground">{item.name}</p>
                      {item.id && (
                        <p className="text-muted-foreground mt-1 text-[10px]">ID: {item.id.slice(-8)}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2 mb-4">
                    {/* Request Count */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-muted/30 rounded-lg p-2 hover:bg-muted/50 transition-colors cursor-help">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>Requests</span>
                          </div>
                          <div className="font-semibold text-lg">
                            {item.requestCount ?? 0}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>Total number of requests</p>
                        <p className="text-muted-foreground">
                          This item has been requested {item.requestCount ?? 0} times
                        </p>
                      </TooltipContent>
                    </Tooltip>


                    {/* Approval Rate */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-muted/30 rounded-lg p-2 hover:bg-muted/50 transition-colors cursor-help">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                            <Shield className="h-3 w-3" />
                            <span>Approval</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-lg">
                              {/* Use actual approvalRate from item */}
                              {item.approvalRate != null ? Math.round(item.approvalRate) : 0}%
                            </div>

                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[10px] px-1.5 h-4",
                                // Use actual approvalRate
                                (item.approvalRate ?? 0) >= 90
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : (item.approvalRate ?? 0) >= 70
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              )}
                            >
                              {(item.approvalRate ?? 0) >= 90
                                ? "High"
                                : (item.approvalRate ?? 0) >= 70
                                  ? "Medium"
                                  : "Low"}
                            </Badge>
                          </div>
                        </div>
                      </TooltipTrigger>

                      <TooltipContent side="bottom" className="text-xs">
                        <p>Approval rate: {item.approvalRate != null ? item.approvalRate.toFixed(2) : 0}%</p>
                        <p className="text-muted-foreground">
                          Based on {item.totalRequests ?? 0} total request{(item.totalRequests ?? 0) !== 1 ? 's' : ''}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-2">
                    {canRequest && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="default"
                              className="w-full transition-all duration-200 hover:scale-[1.02]"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(e, item);
                              }}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              {getCartCount(item.id) > 0
                                ? `In Cart (${getCartCount(item.id)})`
                                : 'Add to Cart'}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            {getCartCount(item.id) > 0 ? (
                              <p>Item is already in your cart ({getCartCount(item.id)} times)</p>
                            ) : (
                              <p>Add this item to your access request cart</p>
                            )}
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full transition-all duration-200 hover:bg-primary/5"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(e, item);
                              }}
                            >
                              View Details
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs max-w-xs">
                            <p>View complete item details</p>
                            <p className="text-muted-foreground">Includes details, permissions, and approval steps</p>
                          </TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </CardContent>

                {/* Hover Overlay Effect */}
                <div className="absolute inset-0 rounded-lg pointer-events-none bg-gradient-to-t from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Card>
            );
          }))
            : (
              // Empty State - with col-span-full to take full width
              <div className="col-span-full">
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? 'No items found matching your search'
                        : 'No access items available'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
        </div>

      )}

      {/* Items Display - List Mode */}
      {
        displayMode === 'list' && (
          <div className="space-y-3">
            {filteredItems.map(item => {
              const Icon = getIcon(item.icon);
              const canRequest = isRequestable(item);
              const canNavigate = isNavigable(item);
              // const inCart = isInCart(item.id);

              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                          {/* {canNavigate && (
                          <Badge variant="secondary" className="text-xs">
                            {item.childCount != null ? item.childCount : 0} items
                          </Badge>
                        )} */}


                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {item.description || 'No description available'}
                        </p>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        {/* {canNavigate && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleNavigate(e, item)}
                        >
                          View Items
                        </Button>
                      )} */}
                        {canRequest && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => handleViewDetails(e, item)}
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={(e) => handleAddToCart(e, item)}

                            >

                              {getCartCount(item.id) > 0
                                ? `In Cart (${getCartCount(item.id)})`
                                : 'Add to Cart'}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      }




    </div >
  );
};

export default HierarchicalNavigator;