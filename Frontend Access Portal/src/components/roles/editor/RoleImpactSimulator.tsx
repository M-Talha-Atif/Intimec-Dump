
import React, { useState, useCallback } from 'react';
import { Role } from '@/types/roles';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, AlertTriangle, TrendingUp, Shield, 
  Plus, Minus, ArrowRight, Eye, Download
} from 'lucide-react';

interface RoleImpactSimulatorProps {
  originalRole: Role;
  editedRole: Role;
  isOpen: boolean;
  onClose: () => void;
}

const RoleImpactSimulator: React.FC<RoleImpactSimulatorProps> = ({
  originalRole,
  editedRole,
  isOpen,
  onClose
}) => {
  const [simulationResults, setSimulationResults] = useState({
    affectedUsers: 24,
    addedEntitlements: editedRole.entitlements.length - originalRole.entitlements.length,
    removedEntitlements: Math.max(0, originalRole.entitlements.length - editedRole.entitlements.length),
    riskScoreChange: 5,
    complianceAlerts: 2,
    newViolations: 1
  });

  const handleRunFullSimulation = useCallback(() => {
    // Simulate a more detailed analysis
    console.log('Running full impact simulation...');
  }, []);

  const mockAffectedUsers = [
    { id: '1', name: 'John Smith', department: 'Finance', impact: 'New Access', risk: 'Medium' },
    { id: '2', name: 'Sarah Johnson', department: 'Finance', impact: 'Modified Access', risk: 'Low' },
    { id: '3', name: 'Mike Chen', department: 'Finance', impact: 'Removed Access', risk: 'High' },
    { id: '4', name: 'Emily Davis', department: 'Finance', impact: 'New Access', risk: 'Low' },
    { id: '5', name: 'Robert Wilson', department: 'Finance', impact: 'Modified Access', risk: 'Medium' }
  ];

  const mockEntitlementChanges = [
    {
      type: 'added',
      name: 'Advanced Financial Reports',
      application: 'SAP',
      risk: 'Medium',
      affectedUsers: 12
    },
    {
      type: 'modified',
      name: 'Budget Approval',
      application: 'Oracle',
      risk: 'High',
      affectedUsers: 8,
      change: 'Privilege level increased from Write to Admin'
    },
    {
      type: 'removed',
      name: 'Legacy System Access',
      application: 'Old ERP',
      risk: 'Low',
      affectedUsers: 3
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'New Access': return 'bg-blue-100 text-blue-800';
      case 'Modified Access': return 'bg-yellow-100 text-yellow-800';
      case 'Removed Access': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'added': return <Plus className="h-4 w-4 text-green-600" />;
      case 'removed': return <Minus className="h-4 w-4 text-red-600" />;
      case 'modified': return <ArrowRight className="h-4 w-4 text-blue-600" />;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Impact Simulation: {editedRole.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">
                  {simulationResults.affectedUsers}
                </div>
                <div className="text-sm text-blue-800">Affected Users</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Plus className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">
                  {simulationResults.addedEntitlements}
                </div>
                <div className="text-sm text-green-800">Added Entitlements</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Minus className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold text-red-600">
                  {simulationResults.removedEntitlements}
                </div>
                <div className="text-sm text-red-800">Removed Entitlements</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">
                  +{simulationResults.riskScoreChange}
                </div>
                <div className="text-sm text-purple-800">Risk Score Change</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">
                  {simulationResults.complianceAlerts}
                </div>
                <div className="text-sm text-orange-800">Compliance Alerts</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold text-red-600">
                  {simulationResults.newViolations}
                </div>
                <div className="text-sm text-red-800">New Violations</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">Affected Users</TabsTrigger>
              <TabsTrigger value="entitlements">Entitlement Changes</TabsTrigger>
              <TabsTrigger value="compliance">Compliance Impact</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Impact Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Impact Type</TableHead>
                        <TableHead>Risk Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockAffectedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.department}</TableCell>
                          <TableCell>
                            <Badge className={getImpactColor(user.impact)}>
                              {user.impact}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRiskColor(user.risk)}>
                              {user.risk}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="entitlements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Entitlement Changes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockEntitlementChanges.map((change, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                        {getChangeIcon(change.type)}
                        <div className="flex-1">
                          <div className="font-medium">{change.name}</div>
                          <div className="text-sm text-gray-600 flex items-center space-x-2">
                            <span>{change.application}</span>
                            <span>•</span>
                            <span>{change.affectedUsers} users affected</span>
                          </div>
                          {change.change && (
                            <div className="text-sm text-blue-600 mt-1">{change.change}</div>
                          )}
                        </div>
                        <Badge className={getRiskColor(change.risk)}>
                          {change.risk} Risk
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance & Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-900">SoD Violation Detected</p>
                          <p className="text-red-800 text-sm">
                            The updated role will have conflicting permissions for budget creation and approval, 
                            violating Segregation of Duties policy SOD-001.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-900">Privilege Escalation Alert</p>
                          <p className="text-yellow-800 text-sm">
                            12 users will receive elevated privileges. Additional approval may be required 
                            for high-risk entitlements.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-900">Risk Score Impact</p>
                          <p className="text-blue-800 text-sm">
                            Overall role risk score will increase from 65 to 70 due to additional 
                            high-privilege entitlements.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={handleRunFullSimulation}
                className="flex items-center space-x-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Run Full Simulation</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button>
                Proceed with Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleImpactSimulator;
