import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Edit, Pause, Trash2, Users, UserPlus, 
  UserMinus, AlertTriangle, CheckCircle, Calendar, Bot
} from 'lucide-react';
import { IdentityOnboardingModal } from './onboarding/IdentityOnboardingModal';
import { IdentityModifyDrawer } from './drawers/IdentityModifyDrawer';
import { IdentityDisableDrawer } from './drawers/IdentityDisableDrawer';
import { IdentityDeleteDrawer } from './drawers/IdentityDeleteDrawer';
import { pendingIdentityModifications, scheduledIdentityDisables } from '@/data/mock-lifecycle';

const IdentitiesLifecycle: React.FC = () => {
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [selectedIdentityType, setSelectedIdentityType] = useState<'employee' | 'non-employee' | 'non-human' | null>(null);
  const [isModifyDrawerOpen, setIsModifyDrawerOpen] = useState(false);
  const [isDisableDrawerOpen, setIsDisableDrawerOpen] = useState(false);
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);

  const handleCreateIdentity = (type: 'employee' | 'non-employee' | 'non-human') => {
    setSelectedIdentityType(type);
    setIsOnboardingModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsOnboardingModalOpen(false);
    setSelectedIdentityType(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Identity Lifecycle Management</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage employee, non-employee, and non-human identities through controlled lifecycle flows
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
                      <UserPlus className="h-5 w-5 text-green-600" />
                      <span>New Employee</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Create new employee identity with automated provisioning</p>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">Auto-provisioning</Badge>
                      <Badge variant="outline" className="text-xs">Role assignment</Badge>
                      <Badge variant="outline" className="text-xs">Workflow triggered</Badge>
                    </div>
                    <Button className="w-full" onClick={() => handleCreateIdentity('employee')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Employee
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span>Non-Employee</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Create contractor, vendor, or temporary identity</p>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">Sponsor required</Badge>
                      <Badge variant="outline" className="text-xs">Time-bound</Badge>
                      <Badge variant="outline" className="text-xs">Limited access</Badge>
                    </div>
                    <Button className="w-full" variant="outline" onClick={() => handleCreateIdentity('non-employee')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Non-Employee
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Bot className="h-5 w-5 text-orange-600" />
                      <span>Non-Human Identities</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Create non-human identities for applications, bots, and automation tasks</p>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">Owner required</Badge>
                      <Badge variant="outline" className="text-xs">Technical approval</Badge>
                      <Badge variant="outline" className="text-xs">Audit trail</Badge>
                    </div>
                    <Button className="w-full" variant="outline" onClick={() => handleCreateIdentity('non-human')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Non-Human Identity
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="modify" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Pending Modifications</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{pendingIdentityModifications.length} pending</Badge>
                    <Button size="sm" onClick={() => setIsModifyDrawerOpen(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Manage Modifications
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {pendingIdentityModifications.slice(0, 5).map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => setIsModifyDrawerOpen(true)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <div className="font-medium">{item.identityName}</div>
                              <div className="text-sm text-muted-foreground">{item.identityType} • {item.modificationType}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{item.status}</Badge>
                            {item.complianceFlags.length > 0 && (
                              <Badge variant="destructive" className="text-xs">{item.complianceFlags.length} flags</Badge>
                            )}
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
                  <h3 className="text-lg font-semibold">Disable Identities</h3>
                  <Badge variant="secondary">{scheduledIdentityDisables.length} scheduled</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Immediate Disable</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">Disable identity access immediately with impact analysis</p>
                      <Button variant="outline" className="w-full" onClick={() => setIsDisableDrawerOpen(true)}>
                        <Pause className="h-4 w-4 mr-2" />
                        Disable Now
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Scheduled Disable</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">Schedule identity disable with compliance verification</p>
                      <Button variant="outline" className="w-full" onClick={() => setIsDisableDrawerOpen(true)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Disable
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Scheduled disables preview */}
                <div className="space-y-3">
                  {scheduledIdentityDisables.slice(0, 3).map((dis) => (
                    <Card key={dis.id} className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => setIsDisableDrawerOpen(true)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{dis.identityName}</div>
                            <div className="text-sm text-muted-foreground">{dis.identityType} • {dis.mode} • {dis.scheduledDate}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={dis.status === 'Processing' ? 'destructive' : 'secondary'}>{dis.status}</Badge>
                            <Badge variant="outline" className="text-xs">{dis.impactedAccounts} accounts</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="delete" className="mt-6">
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h3 className="font-medium text-red-900 dark:text-red-400">Identity Deletion</h3>
                  </div>
                  <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                    Permanent deletion requires approval, compliance verification, and dependency resolution
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Soft Delete (Archive)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">Archive identity while preserving full audit trail and restore capability</p>
                      <Button variant="outline" className="w-full" onClick={() => setIsDeleteDrawerOpen(true)}>
                        Archive Identity
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Hard Delete</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">Permanent removal with executive approval and GDPR assessment</p>
                      <Button variant="destructive" className="w-full" onClick={() => setIsDeleteDrawerOpen(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Request Deletion
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <IdentityOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={handleCloseModal}
        identityType={selectedIdentityType}
      />
      <IdentityModifyDrawer isOpen={isModifyDrawerOpen} onClose={() => setIsModifyDrawerOpen(false)} />
      <IdentityDisableDrawer isOpen={isDisableDrawerOpen} onClose={() => setIsDisableDrawerOpen(false)} />
      <IdentityDeleteDrawer isOpen={isDeleteDrawerOpen} onClose={() => setIsDeleteDrawerOpen(false)} />
    </div>
  );
};

export default IdentitiesLifecycle;
