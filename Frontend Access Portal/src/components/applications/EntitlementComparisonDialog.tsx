
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Entitlement } from '@/data/mock-entitlements';
import { EntitlementDetailContent } from './EntitlementDetailContent';

type EntitlementComparisonDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  entitlements: Entitlement[];
};

const getGridColsClass = (count: number) => {
  if (count === 2) return "lg:grid-cols-2";
  if (count >= 3) return "lg:grid-cols-3";
  return "lg:grid-cols-1";
};

export const EntitlementComparisonDialog = ({ isOpen, onOpenChange, entitlements }: EntitlementComparisonDialogProps) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Compare Entitlements ({entitlements.length})</DialogTitle>
          <DialogDescription>
            Side-by-side comparison of selected entitlements.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <div className={`grid grid-cols-1 ${getGridColsClass(entitlements.length)} gap-4 p-1`}>
            {entitlements.map(entitlement => (
              <div key={entitlement.id} className="border rounded-lg bg-background flex flex-col">
                  <div className="bg-muted p-3 font-semibold text-sm border-b">{entitlement.displayName}</div>
                  <div className="overflow-y-auto">
                    <EntitlementDetailContent entitlement={entitlement} />
                  </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
