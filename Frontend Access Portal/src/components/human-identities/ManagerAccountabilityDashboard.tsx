
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TreePine,
  Target,
  Award,
  Building
} from 'lucide-react';

const managerInsights = [
  { manager: 'Jane Smith', reports: 8, riskScore: 65, pendingReviews: 3, orphanAccounts: 1 },
  { manager: 'Bob Wilson', reports: 12, riskScore: 42, pendingReviews: 1, orphanAccounts: 0 },
  { manager: 'Carol Davis', reports: 15, riskScore: 78, pendingReviews: 5, orphanAccounts: 2 }
];

export function ManagerAccountabilityDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TreePine className="h-5 w-5 text-green-600" />
          <span>Manager Accountability Dashboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manager Performance */}
          <div>
            <h4 className="font-semibold mb-3">Top Risk Managers</h4>
            <div className="space-y-3">
              {managerInsights.map((manager, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{manager.manager}</div>
                    <Badge 
                      className={`${
                        manager.riskScore > 70 ? 'bg-red-100 text-red-800' :
                        manager.riskScore > 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      Risk: {manager.riskScore}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>{manager.reports} Reports</div>
                    <div>{manager.pendingReviews} Pending Reviews</div>
                    <div>{manager.orphanAccounts} Orphan Accounts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick Manager Actions */}
          <div>
            <h4 className="font-semibold mb-3">Quick Manager Actions</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-16 flex flex-col space-y-1">
                <Users className="h-5 w-5" />
                <span className="text-xs">Review Team Access</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col space-y-1">
                <Target className="h-5 w-5" />
                <span className="text-xs">Bulk Approve</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col space-y-1">
                <Award className="h-5 w-5" />
                <span className="text-xs">Delegate Authority</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col space-y-1">
                <Building className="h-5 w-5" />
                <span className="text-xs">Org Chart View</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
