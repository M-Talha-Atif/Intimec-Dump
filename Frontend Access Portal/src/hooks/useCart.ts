import { useState, useEffect, useCallback, useRef } from 'react';
import { AccessItem } from '@/data/mock-access-portal';
import { toast } from 'sonner';

export interface BackendCartItem {
  id: string;
  userId: string;
  tileId: string;
  itemType: string;
  itemId: string;
  itemName: string;
  itemDescription: string;
  requestType: 'SELF' | 'OTHERS';
  status: string;
  beneficiaryUserIds: string[];
  beneficiaryNames: string[];
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemWithTarget extends AccessItem {
  requestTarget: 'self' | 'others';
  beneficiaries: any[];
  cartId?: string;
}

function getErrorMessage(error: any): string {
  if (error?.error) return error.error;
  if (error?.message) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred. Please try again.';
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItemWithTarget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitiallyLoaded = useRef(false);

  useEffect(() => {
    console.log('[Cart updated]', cartItems);
  }, [cartItems]);

  /**
   * Fetch cart items from backend
   */
  const fetchCartItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/access-portal/cart');

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = getErrorMessage(errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      console.log('[useCart] Fetched cart:', data);

      // Map backend cart items to frontend format
      // Map backend cart items to frontend format
      const items: CartItemWithTarget[] = (data.data?.items || []).map((item: BackendCartItem) => {
        // Parse any beneficiary data that might be stored in the backend
        // This depends on how your backend stores beneficiaries
        let beneficiaries: any[] = [];

        // Create beneficiary objects from IDs and names
        const beneficiaryIds = item.beneficiaryUserIds || [];
        const beneficiaryNames = item.beneficiaryNames || [];

        beneficiaries = beneficiaryIds.map((id: string, index: number) => ({
          id,
          name: beneficiaryNames[index] || 'Unknown User',
          // Add other required fields with defaults
          department: 'Unknown',
          role: 'Employee',
          jobTitle: 'Employee',
          type: 'Employee'
        }));

        return {
          id: item.itemId,
          cartId: item.id,
          name: item.itemName,
          description: item.itemDescription,
          type: item.itemType === 'INTERNAL_ROLE' ? 'role'
            : item.itemType === 'ENTITLEMENT' ? 'entitlement'
              : item.itemType === 'APPLICATION' ? 'application'
                : 'role',
          tileId: item.tileId,
          requestTarget: item.requestType === 'SELF' ? 'self' : 'others',
          beneficiaries: beneficiaries, // Use the parsed beneficiaries

          // Required AccessItem fields with defaults
          owner: 'System',
          department: 'IT',
          riskLevel: 'medium' as const,
          tags: [],
          complianceFlags: [],
          approvalWorkflow: [],
          autoApprovalEligible: false,
          maxValidityDays: 90,
          icon: item.itemType === 'ENTITLEMENT' ? 'Key' : 'Shield',
          category: '',
          requestCount: 0,
          hierarchyLevel: 'role' as const,
        };
      });



      console.log('[useCart] Mapped items:', items);
      setCartItems(items);
      return items;
    } catch (err) {
      console.error('[useCart] Fetch error:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - stable reference


  /**
  * Add item to cart
  */
  const addToCart = useCallback(async (
    item: AccessItem,
    requestTarget: 'self' | 'others' = 'self',
    beneficiaries: any[] = []
  ) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        tileId: (item as any).tileId,
        itemType: item.type === 'role' ? 'INTERNAL_ROLE' : 'ENTITLEMENT',
        itemId: item.id,
        itemName: item.name,
        itemDescription: item.description,
        requestType: requestTarget === 'self' ? 'SELF' : 'OTHERS',
        beneficiaryUserIds: requestTarget === 'others' ? beneficiaries.map(b => b.id) : undefined,
        beneficiaryNames: requestTarget === 'others' ? beneficiaries.map(b => b.name) : undefined,
      };

      console.log('[useCart] Adding to cart:', payload);

      const response = await fetch('/api/access-portal/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log('[useCart] Response:', {
        ok: response.ok,
        status: response.status,
        data,
      });

      if (!response.ok) {
        // Check if it's a duplicate beneficiary error (status 409)
        if (response.status === 409) {
          console.log('[useCart] Conflict detected - checking for errors field');

          // Backend returns errors object with conflictingUsers and conflictingUserIds
          if (data.errors?.conflictingUsers && data.errors?.conflictingUserIds) {
            console.log('[useCart] Returning conflict details:', {
              conflictingUsers: data.errors.conflictingUsers,
              conflictingUserIds: data.errors.conflictingUserIds,
            });

            return {
              success: false,
              conflictingUsers: data.errors.conflictingUsers,
              conflictingUserIds: data.errors.conflictingUserIds,
              message: data.message || 'Some users already have access',
            };
          }
        }

        // For other errors, throw to catch block
        const errorMessage = data.message || getErrorMessage(data);
        throw new Error(errorMessage);
      }


      // Showing appropriate toast message based on whether it was merged into previous item or newly added
      const wasMerged = data.data?.merged === true; // Backend return this flag

      if (wasMerged) {
        toast.success('Beneficiaries added', {
          description: `${beneficiaries.length} user${beneficiaries.length !== 1 ? 's' : ''} added to existing ${item.name} request`,
        });
      } else {
        toast.success('Added to cart', {
          description: requestTarget === 'self'
            ? `${item.name} has been added to your cart.`
            : `${item.name} will be requested for ${beneficiaries.length} user${beneficiaries.length !== 1 ? 's' : ''}.`,
        });
      }

      console.log('[useCart] Successfully added to cart');

      // Refresh cart
      await fetchCartItems();

      return { success: true };

    } catch (err) {
      // console.error('[useCart] Add error:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      // toast.error('Could not add to cart', {
      //   description: errorMessage,
      // });

      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchCartItems]);

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback(async (cartId: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('[useCart] Removing from cart:', cartId);

      const response = await fetch(`/api/access-portal/cart/${cartId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = getErrorMessage(errorData);
        throw new Error(errorMessage);
      }

      console.log('[useCart] Removed from cart');

      // Update local state immediately
      setCartItems(prev => prev.filter(item => item.cartId !== cartId));

      return true;
    } catch (err) {
      console.error('[useCart] Remove error:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);

      toast.error('Could not remove item', {
        description: errorMessage,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async () => {
    setLoading(true);

    try {
      // Remove all items one by one
      const promises = cartItems.map(item =>
        item.cartId ? removeFromCart(item.cartId) : Promise.resolve(false)
      );

      await Promise.all(promises);
      setCartItems([]);

      return true;
    } catch (err) {
      console.error('[useCart] Clear error:', err);
      toast.error('Failed to clear cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [cartItems, removeFromCart]);

  // Load cart on mount (only once)
  useEffect(() => {
    if (!hasInitiallyLoaded.current) {
      hasInitiallyLoaded.current = true;
      fetchCartItems();
    }
  }, [fetchCartItems]);

  return {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    clearCart,
    refreshCart: fetchCartItems,
  };
};