import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldAlert, Scissors, Eye, TrendingDown } from 'lucide-react';
import { mockExcessiveAccess } from '@/services/mockRiskData';
import { useToast } from '@/hooks/use-toast';

interface ExcessiveAccessDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcessiveAccessDetailModal: React.FC<ExcessiveAccessDetailModalProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkRevoke = () => {
    toast({
      title: "Access Revocation Initiated",
      description: `Processing ${selectedItems.length} access revocation requests...`,
    });
    setSelectedItems([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <span>Excessive Access Instances</span>
              <Badge variant="outline">{mockExcessiveAccess.length} Total</Badge>
            </div>
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{selectedItems.length} selected</span>
                <Button size="sm" variant="destructive" onClick={handleBulkRevoke}>
                  <Scissors className="h-4 w-4 mr-2" />
                  Bulk Revoke
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <div className="space-y-3 pr-4">
            {mockExcessiveAccess.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{item.userName}</h4>
                          <p className="text-sm text-muted-foreground">{item.application}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">
                            Risk Score: {item.riskScore}
                          </Badge>
                          <Badge variant="secondary">
                            {item.excessivePermissions.length} Excessive
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Required Permissions</div>
                          <div className="flex flex-wrap gap-1">
                            {item.requiredPermissions.slice(0, 2).map((perm, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs border-green-300 bg-green-50 text-green-700">
                                {perm}
                              </Badge>
                            ))}
                            {item.requiredPermissions.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.requiredPermissions.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Excessive Permissions</div>
                          <div className="flex flex-wrap gap-1">
                            {item.excessivePermissions.slice(0, 2).map((perm, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs border-red-300 bg-red-50 text-red-700">
                                {perm}
                              </Badge>
                            ))}
                            {item.excessivePermissions.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.excessivePermissions.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-accent rounded-lg text-sm mb-3">
                        <div className="flex items-start space-x-2">
                          <TrendingDown className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="font-medium">Suggested Action</div>
                            <div className="text-muted-foreground">{item.suggestedAction}</div>
                          </div>
                        </div>
                      </div>

                      {item.lastUsed && (
                        <div className="text-xs text-muted-foreground mb-3">
                          Last used excessive permission: {item.lastUsed.toLocaleDateString()}
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View All Permissions
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Scissors className="h-4 w-4 mr-2" />
                          Revoke Excessive Access
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
