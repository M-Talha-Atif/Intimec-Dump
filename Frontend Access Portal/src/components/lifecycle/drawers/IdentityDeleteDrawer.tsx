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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Trash2, Archive, AlertTriangle, CheckCircle, XCircle,
  Shield, RotateCcw, FileText, Users
} from 'lucide-react';
import { identityCatalog, identityDeletionHistory, type IdentityCatalogEntry } from '@/data/mock-lifecycle';
import { useToast } from '@/hooks/use-toast';

interface IdentityDeleteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IdentityDeleteDrawer: React.FC<IdentityDeleteDrawerProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIdentity, setSelectedIdentity] = useState<IdentityCatalogEntry | null>(null);
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');
  const [reason, setReason] = useState('');
  const [executiveApprover, setExecutiveApprover] = useState('');
  const [gdprAck, setGdprAck] = useState(false);
  const [dataRetentionAck, setDataRetentionAck] = useState(false);
  const [view, setView] = useState<'form' | 'history'>('history');

  const filteredIdentities = identityCatalog.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const preChecks = selectedIdentity ? [
    { check: 'All accounts deprovisioned', passed: selectedIdentity.accountCount === 0 },
    { check: 'No active sessions', passed: true },
    { check: 'No pending requests', passed: true },
    { check: 'Manager approval obtained', passed: false },
    { check: 'Compliance review completed', passed: false },
  ] : [];

  const allChecksPassed = preChecks.every(c => c.passed);

  const handleSubmit = () => {
    toast({
      title: deleteType === 'soft' ? "Identity Archived" : "Deletion Requested",
      description: deleteType === 'soft' 
        ? `${selectedIdentity?.name} has been archived with audit trail preserved.`
        : `Hard deletion request for ${selectedIdentity?.name} has been submitted for executive approval.`,
    });
    setView('history');
    setSelectedIdentity(null);
    setReason('');
  };

  const handleRestore = (id: string) => {
    toast({ title: "Identity Restored", description: "The archived identity has been restored successfully." });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[50vw] sm:max-w-none flex flex-col p-0 h-full">
        <SheetHeader className="flex-shrink-0 px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Identity Deletion
          </SheetTitle>
          <SheetDescription>
            Archive or permanently delete identities with compliance verification
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 pb-6 space-y-6">
            <div className="flex gap-2">
              <Button variant={view === 'history' ? 'default' : 'outline'} size="sm" onClick={() => setView('history')}>
                Deletion History ({identityDeletionHistory.length})
              </Button>
              <Button variant={view === 'form' ? 'default' : 'outline'} size="sm" onClick={() => setView('form')}>
                Delete Identity
              </Button>
            </div>

            {view === 'form' && (
              <div className="space-y-6">
                {/* Delete Type Toggle */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {deleteType === 'soft' ? <Archive className="h-4 w-4 text-yellow-500" /> : <Trash2 className="h-4 w-4 text-red-500" />}
                        <span className="font-medium text-sm">{deleteType === 'soft' ? 'Soft Delete (Archive)' : 'Hard Delete (Permanent)'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Archive</span>
                        <Switch checked={deleteType === 'hard'} onCheckedChange={(c) => setDeleteType(c ? 'hard' : 'soft')} />
                        <span className="text-xs text-muted-foreground">Permanent</span>
                      </div>
                    </div>
                    {deleteType === 'hard' && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded text-xs text-red-600">
                        ⚠️ Hard delete is irreversible. All identity data will be permanently removed.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Identity Search */}
                <div className="space-y-2">
                  <Label>Select Identity</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search identities..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  {searchTerm && !selectedIdentity && (
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                      {filteredIdentities.map(identity => (
                        <div key={identity.id} className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0" onClick={() => { setSelectedIdentity(identity); setSearchTerm(''); }}>
                          <div className="font-medium text-sm">{identity.name}</div>
                          <div className="text-xs text-muted-foreground">{identity.id} • {identity.type}</div>
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

                {/* Pre-deletion Checklist */}
                {selectedIdentity && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Pre-Deletion Checklist
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {preChecks.map((check, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {check.passed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                          <span className={check.passed ? '' : 'text-red-600'}>{check.check}</span>
                        </div>
                      ))}
                      {!allChecksPassed && (
                        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded text-xs text-yellow-700">
                          Some pre-checks have not passed. Address these before proceeding.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Dependency Tree */}
                {selectedIdentity && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Dependencies</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 bg-accent/30 rounded">
                        <span>Connected Accounts</span>
                        <Badge variant={selectedIdentity.accountCount > 0 ? 'destructive' : 'secondary'}>{selectedIdentity.accountCount}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-accent/30 rounded">
                        <span>Assigned Roles</span>
                        <Badge variant={selectedIdentity.roleCount > 0 ? 'destructive' : 'secondary'}>{selectedIdentity.roleCount}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-accent/30 rounded">
                        <span>Entitlements</span>
                        <Badge variant={selectedIdentity.entitlementCount > 0 ? 'destructive' : 'secondary'}>{selectedIdentity.entitlementCount}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Hard Delete Extras */}
                {deleteType === 'hard' && (
                  <>
                    <div className="space-y-2">
                      <Label>Executive Approver</Label>
                      <Select value={executiveApprover} onValueChange={setExecutiveApprover}>
                        <SelectTrigger><SelectValue placeholder="Select approver" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ciso">CISO — Chief Information Security Officer</SelectItem>
                          <SelectItem value="cto">CTO — Chief Technology Officer</SelectItem>
                          <SelectItem value="dpo">DPO — Data Protection Officer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="gdpr" checked={gdprAck} onCheckedChange={(c) => setGdprAck(c as boolean)} />
                        <Label htmlFor="gdpr" className="text-sm">GDPR/Privacy impact assessment completed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="retention" checked={dataRetentionAck} onCheckedChange={(c) => setDataRetentionAck(c as boolean)} />
                        <Label htmlFor="retention" className="text-sm">Data retention requirements satisfied</Label>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Reason for Deletion</Label>
                  <Textarea placeholder="Provide reason..." value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[80px]" />
                </div>

                <Button
                  className="w-full"
                  variant="destructive"
                  disabled={!selectedIdentity || !reason || (deleteType === 'hard' && (!executiveApprover || !gdprAck || !dataRetentionAck))}
                  onClick={handleSubmit}
                >
                  {deleteType === 'soft' ? 'Archive Identity' : 'Request Hard Deletion'}
                </Button>
              </div>
            )}

            {view === 'history' && (
              <div className="space-y-3">
                {identityDeletionHistory.map((del) => (
                  <Card key={del.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-sm">{del.identityName}</div>
                          <div className="text-xs text-muted-foreground">{del.identityId} • {del.identityType}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={del.deleteType === 'Hard Delete' ? 'destructive' : 'secondary'}>{del.deleteType}</Badge>
                          <Badge variant={del.status === 'Restored' ? 'default' : del.status === 'Permanently Deleted' ? 'destructive' : 'secondary'}>
                            {del.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Deleted by {del.deletedBy} on {del.deletedDate}</div>
                        <div>Reason: {del.reason}</div>
                      </div>
                      {del.canRestore && (
                        <Button size="sm" variant="outline" className="mt-2" onClick={() => handleRestore(del.id)}>
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Restore
                        </Button>
                      )}
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
