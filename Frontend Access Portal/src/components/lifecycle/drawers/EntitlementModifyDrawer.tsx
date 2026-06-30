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
  Search, Edit, ArrowRight, AlertTriangle, CheckCircle, Clock,
  ChevronDown, ChevronUp, X, KeyRound
} from 'lucide-react';
import { entitlementCatalog, pendingEntitlementModifications, type EntitlementCatalogEntry } from '@/data/mock-lifecycle';
import { useToast } from '@/hooks/use-toast';

interface EntitlementModifyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EntitlementModifyDrawer: React.FC<EntitlementModifyDrawerProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntitlement, setSelectedEntitlement] = useState<EntitlementCatalogEntry | null>(null);
  const [modificationType, setModificationType] = useState('');
  const [justification, setJustification] = useState('');
  const [complianceAck, setComplianceAck] = useState(false);
  const [expandedModId, setExpandedModId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'form'>('list');

  const filteredEntitlements = entitlementCatalog.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.application.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    toast({ title: "Entitlement Change Submitted", description: `Change request for ${selectedEntitlement?.name} submitted for approval.` });
    setView('list');
    setSelectedEntitlement(null);
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
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[50vw] sm:max-w-none flex flex-col p-0 h-full">
        <SheetHeader className="flex-shrink-0 px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Entitlement Modification
          </SheetTitle>
          <SheetDescription>Modify entitlement risk, scope, ownership, and compliance mappings</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 pb-6 space-y-6">
            <div className="flex gap-2">
              <Button variant={view === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setView('list')}>
                Pending Changes ({pendingEntitlementModifications.length})
              </Button>
              <Button variant={view === 'form' ? 'default' : 'outline'} size="sm" onClick={() => setView('form')}>
                New Modification
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
                        <div key={ent.id} className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 flex items-center justify-between" onClick={() => { setSelectedEntitlement(ent); setSearchTerm(''); }}>
                          <div>
                            <div className="font-medium text-sm">{ent.name}</div>
                            <div className="text-xs text-muted-foreground">{ent.application} • {ent.type} • {ent.userCount} users</div>
                          </div>
                          <Badge variant={ent.riskLevel === 'Critical' ? 'destructive' : 'outline'} className="text-xs">{ent.riskLevel}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedEntitlement && (
                    <Card className="bg-accent/30">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{selectedEntitlement.name}</div>
                          <div className="text-sm text-muted-foreground">{selectedEntitlement.application} • {selectedEntitlement.riskLevel} Risk</div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedEntitlement(null)}>Change</Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Modification Type</Label>
                  <Select value={modificationType} onValueChange={setModificationType}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Risk Reclassification">Risk Reclassification</SelectItem>
                      <SelectItem value="Scope Change">Scope Change</SelectItem>
                      <SelectItem value="Access Restriction">Access Restriction</SelectItem>
                      <SelectItem value="Owner Transfer">Owner Transfer</SelectItem>
                      <SelectItem value="Compliance Mapping Update">Compliance Mapping Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedEntitlement && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Risk Impact Assessment</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-2 bg-accent/30 rounded">
                          <div className="text-lg font-bold">{selectedEntitlement.userCount}</div>
                          <div className="text-xs text-muted-foreground">Users Affected</div>
                        </div>
                        <div className="p-2 bg-accent/30 rounded">
                          <div className="text-lg font-bold">{selectedEntitlement.roleCount}</div>
                          <div className="text-xs text-muted-foreground">Roles Containing</div>
                        </div>
                        <div className="p-2 bg-accent/30 rounded">
                          <div className="text-xs font-bold">{selectedEntitlement.lastCertified}</div>
                          <div className="text-xs text-muted-foreground">Last Certified</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label>Business Justification</Label>
                  <Textarea placeholder="Provide justification..." value={justification} onChange={(e) => setJustification(e.target.value)} className="min-h-[80px]" />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="ent-compliance" checked={complianceAck} onCheckedChange={(c) => setComplianceAck(c as boolean)} />
                  <Label htmlFor="ent-compliance" className="text-sm">I acknowledge this change may affect certification schedules</Label>
                </div>

                <Button className="w-full" disabled={!selectedEntitlement || !modificationType || !justification || !complianceAck} onClick={handleSubmit}>
                  Submit Entitlement Change
                </Button>
              </div>
            )}

            {view === 'list' && (
              <div className="space-y-3">
                {pendingEntitlementModifications.map((mod) => (
                  <Card key={mod.id} className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => setExpandedModId(expandedModId === mod.id ? null : mod.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            <KeyRound className="h-4 w-4 text-muted-foreground" />
                            {mod.entitlementName}
                          </div>
                          <div className="text-xs text-muted-foreground">{mod.application} • {mod.modificationType}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(mod.status)} variant="secondary">{mod.status}</Badge>
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
                          <div className="text-xs p-2 bg-accent/30 rounded">
                            <span className="font-medium">Risk Impact:</span> {mod.riskImpact}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-center text-xs">
                            <div className="p-2 bg-accent/30 rounded">
                              <div className="font-bold">{mod.usersAffected}</div>
                              <div className="text-muted-foreground">Users</div>
                            </div>
                            <div className="p-2 bg-accent/30 rounded">
                              <div className="font-bold">{mod.rolesAffected}</div>
                              <div className="text-muted-foreground">Roles</div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">Approvers</div>
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
