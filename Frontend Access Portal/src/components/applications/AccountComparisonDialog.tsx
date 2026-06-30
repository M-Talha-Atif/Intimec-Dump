
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import ApplicationAccountDetail from './ApplicationAccountDetail';
import type { User, Account } from '@/data/mock-users';

// Copied from ApplicationAccountsTab.tsx as it is not exported
type AccountWithUser = {
  id: string;
  appName: string;
  accountName: string;
  status: "Active" | "Disabled";
  lastSync: string;
  details?: Account['details'];
  user: User;
}

type AccountComparisonDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  accounts: AccountWithUser[];
};

const getGridColsClass = (count: number) => {
  if (count === 2) return "lg:grid-cols-2";
  if (count >= 3) return "lg:grid-cols-3";
  return "lg:grid-cols-1";
};

export const AccountComparisonDialog = ({ isOpen, onOpenChange, accounts }: AccountComparisonDialogProps) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Compare Accounts ({accounts.length})</DialogTitle>
          <DialogDescription>
            Side-by-side comparison of selected accounts.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
            <div className={`grid grid-cols-1 ${getGridColsClass(accounts.length)} gap-4 p-1`}>
            {accounts.map(account => (
                <div key={account.id} className="border rounded-lg bg-background flex flex-col">
                    <div className="bg-muted p-3 font-semibold text-sm border-b">{account.accountName}</div>
                    <div className="overflow-y-auto">
                        <ApplicationAccountDetail item={account} />
                    </div>
                </div>
            ))}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
