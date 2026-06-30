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
  Clock, User, FileText, ChevronDown, ChevronUp, X, Download
} from 'lucide-react';
import { 
  identityCatalog, pendingIdentityModifications, 
  type IdentityCatalogEntry, type PendingIdentityModification 
} from '@/data/mock-lifecycle';
import { useToast } from '@/hooks/use-toast';

interface IdentityModifyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IdentityModifyDrawer: React.FC<IdentityModifyDrawerProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIdentity, setSelectedIdentity] = useState<IdentityCatalogEntry | null>(null);
  const [modificationType, setModificationType] = useState('');
  const [proposedValue, setProposedValue] = useState('');
  const [justification, setJustification] = useState('');
  const [complianceAck, setComplianceAck] = useState(false);
  const [expandedModId, setExpandedModId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'form'>('list');

  const filteredIdentities = identityCatalog.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    toast({ title: "Modification Submitted", description: `Change request for ${selectedIdentity?.name} has been submitted for approval.` });
    setView('list');
    setSelectedIdentity(null);
    setModificationType('');
    setProposedValue('');
    setJustification('');
    setComplianceAck(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': case 'approved': return 'bg-green-100 text-green-800';
      case 'Pending Approval': case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Under Review': return 'bg-purple-100 text-purple-800';
      case 'Scheduled': return 'bg-muted text-muted-foreground';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[50vw] sm:max-w-none flex flex-col p-0 h-full">
        <SheetHeader className="flex-shrink-0 px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Identity Modification
          </SheetTitle>
          <SheetDescription>
            Manage identity attribute changes with impact analysis and approval workflows
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 pb-6 space-y-6">
            {/* Toggle between list and form */}
            <div className="flex gap-2">
              <Button variant={view === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setView('list')}>
                Pending Modifications ({pendingIdentityModifications.length})
              </Button>
              <Button variant={view === 'form' ? 'default' : 'outline'} size="sm" onClick={() => setView('form')}>
                New Modification
              </Button>
            </div>

            {view === 'form' && (
              <div className="space-y-6">
                {/* Identity Search */}
                <div className="space-y-2">
                  <Label>Select Identity</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, ID, or email..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {searchTerm && !selectedIdentity && (
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                      {filteredIdentities.map(identity => (
                        <div
                          key={identity.id}
                          className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 flex items-center justify-between"
                          onClick={() => { setSelectedIdentity(identity); setSearchTerm(''); }}
                        >
                          <div>
                            <div className="font-medium text-sm">{identity.name}</div>
                            <div className="text-xs text-muted-foreground">{identity.id} • {identity.type} • {identity.department}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">Risk: {identity.riskScore}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedIdentity && (
                    <Card className="bg-accent/30">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{selectedIdentity.name}</div>
                            <div className="text-sm text-muted-foreground">{selectedIdentity.id} • {selectedIdentity.type} • {selectedIdentity.department}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {selectedIdentity.accountCount} accounts • {selectedIdentity.roleCount} roles • {selectedIdentity.entitlementCount} entitlements
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedIdentity(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Modification Type */}
                <div className="space-y-2">
                  <Label>Modification Type</Label>
                  <Select value={modificationType} onValueChange={setModificationType}>
                    <SelectTrigger><SelectValue placeholder="Select modification type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Department Transfer">Department Transfer</SelectItem>
                      <SelectItem value="Role Change">Role Change</SelectItem>
                      <SelectItem value="Access Extension">Access Extension</SelectItem>
                      <SelectItem value="Attribute Update">Attribute Update</SelectItem>
                      <SelectItem value="Sponsor Change">Sponsor Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Before/After */}
                {selectedIdentity && modificationType && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Before / After Comparison</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 p-2 bg-red-50 rounded text-sm">
                          <div className="text-xs text-muted-foreground">Current</div>
                          <div className="font-medium">{selectedIdentity.department}</div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <Input
                            placeholder="Proposed value..."
                            value={proposedValue}
                            onChange={(e) => setProposedValue(e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Impact Analysis */}
                {selectedIdentity && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Impact Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-2 bg-accent/30 rounded">
                          <div className="text-lg font-bold">{selectedIdentity.accountCount}</div>
                          <div className="text-xs text-muted-foreground">Accounts Affected</div>
                        </div>
                        <div className="text-center p-2 bg-accent/30 rounded">
                          <div className="text-lg font-bold">{selectedIdentity.roleCount}</div>
                          <div className="text-xs text-muted-foreground">Roles Affected</div>
                        </div>
                        <div className="text-center p-2 bg-accent/30 rounded">
                          <div className="text-lg font-bold">{selectedIdentity.entitlementCount}</div>
                          <div className="text-xs text-muted-foreground">Entitlements Affected</div>
                        </div>
                        <div className="text-center p-2 bg-accent/30 rounded">
                          <div className="text-lg font-bold">{selectedIdentity.riskScore}</div>
                          <div className="text-xs text-muted-foreground">Risk Score</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Approval Routing Preview */}
                {modificationType && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Approval Routing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {['Direct Manager', modificationType === 'Department Transfer' ? 'Receiving Manager' : 'Role Owner', 'Compliance Officer'].map((approver, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">{i + 1}</div>
                            <span>{approver}</span>
                            <Badge variant="outline" className="ml-auto text-xs">Required</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Justification */}
                <div className="space-y-2">
                  <Label>Business Justification</Label>
                  <Textarea
                    placeholder="Provide business justification for this modification..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                {/* Compliance Ack */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="compliance"
                    checked={complianceAck}
                    onCheckedChange={(checked) => setComplianceAck(checked as boolean)}
                  />
                  <Label htmlFor="compliance" className="text-sm">
                    I acknowledge this change complies with organizational policies and may trigger additional reviews
                  </Label>
                </div>

                <Button
                  className="w-full"
                  disabled={!selectedIdentity || !modificationType || !justification || !complianceAck}
                  onClick={handleSubmit}
                >
                  Submit Modification Request
                </Button>
              </div>
            )}

            {view === 'list' && (
              <div className="space-y-3">
                {pendingIdentityModifications.map((mod) => (
                  <Card key={mod.id} className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => setExpandedModId(expandedModId === mod.id ? null : mod.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{mod.identityName}</div>
                          <div className="text-xs text-muted-foreground">{mod.identityType} • {mod.modificationType}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(mod.status)} variant="secondary">{mod.status}</Badge>
                          {expandedModId === mod.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>

                      {expandedModId === mod.id && (
                        <div className="mt-4 space-y-4">
                          <Separator />
                          {/* Before/After */}
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex-1 p-2 bg-red-50 dark:bg-red-950/20 rounded">
                              <div className="text-xs text-muted-foreground">Current</div>
                              <div className="font-medium">{mod.currentValue}</div>
                            </div>
                            <ArrowRight className="h-4 w-4 flex-shrink-0" />
                            <div className="flex-1 p-2 bg-green-50 dark:bg-green-950/20 rounded">
                              <div className="text-xs text-muted-foreground">Proposed</div>
                              <div className="font-medium">{mod.proposedValue}</div>
                            </div>
                          </div>

                          {/* Impact */}
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-2 bg-accent/30 rounded">
                              <div className="font-bold">{mod.impactedAccounts}</div>
                              <div className="text-muted-foreground">Accounts</div>
                            </div>
                            <div className="p-2 bg-accent/30 rounded">
                              <div className="font-bold">{mod.impactedRoles}</div>
                              <div className="text-muted-foreground">Roles</div>
                            </div>
                            <div className="p-2 bg-accent/30 rounded">
                              <div className="font-bold">{mod.complianceFlags.length}</div>
                              <div className="text-muted-foreground">Flags</div>
                            </div>
                          </div>

                          {/* Compliance Flags */}
                          {mod.complianceFlags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {mod.complianceFlags.map((flag, i) => (
                                <Badge key={i} variant="destructive" className="text-xs">{flag}</Badge>
                              ))}
                            </div>
                          )}

                          {/* Approval Chain */}
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground">Approval Chain</div>
                            {mod.approvers.map((approver, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                {approver.status === 'approved' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : approver.status === 'rejected' ? (
                                  <X className="h-4 w-4 text-red-500" />
                                ) : (
                                  <Clock className="h-4 w-4 text-yellow-500" />
                                )}
                                <span>{approver.name}</span>
                                <Badge variant="outline" className={`ml-auto text-xs ${getStatusColor(approver.status)}`}>
                                  {approver.status}
                                </Badge>
                              </div>
                            ))}
                          </div>

                          {/* Meta */}
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1"><User className="h-3 w-3" /> Requested by {mod.requestedBy} on {mod.requestDate}</div>
                            <div className="flex items-center gap-1"><FileText className="h-3 w-3" /> {mod.justification}</div>
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
