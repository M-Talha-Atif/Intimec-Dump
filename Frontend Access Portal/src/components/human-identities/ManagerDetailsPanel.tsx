
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Calendar,
  Target,
  History,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface ManagerDetailsData {
  id: string;
  name: string;
  directReports: number;
  totalReports: number;
  reviewsCompleted: number;
  reviewsPending: number;
  accessCertified: number;
  highRiskFlags: number;
  accessDrift: boolean;
  unusualEntitlements: number;
}

interface ManagerDetailsPanelProps {
  manager: ManagerDetailsData;
  children: React.ReactNode;
}

const mockRiskDetails = [
  {
    type: 'High Risk Access',
    description: 'Privileged access to financial systems without recent certification',
    severity: 'High',
    affectedUsers: 3
  },
  {
    type: 'SoD Violation',
    description: 'Users with conflicting procurement and payment permissions',
    severity: 'Medium',
    affectedUsers: 1
  }
];

const mockAccessDrift = [
  {
    role: 'Senior Developer',
    baseline: 15,
    current: 23,
    drift: '+8 entitlements'
  },
  {
    role: 'Team Lead',
    baseline: 18,
    current: 16,
    drift: '-2 entitlements'
  }
];

const mockReviewStatus = [
  {
    employee: 'Sarah Johnson',
    status: 'completed',
    completedDate: '2025-01-10',
    risk: 'Low'
  },
  {
    employee: 'Mike Chen',
    status: 'pending',
    dueDate: '2025-01-15',
    risk: 'Medium'
  },
  {
    employee: 'Emily Davis',
    status: 'overdue',
    dueDate: '2025-01-05',
    risk: 'High'
  }
];

export function ManagerDetailsPanel({ manager, children }: ManagerDetailsPanelProps) {
  const handleReassignReview = (employee: string) => {
    console.log(`Reassigning review for ${employee}`);
  };

  const handleEscalate = (issue: string) => {
    console.log(`Escalating issue: ${issue}`);
  };

  const handleDelegate = () => {
    console.log(`Opening delegation panel for ${manager.name}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Manager Details: {manager.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Users className="h-4 w-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="risk">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Risk Profile
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Target className="h-4 w-4 mr-1" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="actions">
              <Shield className="h-4 w-4 mr-1" />
              Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{manager.directReports}</div>
                  <div className="text-sm text-gray-600">Direct Reports</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-600">{manager.totalReports}</div>
                  <div className="text-sm text-gray-600">Total Reports</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{manager.accessCertified}%</div>
                  <div className="text-sm text-gray-600">Access Certified</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{manager.reviewsCompleted}/{manager.reviewsCompleted + manager.reviewsPending}</div>
                  <div className="text-sm text-gray-600">Reviews Done</div>
                </CardContent>
              </Card>
            </div>

            {manager.accessDrift && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    <span>Access Drift Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAccessDrift.map((drift, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{drift.role}</div>
                          <div className="text-sm text-gray-600">Baseline: {drift.baseline} entitlements</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{drift.current} current</div>
                          <Badge variant={drift.drift.startsWith('+') ? 'destructive' : 'default'}>
                            {drift.drift}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRiskDetails.map((risk, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{risk.type}</div>
                        <Badge className={
                          risk.severity === 'High' ? 'bg-red-100 text-red-800' :
                          risk.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Affects {risk.affectedUsers} user(s)</span>
                        <Button size="sm" variant="outline" onClick={() => handleEscalate(risk.type)}>
                          Escalate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Access Review Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockReviewStatus.map((review, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{review.employee}</div>
                          <div className="text-sm text-gray-600">
                            {review.status === 'completed' ? `Completed: ${review.completedDate}` :
                             review.status === 'pending' ? `Due: ${review.dueDate}` :
                             `Overdue: ${review.dueDate}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={
                          review.risk === 'High' ? 'bg-red-100 text-red-800' :
                          review.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {review.risk} Risk
                        </Badge>
                        {review.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : review.status === 'pending' ? (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        {review.status !== 'completed' && (
                          <Button size="sm" variant="outline" onClick={() => handleReassignReview(review.employee)}>
                            Reassign
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={handleDelegate}>
                    <Shield className="h-4 w-4 mr-2" />
                    Delegate Authority
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Bulk Review Approval
                  </Button>
                  <Button className="w-full" variant="outline">
                    <History className="h-4 w-4 mr-2" />
                    View Audit Trail
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Team Heatmap</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="p-2 bg-green-100 rounded">
                      <div className="font-bold text-green-800">8</div>
                      <div className="text-green-600">Low Risk</div>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded">
                      <div className="font-bold text-yellow-800">3</div>
                      <div className="text-yellow-600">Medium Risk</div>
                    </div>
                    <div className="p-2 bg-red-100 rounded">
                      <div className="font-bold text-red-800">{manager.highRiskFlags}</div>
                      <div className="text-red-600">High Risk</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
