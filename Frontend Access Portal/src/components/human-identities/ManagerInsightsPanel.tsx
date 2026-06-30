import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Shield, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3
} from 'lucide-react';
import { ManagerDetailsPanel } from './ManagerDetailsPanel';

const managerInsights = [
  {
    id: 'mgr_1',
    name: 'Jane Smith',
    directReports: 8,
    totalReports: 15,
    reviewsCompleted: 12,
    reviewsPending: 3,
    accessCertified: 85,
    highRiskFlags: 2,
    accessDrift: true,
    unusualEntitlements: 1
  },
  {
    id: 'mgr_2',
    name: 'Bob Wilson',
    directReports: 12,
    totalReports: 20,
    reviewsCompleted: 18,
    reviewsPending: 2,
    accessCertified: 92,
    highRiskFlags: 0,
    accessDrift: false,
    unusualEntitlements: 0
  },
  {
    id: 'mgr_3',
    name: 'Carol Davis',
    directReports: 15,
    totalReports: 28,
    reviewsCompleted: 20,
    reviewsPending: 8,
    accessCertified: 71,
    highRiskFlags: 4,
    accessDrift: true,
    unusualEntitlements: 3
  }
];

export function ManagerInsightsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <span>Manager Intelligence & KPIs</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {managerInsights.map((manager) => (
            <div key={manager.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-lg">{manager.name}</div>
                <div className="flex items-center space-x-2">
                  {manager.accessDrift && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Access Drift
                    </Badge>
                  )}
                  {manager.highRiskFlags > 0 && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {manager.highRiskFlags} High Risk
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{manager.directReports}</div>
                  <div className="text-xs text-gray-600">Direct Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{manager.totalReports}</div>
                  <div className="text-xs text-gray-600">Total Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{manager.accessCertified}%</div>
                  <div className="text-xs text-gray-600">Access Certified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{manager.reviewsCompleted}/{manager.reviewsCompleted + manager.reviewsPending}</div>
                  <div className="text-xs text-gray-600">Reviews Done</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>{manager.reviewsPending} Pending</span>
                  </div>
                  {manager.unusualEntitlements > 0 && (
                    <div className="flex items-center space-x-1">
                      <Shield className="h-4 w-4 text-red-500" />
                      <span>{manager.unusualEntitlements} Unusual</span>
                    </div>
                  )}
                </div>
                <ManagerDetailsPanel manager={manager}>
                  <Button variant="outline" size="sm">
                    <Target className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </ManagerDetailsPanel>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
