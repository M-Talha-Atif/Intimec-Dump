
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Key, 
  Users, 
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';

type NonEmployeeAccessTabProps = {
  nonEmployee: any;
};

// Mock access data
const mockAccess = [
  {
    id: 'access_1',
    name: 'Salesforce Standard User',
    type: 'Role',
    application: 'Salesforce',
    granted: '2024-01-15',
    level: 'Standard',
    status: 'Active',
    riskLevel: 'Low'
  },
  {
    id: 'access_2',
    name: 'Project Lead Role',
    type: 'Role',
    application: 'Jira',
    granted: '2024-01-16',
    level: 'Elevated',
    status: 'Active',
    riskLevel: 'Medium'
  },
  {
    id: 'access_3',
    name: 'Engineering Repository Access',
    type: 'Permission',
    application: 'GitHub',
    granted: '2024-02-01',
    level: 'High',
    status: 'Active',
    riskLevel: 'High'
  },
  {
    id: 'access_4',
    name: 'Confluence Editor',
    type: 'Role',
    application: 'Confluence',
    granted: '2024-01-20',
    level: 'Standard',
    status: 'Inactive',
    riskLevel: 'Low'
  }
];

export function NonEmployeeAccessTab({ nonEmployee }: NonEmployeeAccessTabProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Standard': return 'bg-green-100 text-green-800';
      case 'Elevated': return 'bg-orange-100 text-orange-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return CheckCircle;
      case 'Inactive': return Clock;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Access Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Access Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{mockAccess.length}</div>
              <div className="text-sm text-slate-600">Total Access</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockAccess.filter(access => access.status === 'Active').length}
              </div>
              <div className="text-sm text-slate-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {mockAccess.filter(access => access.riskLevel === 'High').length}
              </div>
              <div className="text-sm text-slate-600">High Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {mockAccess.filter(access => access.level === 'Elevated' || access.level === 'High').length}
              </div>
              <div className="text-sm text-slate-600">Elevated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access List */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAccess.map((access) => {
              const StatusIcon = getStatusIcon(access.status);
              
              return (
                <div key={access.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        {access.type === 'Role' ? (
                          <Users className="h-5 w-5 text-purple-600" />
                        ) : (
                          <Key className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{access.name}</div>
                        <div className="text-sm text-slate-500">{access.application} • {access.type}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right space-y-1">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge variant="outline">{access.status}</Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getLevelColor(access.level)}>
                            {access.level}
                          </Badge>
                          <Badge className={getRiskColor(access.riskLevel)}>
                            {access.riskLevel} Risk
                          </Badge>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Granted</p>
                        <p className="text-sm text-slate-500">{access.granted}</p>
                      </div>
                      
                      {access.riskLevel === 'High' && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">Requires review</span>
                        </div>
                      )}
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
