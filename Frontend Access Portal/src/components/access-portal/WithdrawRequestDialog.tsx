import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WithdrawRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
  requestId: string;
}

const WithdrawRequestDialog: React.FC<WithdrawRequestDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  requestId,
}) => {
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    // Validate
    if (!withdrawalReason.trim()) {
      setError('Please provide a reason for withdrawal');
      return;
    }

    if (withdrawalReason.trim().length < 10) {
      setError('Please provide at least 10 characters explaining the reason');
      return;
    }

    setError('');
    onConfirm(withdrawalReason.trim());
  };

  const handleCancel = () => {
    setWithdrawalReason('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col px-6 py-4">
        <SheetHeader className="!p-0">
          <SheetTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Withdraw Access Request
          </SheetTitle>
          <SheetDescription>
            Request #{requestId.slice(-8)} will be withdrawn and items will be
            returned to your cart. Please provide a reason for this action.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This action cannot be undone. The request will be marked as withdrawn
              and you'll need to resubmit if you change your mind.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="withdrawal-reason">
              Reason for Withdrawal <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="withdrawal-reason"
              placeholder="e.g., Requirements have changed, no longer needed, submitted by mistake..."
              value={withdrawalReason}
              onChange={(e) => {
                setWithdrawalReason(e.target.value);
                setError('');
              }}
              className={error ? 'border-destructive' : ''}
              rows={4}
              disabled={loading}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {withdrawalReason.length}/500 characters
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading || !withdrawalReason.trim()}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Withdraw Request
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WithdrawRequestDialog;