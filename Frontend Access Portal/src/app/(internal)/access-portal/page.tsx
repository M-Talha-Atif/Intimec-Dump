'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Clock, Activity, Send, BarChart3, Sparkles } from 'lucide-react';
import { mockAccessItems, AccessItem } from '@/data/mock-access-portal';
import RequestAccessTab from '@/components/access-portal/RequestAccessTab';
import MyRequests from '@/components/access-portal/MyRequests';
import AccessAnalytics from '@/components/access-portal/AccessAnalytics';
import { toast } from 'sonner';
import { CategoryTileConfig } from '@/types/access-portal';
import { SelectableUser } from '@/data/mock-selectable-users';
import CartSlideout from '@/components/access-portal/CartSlideout';
import TargetUserSelectionModal from '@/components/access-portal/TargetUserSelectionModal';
import { useCart } from '@/hooks/useCart';
import { useAccessRequest } from '@/hooks/useAccessRequest';
import PageHeader from '@/components/shared/PageHeader';
import StandardTabs from '@/components/shared/StandardTabs';
import IconTabs from '@/components/shared/IconTabs';

const AccessPortalPage: React.FC = () => {

  const { cartItems, addToCart, removeFromCart, clearCart, refreshCart } = useCart();
  const { submitRequest, loading: submitting } = useAccessRequest();

  const [accessItems] = useState<AccessItem[]>(mockAccessItems);
  const [primaryTab, setPrimaryTab] = useState('portal');
  const [activeTab, setActiveTab] = useState('request');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Target selection modal state
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<AccessItem | null>(null);
  const [pendingTileConfig, setPendingTileConfig] = useState<CategoryTileConfig | null>(null);
  const [conflictingUserIds, setConflictingUserIds] = useState<string[]>([]);

  const handleWithdrawSuccess = async () => {
    // Reload the requests list in MyRequests component
    // The MyRequests component will handle its own refresh via loadRequests()

    // Refresh the cart to show reactivated items
    await refreshCart();

    // toast.success('Cart updated', {
    //   description: 'Withdrawn items have been returned to your cart.',
    // });
  };

  /**
   * Handle adding item to cart
   */
  const handleAddToCart = async (item: AccessItem) => {
    console.log('[handleAddToCart] Item:', {
      name: item.name,
      allowRequestForOthers: (item as any).allowRequestForOthers,
    });

    // // Check if already in cart
    // if (cartItems.find(cartItem => cartItem.id === item.id)) {
    //   toast.info('Already in cart', {
    //     description: `${item.name} is already in your request cart.`,
    //   });
    //   return;
    // }

    const allowRequestForOthers = (item as any).allowRequestForOthers ?? false;

    if (allowRequestForOthers) {
      // Open target selection modal
      console.log('[handleAddToCart] Opening modal for user selection');
      setPendingItem(item);
      setPendingTileConfig({ allowRequestForOthers: true } as any);
      setConflictingUserIds([]);
      setIsTargetModalOpen(true);

      return;
    }

    // Add to cart via API (self request)
    await addToCart(item, 'self', []);
  };

  /**
  * Handle target user selection confirmation
  */
  const handleTargetSelectionConfirm = async (data: {
    requestTarget: 'self' | 'others';
    beneficiaries: SelectableUser[];
  }) => {
    if (!pendingItem) return;

    console.log('[handleTargetSelectionConfirm] Confirming with:', {
      requestTarget: data.requestTarget,
      beneficiariesCount: data.beneficiaries.length,
      beneficiaries: data.beneficiaries.map(b => ({ id: b.id, name: b.name })),
    });

    const result = await addToCart(pendingItem, data.requestTarget, data.beneficiaries);

    console.log('[handleTargetSelectionConfirm] Result received:', result);

    if (result.success) {
      console.log('[handleTargetSelectionConfirm] ✓ Success');
      setIsTargetModalOpen(false);
      setPendingItem(null);
      setPendingTileConfig(null);
      setConflictingUserIds([]);
      // const description = data.requestTarget === 'self'
      //   ? `${pendingItem.name} has been added to your cart.`
      //   : `${pendingItem.name} will be requested for ${data.beneficiaries.length} user${data.beneficiaries.length !== 1 ? 's' : ''}.`;

      // toast.success('Added to cart', { description });
    }
    else if (result.conflictingUsers && result.conflictingUserIds) {
      console.log('[handleTargetSelectionConfirm] ⚠ Conflicts detected:', {
        conflictingUsers: result.conflictingUsers,
        conflictingUserIds: result.conflictingUserIds,
      });

      setConflictingUserIds(result.conflictingUserIds);

      toast.error('Some users already have access', {
        description: `${result.conflictingUsers.join(', ')} already have access to this item.`,
      });

      console.log('[handleTargetSelectionConfirm] Modal staying open, conflicts set');
      // Modal stays open - conflicting users will be highlighted
    }
    else {
      console.log('[handleTargetSelectionConfirm] ✗ Other error:', result.message);
      setIsTargetModalOpen(false);
      setPendingItem(null);
      setPendingTileConfig(null);
      setConflictingUserIds([]);

      toast.error('Could not add to cart', {
        description: result.message || 'An error occurred',
      });
    }
  };;

  /**
 * Handle removing item from cart
 */
  const handleRemoveFromCart = async (cartId: string): Promise<boolean> => {
    // Directly return the boolean from removeFromCart
    return await removeFromCart(cartId);
  };

  /**
   * Handle clearing entire cart
   */
  const handleClearCart = async (): Promise<boolean> => {
    // Directly return the boolean from clearCart
    return await clearCart();
  };

  /**
   * Handle submitting access request
   */
  const handleSubmitRequest = async (requestData: {
    items: Array<{
      itemId: string;
      cartItemId: string;
      validityDays: number;
      urgency: 'low' | 'medium' | 'high';
      justification: string;
    }>;
    overallJustification: string;
    selfRequestCount: number;
    othersRequestCount: number;
    totalBeneficiaries: number;
  }) => {
    console.log('[handleSubmitRequest] Submitting request:', requestData);

    // Submit request via API
    const result = await submitRequest(requestData.items, requestData.overallJustification);

    if (result) {
      // Clear cart on success
      // await clearCart();

      // Close cart and switch to requests tab
      setIsCartOpen(false);
      setActiveTab('requests');

      // Show success message with summary
      const { selfRequestCount, othersRequestCount, totalBeneficiaries } = requestData;
      let description = `Your access request with ${requestData.items.length} items has been submitted for approval.`;

      if (othersRequestCount > 0) {
        description = `Request submitted: ${selfRequestCount} for self, ${othersRequestCount} for ${totalBeneficiaries} other user${totalBeneficiaries !== 1 ? 's' : ''}.`;
      }

      toast.success('Request submitted successfully', { description });

      // Refresh cart to ensure it's empty
      await refreshCart();
    }
  };

  /**
   * Get count of pending requests
   */
  const getPendingRequestsCount = () => {
    return 0;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto p-4 sm:p-6 lg:p-8 py-8 space-y-6">

        {/* Header */}
        <PageHeader
          title="Access Portal"
          description="Discover, request, and track access across applications, roles, and entitlements"
          icon={<ShoppingCart className="h-5 w-5 text-primary" />}
          tooltip="The Access Portal allows users to browse the access catalog, request applications, roles, and entitlements, and track approval status through the access request workflow."
          actions={
            <div className="flex items-center space-x-3">
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {cartItems.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-primary-foreground text-primary"
                  >
                    {cartItems.length}
                  </Badge>
                )}
              </Button>
            </div>
          }
        />

        {/* Primary Tabs (like loveable page) */}
        <Tabs value={primaryTab} onValueChange={setPrimaryTab} className="space-y-6">

          <StandardTabs
            tabs={[
              { value: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
              { value: "portal", label: "Portal", icon: <ShoppingCart className="h-4 w-4" /> }
            ]}
          />

          {/* Analytics */}
          <TabsContent value="analytics">
            <AccessAnalytics />
          </TabsContent>

          {/* Portal */}
          <TabsContent value="portal">

            {/* Existing Tabs (unchanged logic) */}
            <Tabs value={activeTab} onValueChange={setActiveTab} >

              <div>
                <IconTabs
                  columns={2}
                  tabs={[
                    {
                      value: "request",
                      label: "Request Access",
                      icon: Send,
                    },
                    {
                      value: "requests",
                      label: (
                        <span className="flex items-center gap-1">
                          My Requests
                          {getPendingRequestsCount() > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {getPendingRequestsCount()}
                            </Badge>
                          )}
                        </span>
                      ) as any,
                      icon: Clock,
                    },
                  ]}
                />
              </div>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="request" className="h-full pt-6">
                  <RequestAccessTab
                    accessItems={accessItems}
                    onAddToCart={handleAddToCart}
                    cartItems={cartItems}
                  />
                </TabsContent>

                <TabsContent value="requests" className="h-full pt-6">
                  <MyRequests onWithdrawSuccess={handleWithdrawSuccess} />
                </TabsContent>
              </div>

            </Tabs>

          </TabsContent>

        </Tabs>

        {/* Cart Slideout */}
        <CartSlideout
          cartItems={cartItems}
          onRemoveFromCart={handleRemoveFromCart}
           onRefreshCart={refreshCart} 
          onClearCart={handleClearCart}
          onSubmitRequest={handleSubmitRequest}
          open={isCartOpen}
          onOpenChange={setIsCartOpen}
          submitting={submitting}
        />

        {/* Target User Selection Modal */}
        <TargetUserSelectionModal
          open={isTargetModalOpen}
          conflictingUserIds={conflictingUserIds}
          onOpenChange={setIsTargetModalOpen}
          accessItem={pendingItem}
          tileConfig={pendingTileConfig}
          onConfirm={handleTargetSelectionConfirm}
        />

      </div>
    </div>
  );
};

export default AccessPortalPage;