import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Edit, Pause, Trash2, Shield, ShieldCheck, 
  AlertTriangle, Building, Users, Crown
} from 'lucide-react';
import { RoleOnboardingModal } from './onboarding/RoleOnboardingModal';
import { RoleModifyDrawer } from './drawers/RoleModifyDrawer';
import { RoleDisableDrawer } from './drawers/RoleDisableDrawer';
import { RoleDeleteDrawer } from './drawers/RoleDeleteDrawer';
import { pendingRoleModifications, scheduledRoleDisables, roleDeletionCandidates } from '@/data/mock-lifecycle';

const RolesLifecycle: React.FC = () => {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [selectedRoleType, setSelectedRoleType] = useState<'business' | 'technical' | 'privileged' | null>(null);
  const [isModifyDrawerOpen, setIsModifyDrawerOpen] = useState(false);
  const [isDisableDrawerOpen, setIsDisableDrawerOpen] = useState(false);
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);

  const handleCreateRole = (roleType: 'business' | 'technical' | 'privileged') => {
    setSelectedRoleType(roleType);
    setIsOnboardingOpen(true);
  };

  const handleCloseOnboarding = () => {
    setIsOnboardingOpen(false);
    setSelectedRoleType(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Role Lifecycle Management</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Control the definition, evolution, and deprecation of business and technical roles
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
                      <Building className="h-5 w-5 text-blue-600" />
                      <span>Business Role</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Create role based on job function or department</p>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">Job-based</Badge>
                      <Badge variant="outline" className="text-xs">Department scoped</Badge>
                      <Badge variant="outline" className="text-xs">Business owner</Badge>
                    </div>
                    <Button className="w-full" onClick={() => handleCreateRole('business')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Business Role
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <ShieldCheck className="h-5 w-5 text-green-600" />
                      <span>Technical Role</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Create application or system-specific role</p>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">Application scoped</Badge>
                      <Badge variant="outline" className="text-xs">Permission based</Badge>
                      <Badge variant="outline" className="text-xs">IT owner</Badge>
                    </div>
                    <Button className="w-full" variant="outline" onClick={() => handleCreateRole('technical')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Technical Role
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Crown className="h-5 w-5 text-purple-600" />
                      <span>Privileged Role</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Create high-privilege administrative role</p>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">High privilege</Badge>
                      <Badge variant="outline" className="text-xs">Approval required</Badge>
                      <Badge variant="outline" className="text-xs">SOX compliance</Badge>
                    </div>
                    <Button className="w-full" variant="outline" onClick={() => handleCreateRole('privileged')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Privileged Role
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="modify" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Pending Role Changes</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{pendingRoleModifications.length} pending</Badge>
                    <Button size="sm" onClick={() => setIsModifyDrawerOpen(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Manage Changes
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {pendingRoleModifications.slice(0, 5).map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => setIsModifyDrawerOpen(true)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Shield className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{item.roleName}</div>
                              <div className="text-sm text-muted-foreground">{item.roleType} • {item.modificationType}</div>
                              <div className="text-xs text-muted-foreground">{item.usersAffected} users affected</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{item.status}</Badge>
                            {item.sodConflicts > 0 && <Badge variant="destructive" className="text-xs">{item.sodConflicts} SoD</Badge>}
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
                  <h3 className="text-lg font-semibold">Role Disabling</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{scheduledRoleDisables.length} scheduled</Badge>
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
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-400">Impact Assessment Required</h4>
                    </div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                      Disabling roles will affect all assigned users. Review impact before proceeding.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {scheduledRoleDisables.map((dis) => (
                      <Card key={dis.id} className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => setIsDisableDrawerOpen(true)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{dis.roleName}</div>
                              <div className="text-sm text-muted-foreground">{dis.usersAffected} users • Scheduled {dis.scheduledDate}</div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge variant="secondary">{dis.status}</Badge>
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
                    <h3 className="font-medium text-red-900 dark:text-red-400">Role Deletion</h3>
                  </div>
                  <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                    Role deletion requires zero active assignments and approval workflow
                  </p>
                </div>

                <div className="space-y-3">
                  {roleDeletionCandidates.map((role) => (
                    <Card key={role.id} className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => setIsDeleteDrawerOpen(true)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{role.roleName}</div>
                            <div className="text-sm text-muted-foreground">{role.activeUsers} active users • Last used {role.lastUsed}</div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {role.canDelete ? (
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

      <RoleOnboardingModal isOpen={isOnboardingOpen} onClose={handleCloseOnboarding} roleType={selectedRoleType} />
      <RoleModifyDrawer isOpen={isModifyDrawerOpen} onClose={() => setIsModifyDrawerOpen(false)} />
      <RoleDisableDrawer isOpen={isDisableDrawerOpen} onClose={() => setIsDisableDrawerOpen(false)} />
      <RoleDeleteDrawer isOpen={isDeleteDrawerOpen} onClose={() => setIsDeleteDrawerOpen(false)} />
    </div>
  );
};

export default RolesLifecycle;
