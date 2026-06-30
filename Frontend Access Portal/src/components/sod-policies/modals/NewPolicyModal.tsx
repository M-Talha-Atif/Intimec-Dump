
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PolicyFormData {
  name: string;
  description: string;
  conflictType: string;
  riskLevel: string;
  complianceFramework: string[];
  enforcementMode: string;
  autoResolution: boolean;
  conditions: Array<{ type: string; operator: string; value: string; negation: boolean; }>;
}

interface NewPolicyModalProps {
  onPolicyCreate?: (policy: any) => void;
}

export const NewPolicyModal = ({ onPolicyCreate }: NewPolicyModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PolicyFormData>({
    name: '', description: '', conflictType: '', riskLevel: '', complianceFramework: [], enforcementMode: '', autoResolution: false,
    conditions: [{ type: 'role', operator: 'AND', value: '', negation: false }]
  });
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.conflictType) {
      toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    const newPolicy = { id: `POL-${Date.now()}`, ...formData, status: 'Draft', violations: 0, createdDate: new Date().toISOString().split('T')[0], lastModified: new Date().toISOString().split('T')[0] };
    if (onPolicyCreate) onPolicyCreate(newPolicy);
    toast({ title: "Policy Created", description: `"${formData.name}" has been created successfully` });
    setOpen(false);
    setFormData({ name: '', description: '', conflictType: '', riskLevel: '', complianceFramework: [], enforcementMode: '', autoResolution: false, conditions: [{ type: 'role', operator: 'AND', value: '', negation: false }] });
  };

  const addCondition = () => setFormData(prev => ({ ...prev, conditions: [...prev.conditions, { type: 'role', operator: 'AND', value: '', negation: false }] }));
  const removeCondition = (index: number) => setFormData(prev => ({ ...prev, conditions: prev.conditions.filter((_, i) => i !== index) }));
  const updateCondition = (index: number, field: string, value: any) => setFormData(prev => ({ ...prev, conditions: prev.conditions.map((c, i) => i === index ? { ...c, [field]: value } : c) }));
  const addFramework = (fw: string) => { if (!formData.complianceFramework.includes(fw)) setFormData(prev => ({ ...prev, complianceFramework: [...prev.complianceFramework, fw] })); };
  const removeFramework = (fw: string) => setFormData(prev => ({ ...prev, complianceFramework: prev.complianceFramework.filter(f => f !== fw) }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-2" />Create Policy</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col p-0 h-full">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle>Create New SoD Policy</DialogTitle>
              <DialogDescription>Define a new Segregation of Duties policy with conflict conditions and enforcement rules.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="policyName">Policy Name *</Label>
                    <Input id="policyName" placeholder="e.g., SOX Financial Controls" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conflictType">Conflict Type *</Label>
                    <Select value={formData.conflictType} onValueChange={(value) => setFormData(prev => ({ ...prev, conflictType: value }))}>
                      <SelectTrigger id="conflictType"><SelectValue placeholder="Select conflict type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="role-role">Role ↔ Role</SelectItem>
                        <SelectItem value="entitlement-entitlement">Entitlement ↔ Entitlement</SelectItem>
                        <SelectItem value="app-role">Application ↔ Role</SelectItem>
                        <SelectItem value="role-entitlement">Role ↔ Entitlement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" placeholder="Describe the purpose and scope of this SoD policy..." value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Risk Level</Label>
                    <Select value={formData.riskLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, riskLevel: value }))}>
                      <SelectTrigger><SelectValue placeholder="Select risk level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Enforcement Mode</Label>
                    <Select value={formData.enforcementMode} onValueChange={(value) => setFormData(prev => ({ ...prev, enforcementMode: value }))}>
                      <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preventive">Preventive</SelectItem><SelectItem value="detective">Detective</SelectItem><SelectItem value="advisory">Advisory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Compliance Frameworks</Label>
                  <div className="flex gap-2 mb-2">
                    {['SOX', 'GDPR', 'ISO27001'].map(fw => (<Button key={fw} type="button" variant="outline" size="sm" onClick={() => addFramework(fw)}>Add {fw}</Button>))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.complianceFramework.map((fw) => (<Badge key={fw} variant="secondary" className="flex items-center gap-1">{fw}<X className="h-3 w-3 cursor-pointer" onClick={() => removeFramework(fw)} /></Badge>))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Policy Conditions</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addCondition}><Plus className="h-4 w-4 mr-2" />Add Condition</Button>
                  </div>
                  {formData.conditions.map((condition, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-muted/50">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        {index > 0 && (
                          <div className="space-y-2">
                            <Label>Operator</Label>
                            <Select value={condition.operator} onValueChange={(value) => updateCondition(index, 'operator', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="AND">AND</SelectItem><SelectItem value="OR">OR</SelectItem></SelectContent></Select>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select value={condition.type} onValueChange={(value) => updateCondition(index, 'type', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="role">Role</SelectItem><SelectItem value="entitlement">Entitlement</SelectItem><SelectItem value="group">Group</SelectItem><SelectItem value="application">Application</SelectItem><SelectItem value="department">Department</SelectItem></SelectContent></Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Value</Label>
                          <Select value={condition.value} onValueChange={(value) => updateCondition(index, 'value', value)}><SelectTrigger><SelectValue placeholder="Select value" /></SelectTrigger><SelectContent><SelectItem value="finance-manager">Finance Manager</SelectItem><SelectItem value="it-admin">IT Administrator</SelectItem><SelectItem value="hr-partner">HR Business Partner</SelectItem><SelectItem value="sales-director">Sales Director</SelectItem><SelectItem value="audit-manager">Audit Manager</SelectItem></SelectContent></Select>
                        </div>
                        <div className="flex items-center space-x-2"><Switch checked={condition.negation} onCheckedChange={(value) => updateCondition(index, 'negation', value)} /><Label>NOT</Label></div>
                        <Button type="button" variant="outline" size="sm" onClick={() => removeCondition(index)} disabled={formData.conditions.length === 1}><X className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch checked={formData.autoResolution} onCheckedChange={(value) => setFormData(prev => ({ ...prev, autoResolution: value }))} />
                  <Label>Enable automatic conflict resolution</Label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit}><Save className="h-4 w-4 mr-2" />Create Policy</Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
