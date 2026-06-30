import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Search, Pause, AlertTriangle, Users, Bell, ArrowRightLeft, KeyRound, Clock
} from 'lucide-react';
import { entitlementCatalog, scheduledEntitlementDisables, type EntitlementCatalogEntry } from '@/data/mock-lifecycle';
import { useToast } from '@/hooks/use-toast';

interface EntitlementDisableDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EntitlementDisableDrawer: React.FC<EntitlementDisableDrawerProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntitlement, setSelectedEntitlement] = useState<EntitlementCatalogEntry | null>(null);
  const [reason, setReason] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [gracePeriod, setGracePeriod] = useState('14');
  const [notifyUsers, setNotifyUsers] = useState(true);
  const [view, setView] = useState<'scheduled' | 'form'>('scheduled');

  const filteredEntitlements = entitlementCatalog.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.application.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    toast({ title: "Entitlement Disable Scheduled", description: `${selectedEntitlement?.name} will be disabled on ${scheduledDate}.` });
    setView('scheduled');
    setSelectedEntitlement(null);
    setReason('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[50vw] sm:max-w-none flex flex-col p-0 h-full">
        <SheetHeader className="flex-shrink-0 px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Pause className="h-5 w-5 text-yellow-500" />
            Disable Entitlement
          </SheetTitle>
          <SheetDescription>Disable entitlements with impact cascade analysis and user notifications</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 pb-6 space-y-6">
            <div className="flex gap-2">
              <Button variant={view === 'scheduled' ? 'default' : 'outline'} size="sm" onClick={() => setView('scheduled')}>
                Scheduled ({scheduledEntitlementDisables.length})
              </Button>
              <Button variant={view === 'form' ? 'default' : 'outline'} size="sm" onClick={() => setView('form')}>
                Disable Entitlement
              </Button>
            </div>

            {view === 'form' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Entitlement</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search entitlements..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  {searchTerm && !selectedEntitlement && (
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                      {filteredEntitlements.map(ent => (
                        <div key={ent.id} className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0" onClick={() => { setSelectedEntitlement(ent); setSearchTerm(''); }}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{ent.name}</div>
                              <div className="text-xs text-muted-foreground">{ent.application} • {ent.userCount} users • {ent.roleCount} roles</div>
                            </div>
                            <Badge variant="outline" className="text-xs">{ent.riskLevel}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedEntitlement && (
                    <Card className="bg-accent/30">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{selectedEntitlement.name}</div>
                          <div className="text-sm text-muted-foreground">{selectedEntitlement.application}</div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedEntitlement(null)}>Change</Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {selectedEntitlement && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Impact Cascade
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded">
                          <div className="text-lg font-bold text-red-600">{selectedEntitlement.userCount}</div>
                          <div className="text-xs text-muted-foreground">Users Affected</div>
                        </div>
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                          <div className="text-lg font-bold text-yellow-600">{selectedEntitlement.roleCount}</div>
                          <div className="text-xs text-muted-foreground">Roles Affected</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                    <Label className="text-sm">Notify affected users and role owners</Label>
                  </div>
                  <Switch checked={notifyUsers} onCheckedChange={setNotifyUsers} />
                </div>

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea placeholder="Reason for disabling..." value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[80px]" />
                </div>

                <Button className="w-full" disabled={!selectedEntitlement || !reason || !scheduledDate} onClick={handleSubmit}>
                  Schedule Entitlement Disable
                </Button>
              </div>
            )}

            {view === 'scheduled' && (
              <div className="space-y-3">
                {scheduledEntitlementDisables.map((dis) => (
                  <Card key={dis.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            <KeyRound className="h-4 w-4 text-muted-foreground" />
                            {dis.entitlementName}
                          </div>
                          <div className="text-xs text-muted-foreground">{dis.application}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{dis.status}</Badge>
                          <Badge variant="outline" className="text-xs">{dis.riskLevel}</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 bg-accent/30 rounded">
                          <div className="font-bold">{dis.usersAffected}</div>
                          <div className="text-muted-foreground">Users</div>
                        </div>
                        <div className="p-2 bg-accent/30 rounded">
                          <div className="font-bold">{dis.rolesAffected}</div>
                          <div className="text-muted-foreground">Roles</div>
                        </div>
                        <div className="p-2 bg-accent/30 rounded">
                          <div className="font-bold">{dis.gracePeriodDays}d</div>
                          <div className="text-muted-foreground">Grace</div>
                        </div>
                      </div>
                      {dis.alternativeEntitlement && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <ArrowRightLeft className="h-3 w-3" />
                          Alternative: {dis.alternativeEntitlement}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">Date: {dis.scheduledDate} • {dis.reason}</div>
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
