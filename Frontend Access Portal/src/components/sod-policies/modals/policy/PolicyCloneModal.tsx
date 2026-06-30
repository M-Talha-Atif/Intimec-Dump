import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { SoDPolicy } from '@/types/sodPolicies';

interface PolicyCloneModalProps {
  policy: SoDPolicy | null;
  open: boolean;
  onClose: () => void;
  onClone: (clonedPolicy: Partial<SoDPolicy>) => void;
}

export const PolicyCloneModal = ({ policy, open, onClose, onClone }: PolicyCloneModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cloneType, setCloneType] = useState<'exact' | 'modify'>('exact');
  const [includeConditions, setIncludeConditions] = useState(true);
  const [includeCompliance, setIncludeCompliance] = useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    if (policy && open) {
      setName(`${policy.name} (Copy)`);
      setDescription(policy.description);
    }
  }, [policy, open]);

  const handleClone = () => {
    if (!policy || !name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a name for the cloned policy",
        variant: "destructive"
      });
      return;
    }

    const clonedPolicy: Partial<SoDPolicy> = {
      name: name.trim(),
      description: description.trim(),
      status: 'draft',
      conflictType: policy.conflictType,
      conditions: includeConditions ? [...policy.conditions] : [],
      enforcementMode: policy.enforcementMode,
      riskLevel: policy.riskLevel,
      complianceFrameworks: includeCompliance ? [...policy.complianceFrameworks] : [],
      tags: [...policy.tags],
      category: policy.category,
    };

    onClone(clonedPolicy);
    toast({
      title: "Policy Cloned",
      description: `Successfully cloned policy: ${name}`,
    });
    onClose();
  };

  if (!policy) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl flex flex-col p-0 h-[80vh]">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                Clone Policy
              </DialogTitle>
              <DialogDescription>
                Create a copy of "{policy.name}" with optional modifications.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 pt-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                {/* Original Policy Info */}
                <div className="p-4 bg-muted rounded-lg border">
                  <p className="text-sm font-medium mb-2">Original Policy</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{policy.status}</Badge>
                    <Badge>{policy.riskLevel}</Badge>
                    <span className="text-sm text-muted-foreground">{policy.violationCount} violations</span>
                  </div>
                </div>

                {/* Clone Configuration */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">New Policy Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter policy name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Enter policy description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Clone Type</Label>
                    <Select value={cloneType} onValueChange={(v) => setCloneType(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exact">Exact Copy</SelectItem>
                        <SelectItem value="modify">Copy with Modifications</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {cloneType === 'modify' && (
                    <div className="space-y-3 p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Include in Clone:</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeConditions}
                          onChange={(e) => setIncludeConditions(e.target.checked)}
                          className="rounded"
                        />
                        <Label>Policy Conditions ({policy.conditions.length})</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeCompliance}
                          onChange={(e) => setIncludeCompliance(e.target.checked)}
                          className="rounded"
                        />
                        <Label>Compliance Mappings ({policy.complianceFrameworks.length})</Label>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2 p-3 bg-muted rounded border">
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      The cloned policy will be created in draft status and require activation.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
                  <Button onClick={handleClone}>
                    <Copy className="h-4 w-4 mr-2" />
                    Clone Policy
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
