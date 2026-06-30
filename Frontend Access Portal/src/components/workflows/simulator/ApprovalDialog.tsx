"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ApprovalDialogProps {
  open: boolean;
  nodeName: string;
  nodeType: string;
  approvalData?: any;
  onApprove: (reason?: string) => void;
  onReject: (reason?: string) => void;
}

export function ApprovalDialog({
  open,
  nodeName,
  nodeType,
  approvalData,
  onApprove,
  onReject,
}: ApprovalDialogProps) {
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    await onApprove(reason || undefined);
    setIsProcessing(false);
    setReason('');
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    setIsProcessing(true);
    await onReject(reason);
    setIsProcessing(false);
    setReason('');
  };

  // Extract approver IDs - only approverIds contains the configured approvers
  const approverIds = approvalData?.approverIds || [];
  const approverCount = Array.isArray(approverIds) ? approverIds.length : 0;
  
  console.log('[ApprovalDialog] === APPROVAL DIALOG DEBUG ===');
  console.log('[ApprovalDialog] Full approvalData:', JSON.stringify(approvalData, null, 2));
  console.log('[ApprovalDialog] approverIds extracted:', approverIds);
  console.log('[ApprovalDialog] approverCount:', approverCount);
  console.log('[ApprovalDialog] Is array?', Array.isArray(approverIds));

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🔔</span>
            Approval Required
          </DialogTitle>
          <DialogDescription>
            The workflow simulation has reached an approval node and requires your decision to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">Node:</span>
              <span className="font-semibold">{nodeName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">Type:</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{nodeType}</span>
            </div>
            {approverCount > 0 && (
              <div className="flex flex-col gap-2 text-sm pt-2 border-t">
                <span className="font-medium text-muted-foreground">
                  Simulated Approvers ({approverCount}):
                </span>
                <div className="text-xs bg-blue-50 border border-blue-200 p-3 rounded max-h-32 overflow-y-auto space-y-1">
                  {approverIds.map((id: string, idx: number) => (
                    <div key={idx} className="font-mono text-blue-700 break-all">
                      • {id}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 italic">
                  You are approving on behalf of {approverCount === 1 ? 'this approver' : 'these approvers'} in simulation mode
                </p>
              </div>
            )}
            {approvalData?.reason && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">Reason:</span>
                <span>{approvalData.reason}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason {!isProcessing && <span className="text-red-500">*</span>} (Required for rejection)</Label>
            <Textarea
              id="reason"
              placeholder="Add a reason for your decision (required for rejection)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
              disabled={isProcessing}
            />
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> This is a simulation. Your decision will allow the workflow to continue executing, but no real approvals will be recorded in the database.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={isProcessing}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
