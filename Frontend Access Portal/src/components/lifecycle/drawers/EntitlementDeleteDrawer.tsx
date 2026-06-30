import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Trash2, AlertTriangle, CheckCircle, XCircle, KeyRound
} from 'lucide-react';
import { entitlementDeletionCandidates } from '@/data/mock-lifecycle';
import { useToast } from '@/hooks/use-toast';

interface EntitlementDeleteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EntitlementDeleteDrawer: React.FC<EntitlementDeleteDrawerProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [approver, setApprover] = useState('');
  const [auditAck, setAuditAck] = useState(false);

  const selected = entitlementDeletionCandidates.find(e => e.id === selectedId);

  const handleDelete = () => {
    toast({ title: "Entitlement Deletion Requested", description: `Deletion request for ${selected?.entitlementName} has been submitted.` });
    setSelectedId(null);
    setReason('');
    setApprover('');
    setAuditAck(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[50vw] sm:max-w-none flex flex-col p-0 h-full">
        <SheetHeader className="flex-shrink-0 px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Entitlement Deletion
          </SheetTitle>
          <SheetDescription>Delete entitlements with dependency analysis and compliance approval</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 pb-6 space-y-6">
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
              <CardContent className="p-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Permanent deletion requires zero active assignments and compliance approval</span>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {entitlementDeletionCandidates.map((ent) => (
                <Card 
                  key={ent.id}
                  className={`cursor-pointer transition-colors ${selectedId === ent.id ? 'ring-2 ring-primary' : 'hover:bg-accent/20'}`}
                  onClick={() => setSelectedId(selectedId === ent.id ? null : ent.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{ent.entitlementName}</div>
                          <div className="text-xs text-muted-foreground">{ent.application} • Last used {ent.lastUsed}</div>
                        </div>
                      </div>
                      {ent.canDelete ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Eligible</Badge>
                      ) : (
                        <Badge variant="destructive">Blocked</Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        {ent.activeAssignments === 0 ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                        <span>{ent.activeAssignments} active assignments</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {ent.containingRoles.length === 0 ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                        <span>{ent.containingRoles.length === 0 ? 'No containing roles' : `In roles: ${ent.containingRoles.join(', ')}`}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {ent.complianceStatus === 'Approved' ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                        <span>Compliance: {ent.complianceStatus}</span>
                      </div>
                    </div>

                    {ent.blockingReasons.length > 0 && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded text-xs text-red-600">
                        {ent.blockingReasons.map((r, i) => <div key={i}>• {r}</div>)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {selected && selected.canDelete && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Approver</Label>
                  <Select value={approver} onValueChange={setApprover}>
                    <SelectTrigger><SelectValue placeholder="Select approver" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="app-owner">Application Owner</SelectItem>
                      <SelectItem value="ciso">CISO</SelectItem>
                      <SelectItem value="compliance">Compliance Officer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea placeholder="Reason for deletion..." value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[80px]" />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="ent-audit" checked={auditAck} onCheckedChange={(c) => setAuditAck(c as boolean)} />
                  <Label htmlFor="ent-audit" className="text-sm">Audit trail preserved per retention policy</Label>
                </div>

                <Button variant="destructive" className="w-full" disabled={!reason || !approver || !auditAck} onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Request Entitlement Deletion
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
