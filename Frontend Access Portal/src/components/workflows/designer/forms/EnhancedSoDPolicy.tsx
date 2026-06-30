"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, AlertTriangle, Shield } from 'lucide-react';

interface EnhancedSoDPolicyProps {
  policy: any;
  onChange: (policy: any) => void;
}

export const EnhancedSoDPolicy: React.FC<EnhancedSoDPolicyProps> = ({
  policy,
  onChange
}) => {
  const sodPolicy = policy || { enabled: false, conflictingRoles: [''], preCheckMode: 'block' };
  const [conflictingRoles, setConflictingRoles] = useState<string[]>(
    sodPolicy.conflictingRoles || ['']
  );

  const updatePolicy = (updates: any) => {
    onChange({
      ...sodPolicy,
      ...updates
    });
  };

  const addConflictingRole = () => {
    const newRoles = [...conflictingRoles, ''];
    setConflictingRoles(newRoles);
    updatePolicy({ conflictingRoles: newRoles });
  };

  const removeConflictingRole = (index: number) => {
    const newRoles = conflictingRoles.filter((_, i) => i !== index);
    setConflictingRoles(newRoles);
    updatePolicy({ conflictingRoles: newRoles });
  };

  const updateConflictingRole = (index: number, value: string) => {
    const newRoles = [...conflictingRoles];
    newRoles[index] = value;
    setConflictingRoles(newRoles);
    updatePolicy({ conflictingRoles: newRoles });
  };

  const commonSoDConflicts = [
    'Financial Controller + Accounts Payable',
    'HR Manager + Payroll Administrator',
    'IT Administrator + Security Auditor',
    'Purchase Requester + Purchase Approver',
    'Cash Handler + Cash Reconciler',
    'Developer + Production Deployer'
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Enable SoD Evaluation</Label>
          <p className="text-xs text-muted-foreground">Check for segregation of duties conflicts</p>
        </div>
        <Switch
          checked={sodPolicy.enabled || false}
          onCheckedChange={(checked) => updatePolicy({ enabled: checked })}
        />
      </div>

      {sodPolicy.enabled && (
        <Tabs defaultValue="conflicts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
            <TabsTrigger value="proactive">Proactive</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="conflicts" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Conflicting Roles
                  </span>
                  <Button variant="outline" size="sm" onClick={addConflictingRole}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {conflictingRoles.map((role, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={role}
                      onChange={(e) => updateConflictingRole(index, e.target.value)}
                      placeholder="Enter conflicting role or responsibility"
                      className="text-sm"
                    />
                    {conflictingRoles.length > 1 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeConflictingRole(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}

                <div className="pt-2 border-t">
                  <Label className="text-xs font-medium text-muted-foreground">Common SoD Conflicts:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {commonSoDConflicts.map((conflict, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs cursor-pointer hover:bg-muted"
                        onClick={() => {
                          if (!conflictingRoles.includes(conflict)) {
                            const newRoles = conflictingRoles.filter(r => r.trim());
                            newRoles.push(conflict);
                            setConflictingRoles(newRoles);
                            updatePolicy({ conflictingRoles: newRoles });
                          }
                        }}
                      >
                        {conflict}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proactive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pre-Check Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Action on Conflict</Label>
                  <Select 
                    value={sodPolicy.preCheckMode || 'block'} 
                    onValueChange={(value) => updatePolicy({ preCheckMode: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="block">Block Request</SelectItem>
                      <SelectItem value="warn">Warn and Allow</SelectItem>
                      <SelectItem value="escalate">Escalate for Approval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Compensating Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Define compensating controls for approved SoD conflicts, such as enhanced monitoring, dual authorization, or periodic reviews.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
