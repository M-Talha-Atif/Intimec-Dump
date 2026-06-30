
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Move, AlertTriangle, Folder } from 'lucide-react';
import { TreeNode } from '@/types/hierarchical-delegation';

interface MoveNodeFormData {
  targetParentId: string;
}

interface MoveNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: TreeNode | null;
  allNodes: TreeNode[];
  onMoveNode: (nodeId: string, newParentId: string) => void;
}

const MoveNodeDialog: React.FC<MoveNodeDialogProps> = ({
  open,
  onOpenChange,
  node,
  allNodes,
  onMoveNode
}) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<MoveNodeFormData>({
    defaultValues: {
      targetParentId: ''
    }
  });

  const selectedParentId = watch('targetParentId');

  if (!node) return null;

  // Get all available parent nodes (flatten the tree)
  const flattenNodes = (nodes: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = [];
    nodes.forEach(n => {
      result.push(n);
      result.push(...flattenNodes(n.children));
    });
    return result;
  };

  const availableParents = flattenNodes(allNodes);

  // Check for potential cycles
  const wouldCreateCycle = (targetParentId: string): boolean => {
    if (!targetParentId || targetParentId === 'root') return false;
    
    const checkCycle = (parentId: string): boolean => {
      if (parentId === node.id) return true;
      
      const parent = availableParents.find(p => p.id === parentId);
      if (parent && parent.parentId) {
        return checkCycle(parent.parentId);
      }
      return false;
    };
    
    return checkCycle(targetParentId);
  };

  const onSubmit = async (data: MoveNodeFormData) => {
    if (wouldCreateCycle(data.targetParentId)) {
      return;
    }
    
    try {
      await onMoveNode(node.id, data.targetParentId);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to move node:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  const hasWarning = selectedParentId && wouldCreateCycle(selectedParentId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            Move Node
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Folder className="h-4 w-4" />
              <span className="font-medium">Moving:</span>
              <span>{node.name}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>New Parent Location *</Label>
              <Controller
                name="targetParentId"
                control={control}
                rules={{ required: 'Please select a parent location' }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new parent location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4" />
                          Root (Top Level)
                        </div>
                      </SelectItem>
                      {availableParents
                        .filter(parent => parent.id !== node.id) // Don't show self
                        .map((parent) => (
                          <SelectItem key={parent.id} value={parent.id}>
                            <div className="flex items-center gap-2">
                              <Folder className="h-4 w-4" />
                              <span>{parent.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({parent.type})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.targetParentId && (
                <p className="text-sm text-destructive">{errors.targetParentId.message}</p>
              )}
            </div>

            {hasWarning && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This move would create a circular dependency. Please select a different parent.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || hasWarning}
                className="flex-1"
              >
                {isSubmitting ? 'Moving...' : 'Move Node'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoveNodeDialog;
