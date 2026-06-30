
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Eye,
  Settings
} from 'lucide-react';

type NonEmployeeAccountsTabProps = {
  nonEmployee: any;
};

// Mock account data
const mockAccounts = [
  {
    id: 'acc_1',
    application: 'Salesforce',
    accountName: 'alex.thompson',
    status: 'Active',
    lastUsed: '2024-06-20',
    created: '2024-01-15',
    permissions: ['Standard User', 'Lead Convert'],
    icon: Database
  },
  {
    id: 'acc_2',
    application: 'Jira',
    accountName: 'athompson',
    status: 'Active',
    lastUsed: '2024-06-19',
    created: '2024-01-16',
    permissions: ['Project Member', 'Issue Create'],
    icon: Database
  },
  {
    id: 'acc_3',
    application: 'Confluence',
    accountName: 'alex.thompson',
    status: 'Inactive',
    lastUsed: '2024-05-15',
    created: '2024-01-20',
    permissions: ['Reader', 'Commenter'],
    icon: Database
  },
  {
    id: 'acc_4',
    application: 'GitHub',
    accountName: 'athompson-contractor',
    status: 'Active',
    lastUsed: '2024-06-21',
    created: '2024-02-01',
    permissions: ['Repository Read', 'Issue Create'],
    icon: Database
  }
];

export function NonEmployeeAccountsTab({ nonEmployee }: NonEmployeeAccountsTabProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return CheckCircle;
      case 'Inactive': return Clock;
      case 'Suspended': return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Account Summary</span>
            <Badge variant="outline">{mockAccounts.length} Total Accounts</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockAccounts.filter(acc => acc.status === 'Active').length}
              </div>
              <div className="text-sm text-slate-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {mockAccounts.filter(acc => acc.status === 'Inactive').length}
              </div>
              <div className="text-sm text-slate-600">Inactive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {mockAccounts.filter(acc => acc.status === 'Suspended').length}
              </div>
              <div className="text-sm text-slate-600">Suspended</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>Linked Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAccounts.map((account) => {
              const StatusIcon = getStatusIcon(account.status);
              
              return (
                <div key={account.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Database className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{account.application}</div>
                        <div className="text-sm text-slate-500">{account.accountName}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={getStatusColor(account.status)}>
                            {account.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Last used: {account.lastUsed}
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Permissions</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {account.permissions.map((permission, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-600">Created</p>
                        <p className="text-sm text-slate-500">{account.created}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
