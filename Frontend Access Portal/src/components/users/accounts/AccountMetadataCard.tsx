
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Lock } from 'lucide-react';
import { AccountDetail } from '@/data/mock-account-details';
import { cn } from '@/lib/utils';

type AccountMetadataCardProps = {
  accountDetail: AccountDetail;
};

const AccountMetadataCard = ({ accountDetail }: AccountMetadataCardProps) => {
  const getStatusIcon = (status: string) => {
    return status === 'Active' ? CheckCircle2 : XCircle;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Disabled': return 'bg-red-100 text-red-800';
      case 'Suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'Managed': return 'bg-blue-100 text-blue-800';
      case 'Orphan': return 'bg-orange-100 text-orange-800';
      case 'System Account': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const StatusIcon = getStatusIcon(accountDetail.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Account Metadata</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-600">Account ID</label>
              <p className="text-sm font-mono">{accountDetail.accountId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Created At</label>
              <p className="text-sm">{accountDetail.createdAt}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Last Modified</label>
              <p className="text-sm">{accountDetail.lastModified}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Provisioned From</label>
              <p className="text-sm">{accountDetail.provisionedFrom}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-600">Connector Name</label>
              <p className="text-sm font-mono">{accountDetail.connectorName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Status</label>
              <Badge className={cn(getStatusColor(accountDetail.status), "flex items-center w-fit")}>
                <StatusIcon className="h-3 w-3 mr-1.5" />
                {accountDetail.status}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Account Type</label>
              <Badge variant="outline" className={getAccountTypeColor(accountDetail.accountType)}>
                {accountDetail.accountType}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Last Login</label>
              <p className="text-sm">{accountDetail.lastLogin || 'Never'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Owner Verified</label>
              <div className="flex items-center space-x-2">
                {accountDetail.ownerVerified ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">{accountDetail.ownerVerified ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountMetadataCard;
