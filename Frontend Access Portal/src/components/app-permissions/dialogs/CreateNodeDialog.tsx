
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FolderPlus } from 'lucide-react';

interface CreateNodeFormData {
  name: string;
  type: 'organizational' | 'geographical' | 'application' | 'identity';
  description: string;
}

interface CreateNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: string;
  parentName: string;
  onCreateNode: (data: CreateNodeFormData & { parentId: string }) => void;
}

const CreateNodeDialog: React.FC<CreateNodeDialogProps> = ({
  open,
  onOpenChange,
  parentId,
  onCreateNode
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CreateNodeFormData>({
    defaultValues: {
      name: '',
      type: 'organizational',
      description: ''
    }
  });

  const selectedType = watch('type');

  const onSubmit = async (data: CreateNodeFormData) => {
    try {
      await onCreateNode({ ...data, parentId });
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create node:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Create New Node
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="Enter node name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={selectedType} onValueChange={(value: 'organizational' | 'geographical' | 'application' | 'identity') => setValue('type', value)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select node type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="organizational">🏢 Organizational</SelectItem>
                <SelectItem value="geographical">🌍 Geographical</SelectItem>
                <SelectItem value="application">💻 Application</SelectItem>
                <SelectItem value="identity">👥 Identity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Optional description"
              rows={3}
            />
          </div>

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
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNodeDialog;
