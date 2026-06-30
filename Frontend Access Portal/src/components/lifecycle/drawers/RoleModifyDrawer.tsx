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
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, Edit, ArrowRight, Shield, AlertTriangle, CheckCircle, 
  Clock, Users, ChevronDown, ChevronUp, X
} from 'lucide-react';
import { roleCatalog, pendingRoleModifications, type RoleCatalogEntry } from '@/data/mock-lifecycle';
import { useToast } from '@/hooks/use-toast';

interface RoleModifyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleModifyDrawer: React.FC<RoleModifyDrawerProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleCatalogEntry | null>(null);
  const [modificationType, setModificationType] = useState('');
  const [justification, setJustification] = useState('');
  const [complianceAck, setComplianceAck] = useState(false);
  const [expandedModId, setExpandedModId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'form'>('list');

  const filteredRoles = roleCatalog.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    toast({ title: "Role Modification Submitted", description: `Change request for ${selectedRole?.name} has been submitted for approval.` });
    setView('list');
    setSelectedRole(null);
    setModificationType('');
    setJustification('');
    setComplianceAck(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': case 'approved': return 'bg-green-100 text-green-800';
      case 'Pending Review': case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Under Review': return 'bg-purple-100 text-purple-800';
      case 'Rejected': case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[50vw] sm:max-w-none flex flex-col p-0 h-full">
        <SheetHeader className="flex-shrink-0 px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Role Modification
          </SheetTitle>
          <SheetDescription>Modify role entitlements, ownership, risk classification, and SoD rules</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 pb-6 space-y-6">
            <div className="flex gap-2">
              <Button variant={view === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setView('list')}>
                Pending Changes ({pendingRoleModifications.length})
              </Button>
              <Button variant={view === 'form' ? 'default' : 'outline'} size="sm" onClick={() => setView('form')}>
                New Modification
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
                        <div key={role.id} className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 flex items-center justify-between" onClick={() => { setSelectedRole(role); setSearchTerm(''); }}>
                          <div>
                            <div className="font-medium text-sm">{role.name}</div>
                            <div className="text-xs text-muted-foreground">{role.id} • {role.type} • {role.userCount} users</div>
                          </div>
                          <Badge variant={role.riskLevel === 'Critical' ? 'destructive' : 'outline'} className="text-xs">{role.riskLevel}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedRole && (
                    <Card className="bg-accent/30">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{selectedRole.name}</div>
                          <div className="text-sm text-muted-foreground">{selectedRole.type} • {selectedRole.userCount} users • {selectedRole.entitlementCount} entitlements</div>
                          {selectedRole.sodConflicts > 0 && <Badge variant="destructive" className="text-xs mt-1">{selectedRole.sodConflicts} SoD conflicts</Badge>}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)}>Change</Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Modification Type</Label>
                  <Select value={modificationType} onValueChange={setModificationType}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Add Entitlements">Add Entitlements</SelectItem>
                      <SelectItem value="Remove Entitlements">Remove Entitlements</SelectItem>
                      <SelectItem value="Change Owner">Change Owner</SelectItem>
                      <SelectItem value="Risk Reclassification">Risk Reclassification</SelectItem>
                      <SelectItem value="Adjust SoD Rules">Adjust SoD Rules</SelectItem>
                      <SelectItem value="Modify Approval Policy">Modify Approval Policy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedRole && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Impact Summary</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-2 bg-accent/30 rounded">
                          <div className="text-lg font-bold">{selectedRole.userCount}</div>
                          <div className="text-xs text-muted-foreground">Users Affected</div>
                        </div>
                        <div className="p-2 bg-accent/30 rounded">
                          <div className="text-lg font-bold">{selectedRole.entitlementCount}</div>
                          <div className="text-xs text-muted-foreground">Entitlements</div>
                        </div>
                        <div className="p-2 bg-accent/30 rounded">
                          <div className="text-lg font-bold">{selectedRole.sodConflicts}</div>
                          <div className="text-xs text-muted-foreground">SoD Conflicts</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedRole && selectedRole.sodConflicts > 0 && (
                  <Card className="border-red-200">
                    <CardContent className="p-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">{selectedRole.sodConflicts} SoD conflicts detected. Additional review required.</span>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label>Business Justification</Label>
                  <Textarea placeholder="Provide justification..." value={justification} onChange={(e) => setJustification(e.target.value)} className="min-h-[80px]" />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="role-compliance" checked={complianceAck} onCheckedChange={(c) => setComplianceAck(c as boolean)} />
                  <Label htmlFor="role-compliance" className="text-sm">I acknowledge this may affect access for {selectedRole?.userCount || 0} users</Label>
                </div>

                <Button className="w-full" disabled={!selectedRole || !modificationType || !justification || !complianceAck} onClick={handleSubmit}>
                  Submit Role Change Request
                </Button>
              </div>
            )}

            {view === 'list' && (
              <div className="space-y-3">
                {pendingRoleModifications.map((mod) => (
                  <Card key={mod.id} className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => setExpandedModId(expandedModId === mod.id ? null : mod.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{mod.roleName}</div>
                          <div className="text-xs text-muted-foreground">{mod.roleType} • {mod.modificationType}</div>
                          <div className="text-xs text-muted-foreground">{mod.usersAffected} users affected</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(mod.status)} variant="secondary">{mod.status}</Badge>
                          {mod.sodConflicts > 0 && <Badge variant="destructive" className="text-xs">{mod.sodConflicts} SoD</Badge>}
                          {expandedModId === mod.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>

                      {expandedModId === mod.id && (
                        <div className="mt-4 space-y-3">
                          <Separator />
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex-1 p-2 bg-red-50 dark:bg-red-950/20 rounded">
                              <div className="text-xs text-muted-foreground">Current</div>
                              <div className="font-medium text-xs">{mod.currentValue}</div>
                            </div>
                            <ArrowRight className="h-4 w-4 flex-shrink-0" />
                            <div className="flex-1 p-2 bg-green-50 dark:bg-green-950/20 rounded">
                              <div className="text-xs text-muted-foreground">Proposed</div>
                              <div className="font-medium text-xs">{mod.proposedValue}</div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">Approval Chain</div>
                            {mod.approvers.map((a, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                {a.status === 'approved' ? <CheckCircle className="h-3 w-3 text-green-500" /> : a.status === 'rejected' ? <X className="h-3 w-3 text-red-500" /> : <Clock className="h-3 w-3 text-yellow-500" />}
                                <span>{a.name}</span>
                                <Badge variant="outline" className={`ml-auto text-xs ${getStatusColor(a.status)}`}>{a.status}</Badge>
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Justification:</span> {mod.justification}
                          </div>
                        </div>
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
