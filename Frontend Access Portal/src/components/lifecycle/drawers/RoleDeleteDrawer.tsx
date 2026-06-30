import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Trash2, AlertTriangle, CheckCircle, XCircle, Shield, Users
} from 'lucide-react';
import { roleDeletionCandidates } from '@/data/mock-lifecycle';
import { useToast } from '@/hooks/use-toast';

interface RoleDeleteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleDeleteDrawer: React.FC<RoleDeleteDrawerProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [approver, setApprover] = useState('');
  const [auditAck, setAuditAck] = useState(false);

  const selectedRole = roleDeletionCandidates.find(r => r.id === selectedRoleId);

  const handleDelete = () => {
    toast({ title: "Role Deletion Requested", description: `Deletion request for ${selectedRole?.roleName} has been submitted.` });
    setSelectedRoleId(null);
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
            Role Deletion
          </SheetTitle>
          <SheetDescription>Delete roles with pre-validation and compliance checks</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 pb-6 space-y-6">
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
              <CardContent className="p-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Role deletion requires zero active assignments and approval workflow</span>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {roleDeletionCandidates.map((role) => (
                <Card 
                  key={role.id} 
                  className={`cursor-pointer transition-colors ${selectedRoleId === role.id ? 'ring-2 ring-primary' : 'hover:bg-accent/20'}`}
                  onClick={() => setSelectedRoleId(selectedRoleId === role.id ? null : role.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-sm">{role.roleName}</div>
                        <div className="text-xs text-muted-foreground">{role.roleType} • Last used {role.lastUsed}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {role.canDelete ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">Eligible</Badge>
                        ) : (
                          <Badge variant="destructive">Blocked</Badge>
                        )}
                      </div>
                    </div>

                    {/* Validation checks */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        {role.activeUsers === 0 ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                        <span>{role.activeUsers} active users</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {role.dependentRoles.length === 0 ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                        <span>{role.dependentRoles.length === 0 ? 'No dependent roles' : `Depends on: ${role.dependentRoles.join(', ')}`}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {role.complianceStatus === 'Approved' ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                        <span>Compliance: {role.complianceStatus}</span>
                      </div>
                    </div>

                    {role.blockingReasons.length > 0 && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded">
                        <div className="text-xs text-red-600">
                          {role.blockingReasons.map((r, i) => <div key={i}>• {r}</div>)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedRole && selectedRole.canDelete && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Approver</Label>
                  <Select value={approver} onValueChange={setApprover}>
                    <SelectTrigger><SelectValue placeholder="Select approver" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ciso">CISO</SelectItem>
                      <SelectItem value="it-director">IT Director</SelectItem>
                      <SelectItem value="compliance">Compliance Officer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea placeholder="Reason for deletion..." value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[80px]" />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="audit-ack" checked={auditAck} onCheckedChange={(c) => setAuditAck(c as boolean)} />
                  <Label htmlFor="audit-ack" className="text-sm">Audit trail will be preserved per retention policy</Label>
                </div>

                <Button variant="destructive" className="w-full" disabled={!reason || !approver || !auditAck} onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Request Role Deletion
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
