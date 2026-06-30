import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { OrgNodeData } from '@/types/organization';
import { bulkUpdateNodes } from '@/utils/orgOperations';

interface BulkOperationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNodeIds: string[];
  tree: OrgNodeData;
  onUpdate: (updatedTree: OrgNodeData) => void;
}

export function BulkOperationsDialog({
  open,
  onOpenChange,
  selectedNodeIds,
  tree,
  onUpdate,
}: BulkOperationsDialogProps) {
  const { toast } = useToast();
  const [operation, setOperation] = useState<'update-risk' | 'add-tags' | 'update-compliance' | 'assign-delegate'>(
    'update-risk'
  );
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [complianceStatus, setComplianceStatus] = useState<'compliant' | 'warning' | 'non-compliant'>('compliant');
  const [tags, setTags] = useState('');
  const [applyToChildren, setApplyToChildren] = useState(false);

  const handleApply = () => {
    let updates: Partial<OrgNodeData> = {};

    switch (operation) {
      case 'update-risk':
        updates = { riskLevel };
        break;
      case 'update-compliance':
        updates = { complianceStatus };
        break;
      case 'add-tags':
        updates = { tags: tags.split(',').map(t => t.trim()).filter(Boolean) };
        break;
      case 'assign-delegate':
        // Simplified - would need actual user selection
        updates = {
          delegates: [
            {
              userId: 'user-1',
              name: 'Delegate User',
              role: 'reviewer',
              assignedDate: new Date().toISOString(),
            },
          ],
        };
        break;
    }

    const updatedTree = bulkUpdateNodes(tree, selectedNodeIds, updates);
    onUpdate(updatedTree);

    toast({
      title: 'Bulk operation completed',
      description: `Updated ${selectedNodeIds.length} organizational units`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Operations</DialogTitle>
          <DialogDescription>
            Apply changes to {selectedNodeIds.length} selected organizational unit{selectedNodeIds.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Units */}
          <div>
            <Label className="mb-2 block">Selected Units</Label>
            <div className="flex flex-wrap gap-2">
              {selectedNodeIds.map((id) => (
                <Badge key={id} variant="secondary">
                  {id}
                </Badge>
              ))}
            </div>
          </div>

          {/* Operation Type */}
          <div className="space-y-3">
            <Label>Operation Type</Label>
            <Select value={operation} onValueChange={(v: any) => setOperation(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="update-risk">Update Risk Level</SelectItem>
                <SelectItem value="update-compliance">Update Compliance Status</SelectItem>
                <SelectItem value="add-tags">Add Tags</SelectItem>
                <SelectItem value="assign-delegate">Assign Delegate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Operation-specific Fields */}
          {operation === 'update-risk' && (
            <div className="space-y-3">
              <Label>New Risk Level</Label>
              <Select value={riskLevel} onValueChange={(v: any) => setRiskLevel(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {operation === 'update-compliance' && (
            <div className="space-y-3">
              <Label>New Compliance Status</Label>
              <Select value={complianceStatus} onValueChange={(v: any) => setComplianceStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliant">Compliant</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {operation === 'add-tags' && (
            <div className="space-y-3">
              <Label>Tags (comma-separated)</Label>
              <Input
                placeholder="SOX, Financial, Critical"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          )}

          {/* Apply to Children */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="apply-children"
              checked={applyToChildren}
              onCheckedChange={(checked) => setApplyToChildren(checked as boolean)}
            />
            <Label htmlFor="apply-children" className="font-normal cursor-pointer">
              Also apply to all child units
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>Apply Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
