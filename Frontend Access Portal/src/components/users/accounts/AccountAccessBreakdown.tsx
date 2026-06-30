
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Users, Key, AlertTriangle, Waypoints } from 'lucide-react';
import { AccountDetail } from '@/data/mock-account-details';
import { cn } from '@/lib/utils';

type AccountAccessBreakdownProps = {
  accountDetail: AccountDetail;
};

const AccountAccessBreakdown = ({ accountDetail }: AccountAccessBreakdownProps) => {
  const [hideLowRisk, setHideLowRisk] = useState(false);
  const [showOnlyRoles, setShowOnlyRoles] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Group': return Users;
      case 'Permission': return Key;
      case 'Role': return Shield;
      default: return Key;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAccessObjects = accountDetail.accessObjects.filter(obj => {
    if (hideLowRisk && obj.riskLevel === 'Low') return false;
    if (showOnlyRoles && obj.type !== 'Role') return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Assigned Access in Application</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="hide-low-risk"
                  checked={hideLowRisk}
                  onCheckedChange={setHideLowRisk}
                />
                <Label htmlFor="hide-low-risk" className="text-sm">Hide Low Risk</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-only-roles"
                  checked={showOnlyRoles}
                  onCheckedChange={setShowOnlyRoles}
                />
                <Label htmlFor="show-only-roles" className="text-sm">Show Only Roles</Label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Object Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Assignment Source</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccessObjects.map((obj, index) => {
                const TypeIcon = getTypeIcon(obj.type);
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <TypeIcon className="h-4 w-4 text-slate-500" />
                        <span className="font-medium">{obj.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{obj.name}</TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(obj.riskLevel)}>
                        {obj.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>{obj.assignmentSource}</TableCell>
                    <TableCell className="text-slate-600">{obj.description}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredAccessObjects.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No access objects match the current filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk & Status Indicators */}
      {accountDetail.risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span>Risk & Status Indicators</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accountDetail.risks.map((risk, index) => (
                <div key={index} className={cn(
                  "p-3 rounded-lg border",
                  risk.severity === 'High' ? 'bg-red-50 border-red-200' :
                  risk.severity === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className={cn(
                        risk.severity === 'High' ? 'text-red-700 border-red-300' :
                        risk.severity === 'Medium' ? 'text-yellow-700 border-yellow-300' :
                        'text-blue-700 border-blue-300'
                      )}>
                        {risk.type}
                      </Badge>
                      <p className="text-sm mt-1 text-slate-700">{risk.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Resolve Now
                      </Button>
                      <Button size="sm" variant="outline">
                        <Waypoints className="h-4 w-4 mr-1" />
                        Open in Access Explorer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountAccessBreakdown;
