import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tag as TagIcon } from 'lucide-react';
import { availableTags } from '../data/taskActionData';

interface AddTagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskName: string;
  existingTags?: string[];
}

export const AddTagModal: React.FC<AddTagModalProps> = ({
  open,
  onOpenChange,
  taskName,
  existingTags = []
}) => {
  const { toast } = useToast();
  const [selectedTags, setSelectedTags] = useState<string[]>(existingTags);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    toast({
      title: "Tags Updated",
      description: "Task tags have been updated successfully"
    });
    onOpenChange(false);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag]);
      setNewTag('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-purple-500" />
            Manage Tags
          </DialogTitle>
          <DialogDescription>
            Add or remove tags for &quot;{taskName}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Available Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="custom-tag">Add Custom Tag</Label>
            <div className="flex gap-2">
              <Input
                id="custom-tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter custom tag..."
                onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
              />
              <Button onClick={addCustomTag} disabled={!newTag}>
                Add
              </Button>
            </div>
          </div>

          {selectedTags.length > 0 && (
            <div>
              <Label>Selected Tags ({selectedTags.length})</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="default">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddTag}>
            Save Tags
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
