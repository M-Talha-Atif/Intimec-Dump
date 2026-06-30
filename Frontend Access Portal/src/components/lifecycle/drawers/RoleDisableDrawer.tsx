import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Search, Pause, Calendar, AlertTriangle, Users, Clock, 
  ArrowRightLeft, Bell, Shield
} from 'lucide-react';
import { roleCatalog, scheduledRoleDisables, type RoleCatalogEntry } from '@/data/mock-lifecycle';
import { useToast } from '@/hooks/use-toast';

interface RoleDisableDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleDisableDrawer: React.FC<RoleDisableDrawerProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleCatalogEntry | null>(null);
  const [reason, setReason] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [alternativeRole, setAlternativeRole] = useState('');
  const [gracePeriod, setGracePeriod] = useState('14');
  const [notifyUsers, setNotifyUsers] = useState(true);
  const [view, setView] = useState<'scheduled' | 'form'>('scheduled');

  const activeRoles = roleCatalog.filter(r => r.status === 'Active');
  const filteredRoles = activeRoles.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    toast({ title: "Role Disable Scheduled", description: `${selectedRole?.name} will be disabled on ${scheduledDate}.` });
    setView('scheduled');
    setSelectedRole(null);
    setReason('');
    setScheduledDate('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[50vw] sm:max-w-none flex flex-col p-0 h-full">
        <SheetHeader className="flex-shrink-0 px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Pause className="h-5 w-5 text-yellow-500" />
            Disable Role
          </SheetTitle>
          <SheetDescription>Disable roles with impact analysis and user transition planning</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 pb-6 space-y-6">
            <div className="flex gap-2">
              <Button variant={view === 'scheduled' ? 'default' : 'outline'} size="sm" onClick={() => setView('scheduled')}>
                Scheduled ({scheduledRoleDisables.length})
              </Button>
              <Button variant={view === 'form' ? 'default' : 'outline'} size="sm" onClick={() => setView('form')}>
                Disable Role
              </Button>
            </div>

            {view === 'form' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Role</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search roles..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  {searchTerm && !selectedRole && (
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                      {filteredRoles.map(role => (
                        <div key={role.id} className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0" onClick={() => { setSelectedRole(role); setSearchTerm(''); }}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{role.name}</div>
                              <div className="text-xs text-muted-foreground">{role.type} • {role.userCount} users • Last used {role.lastUsed}</div>
                            </div>
                            <Badge variant="outline" className="text-xs">{role.riskLevel}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedRole && (
                    <Card className="bg-accent/30">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{selectedRole.name}</div>
                          <div className="text-sm text-muted-foreground">{selectedRole.type} • {selectedRole.userCount} users</div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)}>Change</Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {selectedRole && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Impact Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded">
                          <div className="text-lg font-bold text-red-600">{selectedRole.userCount}</div>
                          <div className="text-xs text-muted-foreground">Users Lose Access</div>
                        </div>
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                          <div className="text-lg font-bold text-yellow-600">{selectedRole.entitlementCount}</div>
                          <div className="text-xs text-muted-foreground">Entitlements Affected</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label>Transition Plan — Alternative Role</Label>
                  <Select value={alternativeRole} onValueChange={setAlternativeRole}>
                    <SelectTrigger><SelectValue placeholder="Select alternative role (optional)" /></SelectTrigger>
                    <SelectContent>
                      {roleCatalog.filter(r => r.id !== selectedRole?.id && r.status === 'Active').map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name} ({r.type})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Scheduled Date</Label>
                    <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Grace Period (days)</Label>
                    <Input type="number" value={gracePeriod} onChange={(e) => setGracePeriod(e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Notify affected users</Label>
                  </div>
                  <Switch checked={notifyUsers} onCheckedChange={setNotifyUsers} />
                </div>

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea placeholder="Reason for disabling..." value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[80px]" />
                </div>

                <Button className="w-full" disabled={!selectedRole || !reason || !scheduledDate} onClick={handleSubmit}>
                  Schedule Role Disable
                </Button>
              </div>
            )}

            {view === 'scheduled' && (
              <div className="space-y-3">
                {scheduledRoleDisables.map((dis) => (
                  <Card key={dis.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{dis.roleName}</div>
                          <div className="text-xs text-muted-foreground">{dis.roleType} • {dis.usersAffected} users affected</div>
                        </div>
                        <Badge variant="secondary">{dis.status}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 bg-accent/30 rounded">
                          <div className="font-bold">{dis.scheduledDate}</div>
                          <div className="text-muted-foreground">Disable Date</div>
                        </div>
                        <div className="p-2 bg-accent/30 rounded">
                          <div className="font-bold">{dis.gracePeriodDays}d</div>
                          <div className="text-muted-foreground">Grace Period</div>
                        </div>
                        <div className="p-2 bg-accent/30 rounded">
                          <div className="font-bold">{dis.notificationSent ? '✓' : '✗'}</div>
                          <div className="text-muted-foreground">Notified</div>
                        </div>
                      </div>
                      {dis.alternativeRole && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <ArrowRightLeft className="h-3 w-3" />
                          Transition to: {dis.alternativeRole}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">Reason: {dis.reason}</div>
                      <Button size="sm" variant="destructive" className="w-full">Cancel Schedule</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
