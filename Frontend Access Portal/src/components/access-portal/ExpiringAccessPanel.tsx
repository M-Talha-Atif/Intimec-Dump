import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import { AccessRequest } from '@/data/mock-access-portal';

interface ExpiringAccessPanelProps {
  requests: AccessRequest[];
  onRenew: (requestId: string) => void;
  onBulkRenew: (requestIds: string[]) => void;
}

const ExpiringAccessPanel: React.FC<ExpiringAccessPanelProps> = ({
  requests,
  onRenew,
  onBulkRenew,
}) => {
  const getExpiringRequests = (days: number) => {
    return requests.filter(req => {
      if (req.status !== 'approved' && req.status !== 'provisioned') return false;
      if (!req.expirationDate) return false;
      
      const daysUntilExpiry = Math.ceil(
        (new Date(req.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry > 0 && daysUntilExpiry <= days;
    });
  };

  const expiring30 = getExpiringRequests(30);
  const expiring60 = getExpiringRequests(60);
  const expiring90 = getExpiringRequests(90);

  const getExpiryColor = (days: number) => {
    if (days <= 7) return 'text-red-500';
    if (days <= 30) return 'text-orange-500';
    return 'text-yellow-500';
  };

  const getDaysUntilExpiry = (expirationDate: string) => {
    return Math.ceil(
      (new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
  };

  if (expiring90.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 ">
          <AlertTriangle className="h-5 w-5 text-orange-700" />
          Expiring Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-background rounded-lg border">
            <div className="text-2xl font-bold text-red-500">{expiring30.length}</div>
            <div className="text-xs text-muted-foreground">Next 30 days</div>
          </div>
          <div className="text-center p-3 bg-background  rounded-lg border">
            <div className="text-2xl font-bold text-orange-500">{expiring60.length}</div>
            <div className="text-xs text-muted-foreground">31-60 days</div>
          </div>
          <div className="text-center p-3 bg-background  rounded-lg border">
            <div className="text-2xl font-bold text-yellow-500">{expiring90.length}</div>
            <div className="text-xs text-muted-foreground">61-90 days</div>
          </div>
        </div>

        {expiring30.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Urgent Renewals (Next 30 Days)</h4>
              {expiring30.length > 1 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onBulkRenew(expiring30.map(r => r.id))}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Renew All
                </Button>
              )}
            </div>
            {expiring30.slice(0, 5).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {request.items[0]?.accessItem.name || 'Access Request'}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className={`text-xs ${getExpiryColor(getDaysUntilExpiry(request.expirationDate!))}`}>
                      Expires in {getDaysUntilExpiry(request.expirationDate!)} days
                    </span>
                    {request.autoRenewEnabled && (
                      <Badge variant="secondary" className="text-xs">
                        Auto-renew
                      </Badge>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onRenew(request.id)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Renew
                </Button>
              </div>
            ))}
            {expiring30.length > 5 && (
              <p className="text-xs text-center text-muted-foreground">
                +{expiring30.length - 5} more expiring soon
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpiringAccessPanel;
