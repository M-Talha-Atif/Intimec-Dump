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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Search, Pause, Calendar, AlertTriangle, CheckCircle, XCircle,
  Clock, Shield, Users, RefreshCw, Bell
} from 'lucide-react';
import { identityCatalog, scheduledIdentityDisables, type IdentityCatalogEntry } from '@/data/mock-lifecycle';
import { useToast } from '@/hooks/use-toast';

interface IdentityDisableDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IdentityDisableDrawer: React.FC<IdentityDisableDrawerProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIdentity, setSelectedIdentity] = useState<IdentityCatalogEntry | null>(null);
  const [mode, setMode] = useState<'immediate' | 'scheduled'>('scheduled');
  const [reason, setReason] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [autoReactivation, setAutoReactivation] = useState(false);
  const [reactivationDate, setReactivationDate] = useState('');
  const [view, setView] = useState<'form' | 'scheduled'>('scheduled');

  const filteredIdentities = identityCatalog.filter(i =>
    i.status === 'Active' && (
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSubmit = () => {
    toast({
      title: mode === 'immediate' ? "Identity Disabled" : "Disable Scheduled",
      description: `${selectedIdentity?.name} ${mode === 'immediate' ? 'has been disabled immediately' : `will be disabled on ${scheduledDate}`}.`,
    });
    resetForm();
    setView('scheduled');
  };

  const resetForm = () => {
    setSelectedIdentity(null);
    setReason('');
    setScheduledDate('');
    setIsEmergency(false);
    setAutoReactivation(false);
    setReactivationDate('');
  };

  const getDaysUntil = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[50vw] sm:max-w-none flex flex-col p-0 h-full">
        <SheetHeader className="flex-shrink-0 px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Pause className="h-5 w-5 text-yellow-500" />
            Disable Identity
          </SheetTitle>
          <SheetDescription>
            Disable identity access immediately or schedule for a future date
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 pb-6 space-y-6">
            <div className="flex gap-2">
              <Button variant={view === 'scheduled' ? 'default' : 'outline'} size="sm" onClick={() => setView('scheduled')}>
                Scheduled Disables ({scheduledIdentityDisables.length})
              </Button>
              <Button variant={view === 'form' ? 'default' : 'outline'} size="sm" onClick={() => setView('form')}>
                Disable Identity
              </Button>
            </div>

            {view === 'form' && (
              <div className="space-y-6">
                {/* Mode Toggle */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {mode === 'immediate' ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <Calendar className="h-4 w-4 text-blue-500" />}
                        <span className="font-medium text-sm">{mode === 'immediate' ? 'Immediate Disable' : 'Scheduled Disable'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Scheduled</span>
                        <Switch checked={mode === 'immediate'} onCheckedChange={(c) => setMode(c ? 'immediate' : 'scheduled')} />
                        <span className="text-xs text-muted-foreground">Immediate</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Identity Search */}
                <div className="space-y-2">
                  <Label>Select Identity</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search active identities..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  {searchTerm && !selectedIdentity && (
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                      {filteredIdentities.map(identity => (
                        <div key={identity.id} className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0" onClick={() => { setSelectedIdentity(identity); setSearchTerm(''); }}>
                          <div className="font-medium text-sm">{identity.name}</div>
                          <div className="text-xs text-muted-foreground">{identity.id} • {identity.type} • {identity.department}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedIdentity && (
                    <Card className="bg-accent/30">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{selectedIdentity.name}</div>
                          <div className="text-sm text-muted-foreground">{selectedIdentity.id} • {selectedIdentity.type}</div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedIdentity(null)}>Change</Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Impact Preview */}
                {selectedIdentity && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Impact Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded">
                          <div className="text-lg font-bold text-red-600">{selectedIdentity.accountCount}</div>
                          <div className="text-xs text-muted-foreground">Accounts to Disable</div>
                        </div>
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                          <div className="text-lg font-bold text-yellow-600">2</div>
                          <div className="text-xs text-muted-foreground">Active Sessions</div>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                          <div className="text-lg font-bold text-blue-600">{selectedIdentity.roleCount}</div>
                          <div className="text-xs text-muted-foreground">Roles Suspended</div>
                        </div>
                        <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                          <div className="text-lg font-bold text-purple-600">{selectedIdentity.entitlementCount}</div>
                          <div className="text-xs text-muted-foreground">Entitlements Revoked</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Scheduled Date */}
                {mode === 'scheduled' && (
                  <div className="space-y-2">
                    <Label>Scheduled Date</Label>
                    <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                  </div>
                )}

                {/* Emergency Flag */}
                {mode === 'immediate' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox id="emergency" checked={isEmergency} onCheckedChange={(c) => setIsEmergency(c as boolean)} />
                    <Label htmlFor="emergency" className="text-sm text-red-600 font-medium">
                      🚨 Emergency disable — bypass standard approval workflow
                    </Label>
                  </div>
                )}

                {/* Auto-reactivation */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm">Auto-Reactivation</Label>
                      </div>
                      <Switch checked={autoReactivation} onCheckedChange={setAutoReactivation} />
                    </div>
                    {autoReactivation && (
                      <div className="space-y-2">
                        <Label className="text-xs">Reactivation Date</Label>
                        <Input type="date" value={reactivationDate} onChange={(e) => setReactivationDate(e.target.value)} />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Reason */}
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea placeholder="Provide reason for disabling..." value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[80px]" />
                </div>

                {/* Compliance Checklist */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Compliance Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {['Data retention policy verified', 'Audit trail will be preserved', 'Manager/supervisor notified', 'Pending requests will be cancelled'].map((check, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{check}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Button className="w-full" variant={mode === 'immediate' ? 'destructive' : 'default'} disabled={!selectedIdentity || !reason} onClick={handleSubmit}>
                  {mode === 'immediate' ? 'Disable Now' : 'Schedule Disable'}
                </Button>
              </div>
            )}

            {view === 'scheduled' && (
              <div className="space-y-3">
                {scheduledIdentityDisables.map((dis) => (
                  <Card key={dis.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{dis.identityName}</div>
                          <div className="text-xs text-muted-foreground">{dis.identityId} • {dis.identityType}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={dis.status === 'Processing' ? 'destructive' : 'secondary'}>{dis.status}</Badge>
                          {dis.mode === 'Immediate' && <Badge variant="destructive">Immediate</Badge>}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 bg-accent/30 rounded">
                          <div className="font-bold">{dis.impactedAccounts}</div>
                          <div className="text-muted-foreground">Accounts</div>
                        </div>
                        <div className="p-2 bg-accent/30 rounded">
                          <div className="font-bold">{dis.activeSessions}</div>
                          <div className="text-muted-foreground">Sessions</div>
                        </div>
                        <div className="p-2 bg-accent/30 rounded">
                          <div className="font-bold">{getDaysUntil(dis.scheduledDate)}d</div>
                          <div className="text-muted-foreground">Countdown</div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Reason:</span> {dis.reason}
                      </div>

                      {dis.autoReactivation && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <RefreshCw className="h-3 w-3" />
                          Auto-reactivation: {dis.reactivationDate}
                        </div>
                      )}

                      {/* Compliance Checks */}
                      <div className="flex gap-2">
                        {dis.complianceChecks.map((check, i) => (
                          <div key={i} className="flex items-center gap-1 text-xs">
                            {check.passed ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                            <span className="text-muted-foreground">{check.check.split(' ').slice(0, 2).join(' ')}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Clock className="h-3 w-3 mr-1" />
                          Reschedule
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1">Cancel</Button>
                      </div>
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
