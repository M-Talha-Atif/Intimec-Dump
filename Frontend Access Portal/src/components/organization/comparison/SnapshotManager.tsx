import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Trash2 } from "lucide-react";
import { saveSnapshot, deleteSnapshot } from '@/utils/snapshotManager';
import { useToast } from '@/hooks/use-toast';
import { OrgNodeData } from '@/types/organization';
import { HistoricalSnapshot } from '@/data/mock-historical-snapshots';

interface SnapshotManagerProps {
  currentData: OrgNodeData;
  snapshots: HistoricalSnapshot[];
  onSnapshotCreated: () => void;
}

export function SnapshotManager({ currentData, snapshots, onSnapshotCreated }: SnapshotManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const handleCreateSnapshot = () => {
    if (!label.trim()) {
      toast({
        title: "Label required",
        description: "Please provide a label for the snapshot.",
        variant: "destructive",
      });
      return;
    }

    saveSnapshot(currentData, label, description);
    toast({
      title: "Snapshot created",
      description: `"${label}" has been saved successfully.`,
    });
    
    setLabel('');
    setDescription('');
    setShowCreateDialog(false);
    onSnapshotCreated();
  };

  const handleDeleteSnapshot = (id: string, snapshotLabel: string) => {
    deleteSnapshot(id);
    toast({
      title: "Snapshot deleted",
      description: `"${snapshotLabel}" has been removed.`,
    });
    onSnapshotCreated();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Snapshots</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage point-in-time organizational snapshots
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="sm">
          <Camera className="w-4 h-4 mr-2" />
          Create Snapshot
        </Button>
      </div>

      <div className="grid gap-3">
        {snapshots.map((snapshot) => (
          <div
            key={snapshot.id}
            className="flex items-center justify-between p-3 border rounded-lg bg-card"
          >
            <div>
              <div className="font-medium">{snapshot.label}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(snapshot.date).toLocaleDateString()} - {snapshot.description}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteSnapshot(snapshot.id, snapshot.label)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Snapshot</DialogTitle>
            <DialogDescription>
              Capture the current state of the organization for future comparison
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="label" className="mb-2">Label *</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Q4 2024 Snapshot"
              />
            </div>

            <div>
              <Label htmlFor="description" className="mb-2">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSnapshot}>Create Snapshot</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
