"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  PinnedLogItem,
  useDebugging,
  type LogItem,
} from "@/contexts/debugging-context";
import { Badge } from "../ui/badge";

interface EditIssueModalProps {
  item: PinnedLogItem;
  isOpen: boolean;
  onClose: () => void;
}

const getEventBadgeVariant = (level: string) => {
  switch (level) {
    case "ERROR":
      return "destructive";
    case "DEBUG":
      return "secondary";
    default:
      return "default";
  }
};

export function EditIssueModal({ item, isOpen, onClose }: EditIssueModalProps) {
  const [newDescription, setNewDescription] = useState(item.description);
  const { handleResolvePinnedItem, handleUpdatePinnedItem, loading, error } =
    useDebugging();
  // console.log("EditIssueModal item:", item);

  const itemData = item?.data?.details || item.data;

  const handleSave = async () => {
    const succes = await handleUpdatePinnedItem(
      item.documentId,
      newDescription
    );
    if (succes) {
      onClose();
      return;
    } else {
      console.error("Error updating description");
    }
  };

  const handleResolve = async () => {
    await handleResolvePinnedItem(item.documentId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full mx-4 max-h-[90vh]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="sr-only">Edit Issue Details</DialogTitle>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={getEventBadgeVariant(itemData.level)}>
                {itemData.level}
              </Badge>
              <Badge
                variant="outline"
                className="whitespace-normal break-words max-w-md"
              >
                {itemData.source || itemData.microservice}
              </Badge>
            </div>
            {itemData.id && (
              <div>
                <Badge variant="outline" className="text-xs">
                  ID: {itemData.id}
                </Badge>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-900 block mb-2">
              Description
            </label>
            <Textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="min-h-[150px] resize-none text-sm"
              placeholder="Enter description..."
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="px-6 bg-teal-600 hover:bg-teal-700"
          >
            {loading ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={handleResolve}
            disabled={loading}
            className="px-6 bg-teal-600 hover:bg-teal-700"
          >
            {loading ? "Resolving..." : "Resolve"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
