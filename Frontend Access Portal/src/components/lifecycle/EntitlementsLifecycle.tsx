import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Edit, Pause, Trash2, KeyRound, Key, 
  AlertTriangle, Shield, Lock, Database
} from 'lucide-react';
import { EntitlementOnboardingModal } from './onboarding/EntitlementOnboardingModal';
import { EntitlementModifyDrawer } from './drawers/EntitlementModifyDrawer';
import { EntitlementDisableDrawer } from './drawers/EntitlementDisableDrawer';
import { EntitlementDeleteDrawer } from './drawers/EntitlementDeleteDrawer';
import { pendingEntitlementModifications, scheduledEntitlementDisables, entitlementDeletionCandidates } from '@/data/mock-lifecycle';

const EntitlementsLifecycle: React.FC = () => {
  const [onboardingModal, setOnboardingModal] = useState<{
    isOpen: boolean;
    type: 'standard' | 'sensitive' | 'admin' | null;
  }>({ isOpen: false, type: null });
  const [isModifyDrawerOpen, setIsModifyDrawerOpen] = useState(false);
  const [isDisableDrawerOpen, setIsDisableDrawerOpen] = useState(false);
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);

  const handleOpenOnboarding = (type: 'standard' | 'sensitive' | 'admin') => {
    setOnboardingModal({ isOpen: true, type });
  };

  const handleCloseOnboarding = () => {
    setOnboardingModal({ isOpen: false, type: null });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <KeyRound className="h-5 w-5" />
            <span>Entitlement Lifecycle Management</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Govern permission assignment lifecycles, including provisioning rules and classification changes
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="create" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create</span>
              </TabsTrigger>
              <TabsTrigger value="modify" className="flex items-center space-x-2">
                <Edit className="h-4 w-4" />
                <span>Modify</span>
              </TabsTrigger>
              <TabsTrigger value="disable" className="flex items-center space-x-2">
                <Pause className="h-4 w-4" />
                <span>Disable</span>
              </TabsTrigger>
              <TabsTrigger value="delete" className="flex items-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Key className="h-5 w-5 text-green-600" />
                      <span>Standard Permission</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Create basic application permission or access right</p>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">Application scoped</Badge>
                      <Badge variant="outline" className="text-xs">Standard risk</Badge>
                      <Badge variant="outline" className="text-xs">Auto-approval</Badge>
                    </div>
                    <Button className="w-full" onClick={() => handleOpenOnboarding('standard')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Permission
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-orange-600" />
                      <span>Sensitive Access</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Create high-risk or sensitive data access entitlement</p>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">High risk</Badge>
                      <Badge variant="outline" className="text-xs">Approval required</Badge>
                      <Badge variant="outline" className="text-xs">Time-bound</Badge>
                    </div>
                    <Button className="w-full" variant="outline" onClick={() => handleOpenOnboarding('sensitive')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Sensitive Access
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Lock className="h-5 w-5 text-red-600" />
                      <span>Administrative Rights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Create privileged administrative or system access</p>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">Critical risk</Badge>
                      <Badge variant="outline" className="text-xs">Executive approval</Badge>
                      <Badge variant="outline" className="text-xs">SOX controlled</Badge>
                    </div>
                    <Button className="w-full" variant="outline" onClick={() => handleOpenOnboarding('admin')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Admin Rights
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="modify" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Pending Entitlement Changes</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{pendingEntitlementModifications.length} pending</Badge>
                    <Button size="sm" onClick={() => setIsModifyDrawerOpen(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Manage Changes
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {pendingEntitlementModifications.slice(0, 5).map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => setIsModifyDrawerOpen(true)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <KeyRound className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{item.entitlementName}</div>
                              <div className="text-sm text-muted-foreground">{item.application} • {item.modificationType}</div>
                              <div className="text-xs text-muted-foreground">Risk Impact: {item.riskImpact.slice(0, 50)}...</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{item.status}</Badge>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="disable" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Entitlement Disabling</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{scheduledEntitlementDisables.length} scheduled</Badge>
                    <Button size="sm" onClick={() => setIsDisableDrawerOpen(true)}>
                      <Pause className="h-4 w-4 mr-2" />
                      Manage Disables
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-400">Access Impact Analysis</h4>
                    </div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                      Disabling entitlements will revoke access for all assigned users and roles.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {scheduledEntitlementDisables.map((dis) => (
                      <Card key={dis.id} className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => setIsDisableDrawerOpen(true)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{dis.entitlementName}</div>
                              <div className="text-sm text-muted-foreground">{dis.application}</div>
                              <div className="text-xs text-muted-foreground">
                                {dis.usersAffected} users, {dis.rolesAffected} roles • Scheduled {dis.scheduledDate}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge variant={dis.riskLevel === 'Low' ? 'default' : 'secondary'}>{dis.riskLevel} Risk</Badge>
                              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setIsDisableDrawerOpen(true); }}>
                                <Pause className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="delete" className="mt-6">
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h3 className="font-medium text-red-900 dark:text-red-400">Entitlement Deletion</h3>
                  </div>
                  <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                    Permanent deletion requires zero active assignments and compliance approval
                  </p>
                </div>

                <div className="space-y-3">
                  {entitlementDeletionCandidates.map((ent) => (
                    <Card key={ent.id} className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => setIsDeleteDrawerOpen(true)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{ent.entitlementName}</div>
                            <div className="text-sm text-muted-foreground">{ent.application}</div>
                            <div className="text-xs text-muted-foreground">
                              {ent.activeAssignments} active assignments • Compliance: {ent.complianceStatus}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {ent.canDelete ? (
                              <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); setIsDeleteDrawerOpen(true); }}>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" disabled>
                                Cannot Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <EntitlementOnboardingModal isOpen={onboardingModal.isOpen} onClose={handleCloseOnboarding} entitlementType={onboardingModal.type} />
      <EntitlementModifyDrawer isOpen={isModifyDrawerOpen} onClose={() => setIsModifyDrawerOpen(false)} />
      <EntitlementDisableDrawer isOpen={isDisableDrawerOpen} onClose={() => setIsDisableDrawerOpen(false)} />
      <EntitlementDeleteDrawer isOpen={isDeleteDrawerOpen} onClose={() => setIsDeleteDrawerOpen(false)} />
    </div>
  );
};

export default EntitlementsLifecycle;
