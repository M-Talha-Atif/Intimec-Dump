import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Request item DTO matching backend expectations
 */
export interface SubmitRequestItemDTO {
  itemId: string;
  validityDays: number;
  cartItemId: string; 
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  justification: string;
}

/**
 * Submit request payload
 */
export interface SubmitAccessRequestDTO {
  overallJustification: string;
  items: SubmitRequestItemDTO[];
}

/**
 * Response from backend after submission
 */
export interface AccessRequestResponse {
  id: string;
  status: string;
  requestedAt: string;
  itemCount: number;
}

/**
 * Hook for access request operations
 */
export const useAccessRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Submit access request from cart items
   * Transforms cart data to match backend DTO format
   */
  const submitRequest = async (
    items: Array<{
      itemId: string;
      cartItemId: string; 
      validityDays: number;
      urgency: 'low' | 'medium' | 'high';
      justification: string;
    }>,
    overallJustification: string
  ): Promise<AccessRequestResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!items || items.length === 0) {
        throw new Error('No items in cart to submit');
      }

      if (!overallJustification || overallJustification.trim() === '') {
        throw new Error('Overall justification is required');
      }

      // Validate each item has required fields
      for (const item of items) {
        // if (!item.justification || item.justification.trim() === '') {
        //   throw new Error('All items must have justification');
        // }
        if (!item.validityDays || item.validityDays < 1) {
          throw new Error('All items must have valid validity days');
        }
      }

      // Transform payload to match backend DTO
      const payload: SubmitAccessRequestDTO = {
        overallJustification: overallJustification.trim(),
        items: items.map(item => ({
          itemId: item.itemId,
          validityDays: item.validityDays,
          cartItemId: item.cartItemId,
          urgency: item.urgency.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
          justification: item.justification?.trim() || '',
        })),
      };

      console.log('[useAccessRequest] Submitting request:', {
        itemCount: payload.items.length,
        hasJustification: !!payload.overallJustification,
      });

      const response = await fetch('/api/access-portal/requests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }

      const data = await response.json();
      
      console.log('[useAccessRequest] Request submitted successfully:', data);

      // Extract response data
      const requestData = data.data || data;

      // toast.success('Request submitted successfully', {
      //   description: `Your access request has been submitted for approval.`,
      // });

      return {
        id: requestData.id,
        status: requestData.status,
        requestedAt: requestData.requestedAt,
        itemCount: requestData.items?.length || items.length,
      };
    } catch (err) {
      console.error('[useAccessRequest] Submit error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit request';
      setError(errorMessage);
      
      toast.error('Failed to submit request', {
        description: errorMessage,
      });

      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitRequest,
    loading,
    error,
  };
};