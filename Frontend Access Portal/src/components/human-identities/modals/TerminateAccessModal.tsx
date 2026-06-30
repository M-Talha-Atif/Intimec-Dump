
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Database, UserX } from 'lucide-react';

interface TerminateAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onConfirm: (reason: string, transferData: boolean) => void;
}

const TerminateAccessModal: React.FC<TerminateAccessModalProps> = ({
  isOpen,
  onClose,
  userName,
  onConfirm
}) => {
  const [reason, setReason] = useState('');
  const [transferData, setTransferData] = useState(false);
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const mockAccountsToDeactivate = [
    { app: 'Active Directory', account: 'jdoe', status: 'Active' },
    { app: 'Salesforce', account: 'john.doe', status: 'Active' },
    { app: 'GitHub', account: 'jdoe', status: 'Active' }
  ];

  const mockAccessToRevoke = [
    { type: 'Role', name: 'Engineer', risk: 'Medium' },
    { type: 'Entitlement', name: 'Admin Access - Production', risk: 'High' },
    { type: 'Entitlement', name: 'Read Access - All Repos', risk: 'Low' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !confirmationChecked) return;

    setIsLoading(true);
    try {
      await onConfirm(reason, transferData);
      onClose();
    } catch (error) {
      console.error('Access termination failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserX className="h-5 w-5 text-red-500" />
            <span>Terminate Access for {userName}</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This action will immediately revoke all access and cannot be undone. The user will be logged out of all systems.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label className="flex items-center space-x-2 mb-3">
                <Database className="h-4 w-4" />
                <span>Accounts to Deactivate</span>
              </Label>
              <div className="space-y-2">
                {mockAccountsToDeactivate.map((account, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <UserX className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium">{account.app}</div>
                        <div className="text-sm text-gray-500">{account.account}</div>
                      </div>
                    </div>
                    <Badge variant="destructive">Will Deactivate</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="flex items-center space-x-2 mb-3">
                <Shield className="h-4 w-4" />
                <span>Access to Revoke</span>
              </Label>
              <div className="space-y-2">
                {mockAccessToRevoke.map((access, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Shield className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">{access.name}</div>
                        <div className="text-sm text-gray-500">{access.type}</div>
                      </div>
                    </div>
                    <Badge variant={access.risk === 'High' ? 'destructive' : access.risk === 'Medium' ? 'secondary' : 'outline'}>
                      {access.risk} Risk
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="transferData"
                checked={transferData}
                onCheckedChange={(checked) => setTransferData(checked as boolean)}
              />
              <Label htmlFor="transferData" className="text-sm">
                Transfer user data and ownership to manager
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Termination Reason *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for access termination..."
                rows={3}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="confirmation"
                checked={confirmationChecked}
                onCheckedChange={(checked) => setConfirmationChecked(checked as boolean)}
              />
              <Label htmlFor="confirmation" className="text-sm">
                I understand this action is irreversible and will immediately terminate all access
              </Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={!reason || !confirmationChecked || isLoading}
            >
              {isLoading ? 'Terminating...' : 'Terminate Access'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TerminateAccessModal;
