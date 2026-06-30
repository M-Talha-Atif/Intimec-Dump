import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { UserX, Trash2, UserPlus, Download } from 'lucide-react';
import { mockOrphanAccounts } from '@/services/mockRiskData';
import { useToast } from '@/hooks/use-toast';

interface OrphanAccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrphanAccountDetailModal: React.FC<OrphanAccountDetailModalProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'border-red-300 bg-red-50 text-red-700';
      case 'high': return 'border-orange-300 bg-orange-50 text-orange-700';
      case 'medium': return 'border-yellow-300 bg-yellow-50 text-yellow-700';
      case 'low': return 'border-green-300 bg-green-50 text-green-700';
      default: return 'border-gray-300 bg-gray-50 text-gray-700';
    }
  };

  const toggleAccount = (id: string) => {
    setSelectedAccounts(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action: string) => {
    toast({
      title: `${action} Initiated`,
      description: `Processing ${selectedAccounts.length} orphan accounts...`,
    });
    setSelectedAccounts([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserX className="h-5 w-5 text-destructive" />
              <span>Orphan Accounts</span>
              <Badge variant="outline">{mockOrphanAccounts.length} Total</Badge>
            </div>
            {selectedAccounts.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{selectedAccounts.length} selected</span>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('Reclaim')}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Bulk Reclaim
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction('Delete')}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Bulk Delete
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <div className="space-y-3 pr-4">
            {mockOrphanAccounts.map((account) => (
              <Card key={account.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedAccounts.includes(account.id)}
                      onCheckedChange={() => toggleAccount(account.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{account.accountName}</h4>
                          <p className="text-sm text-muted-foreground">{account.application}</p>
                        </div>
                        <Badge variant="outline" className={getRiskColor(account.riskLevel)}>
                          {account.riskLevel}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <div className="font-medium">{account.createdDate.toLocaleDateString()}</div>
                        </div>
                        {account.lastActivity && (
                          <div>
                            <span className="text-muted-foreground">Last Activity:</span>
                            <div className="font-medium">{account.lastActivity.toLocaleDateString()}</div>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Entitlements:</span>
                          <div className="font-medium">{account.assignedEntitlements.length}</div>
                        </div>
                      </div>

                      {account.assignedEntitlements.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs text-muted-foreground">Assigned Entitlements:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {account.assignedEntitlements.map((ent, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {ent}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {account.suggestedOwner && (
                        <div className="mt-3 p-2 bg-accent rounded text-sm">
                          <span className="text-muted-foreground">Suggested Owner:</span>
                          <span className="font-medium ml-2">{account.suggestedOwner}</span>
                        </div>
                      )}

                      <div className="flex space-x-2 mt-3">
                        <Button size="sm" variant="outline">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Assign Owner
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
