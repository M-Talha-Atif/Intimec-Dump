"use client";

import React, { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, ShoppingCart, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getStatusColor, getStatusBadgeVariant } from '@/utils/statusColors';

interface TileDeletionImpact {
  tileId: string;
  tileTitle: string;
  canDelete: boolean;
  deleteBlockReason?: string;
  impactSummary: {
    totalCartItems: number;
    activeCartItems: number;
    totalRequests: number;
    blockingRequests: number;
    processedRequests: number;
  };
  affectedCartItems: Array<{
    cartItemId: string;
    itemName: string;
    itemType: string;
    status: string;
    userId: string;
    createdAt: string;
  }>;
  affectedRequests: Array<{
    requestId: string;
    status: string;
    requestedByUserName: string;
    requestedByUserId: string;
    requestedAt: string;
    itemCount: number;
    items: Array<{
      itemId: string;
      itemName: string;
      itemType: string;
      requestTarget: string;
      beneficiaryCount: number;
    }>;
  }>;
}

interface TileDeletionGuardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tileId: string;
  tileTitle: string;
  onConfirmDelete: () => Promise<void>;
}

const TileDeletionGuardDialog: React.FC<TileDeletionGuardDialogProps> = ({
  open,
  onOpenChange,
  tileId,
  tileTitle,
  onConfirmDelete,
}) => {
  const [impact, setImpact] = useState<TileDeletionImpact | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && tileId) {
      fetchDeletionImpact();
    }
  }, [open, tileId]);

  const fetchDeletionImpact = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/access-portal/tiles/${tileId}/deletion-impact`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch deletion impact');
      }

      const json = await res.json();
      setImpact(json.data);
    } catch (err) {
      console.error('Error fetching deletion impact:', err);
      setError(err instanceof Error ? err.message : 'Failed to load deletion impact');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      await onConfirmDelete();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deletion failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl flex flex-col p-0 h-full">
        <div className="flex flex-col h-full">
          {/* Fixed Header */}
          <div className="flex-shrink-0 px-6 py-4">
            <SheetHeader className="!p-0">
              <SheetTitle className="flex items-center gap-2 text-xl">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Delete Tile: {tileTitle}
              </SheetTitle>
              <SheetDescription>
                Analyzing the impact of deleting this tile on existing cart items and access requests.
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 min-h-0 px-6 overflow-y-auto">
            <div className="py-4 space-y-4">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Analyzing impact...</span>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {impact && !loading && (
                <div className="space-y-4">
                  {/* Blocking Warning */}
                  {!impact.canDelete && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription className="ml-2">
                        {impact.deleteBlockReason}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Cart Items Impact */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          Cart Items Impact
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total Cart Items:</span>
                            <Badge variant="outline">{impact.impactSummary.totalCartItems}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Active Items:</span>
                            <Badge variant={impact.impactSummary.activeCartItems > 0 ? "destructive" : "secondary"}>
                              {impact.impactSummary.activeCartItems}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Requests Impact */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Access Requests Impact
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total Requests:</span>
                            <Badge variant="outline">{impact.impactSummary.totalRequests}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Blocking Requests:</span>
                            <Badge variant={impact.impactSummary.blockingRequests > 0 ? "destructive" : "secondary"}>
                              {impact.impactSummary.blockingRequests}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Processed Requests:</span>
                            <Badge variant="secondary">{impact.impactSummary.processedRequests}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Affected Cart Items */}
                  {impact.affectedCartItems.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Affected Cart Items ({impact.affectedCartItems.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {impact.affectedCartItems.map((item) => {
                            const statusColors = getStatusColor(item.status);
                            return (
                              <div key={item.cartItemId} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{item.itemName}</p>
                                  <p className="text-xs text-muted-foreground">{item.itemType}</p>
                                </div>
                                <Badge
                                  variant={getStatusBadgeVariant(item.status)}
                                  className={cn(
                                    statusColors.bg,
                                    statusColors.text
                                  )}
                                >
                                  {item.status}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Affected Requests */}
                  {impact.affectedRequests.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Affected Access Requests ({impact.affectedRequests.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {impact.affectedRequests.map((request) => {
                            const statusColors = getStatusColor(request.status);
                            return (
                              <div key={request.requestId} className="border rounded p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium">{request.requestedByUserName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(request.requestedAt).toLocaleDateString()} • {request.itemCount} items
                                    </p>
                                  </div>
                                  <Badge
                                    variant={getStatusBadgeVariant(request.status)}
                                    className={cn(
                                      statusColors.bg,
                                      statusColors.text
                                    )}
                                  >
                                    {request.status}
                                  </Badge>
                                </div>
                                {request.items.length > 0 && (
                                  <div className="pl-4 border-l-2 space-y-1">
                                    {request.items.slice(0, 3).map((item) => (
                                      <p key={item.itemId} className="text-xs text-muted-foreground">
                                        • {item.itemName} ({item.itemType})
                                      </p>
                                    ))}
                                    {request.items.length > 3 && (
                                      <p className="text-xs text-muted-foreground">+ {request.items.length - 3} more items</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Success Message */}
                  {impact.canDelete && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="ml-2">
                        This tile can be safely deleted. All affected requests have been processed and no active cart items exist.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer with Actions */}
          <div className="flex-shrink-0 px-6 py-4">
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={!impact?.canDelete || deleting || loading}
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete Tile'}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TileDeletionGuardDialog;