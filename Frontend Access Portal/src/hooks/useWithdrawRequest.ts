import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook for withdrawing access requests
 */
export const useWithdrawRequest = () => {
  const [withdrawing, setWithdrawing] = useState(false);

  /**
   * Withdraw an access request
   */
  const withdrawRequest = async (
    requestId: string,
    withdrawalReason: string
  ): Promise<boolean> => {
    setWithdrawing(true);

    try {
      if (!withdrawalReason || withdrawalReason.trim() === '') {
        throw new Error('Withdrawal reason is required');
      }

      console.log('[useWithdrawRequest] Withdrawing request:', {
        requestId,
        reasonLength: withdrawalReason.length,
      });

      const response = await fetch(
        `/api/access-portal/requests/${requestId}/withdraw`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            withdrawalReason: withdrawalReason.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to withdraw request');
      }

      const data = await response.json();

      console.log('[useWithdrawRequest] Request withdrawn successfully');

      toast.success('Request withdrawn', {
        description: 'Your access request has been withdrawn and items returned to cart.',
      });

      return true;
    } catch (err) {
      console.error('[useWithdrawRequest] Error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to withdraw request';

      toast.error('Failed to withdraw request', {
        description: errorMessage,
      });

      return false;
    } finally {
      setWithdrawing(false);
    }
  };

  return {
    withdrawRequest,
    withdrawing,
  };
};