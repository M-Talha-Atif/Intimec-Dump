import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FileWarning, Clock, Trash2 } from "lucide-react";

interface DraftMetadata {
  timestamp: number;
  nodes: any[];
  edges: any[];
  workflowName?: string;
}

interface DraftConflictDialogProps {
  open: boolean;
  draftMetadata: DraftMetadata | null;
  onContinue: () => void;
  onDiscard: () => void;
}

export function DraftConflictDialog({ 
  open, 
  draftMetadata, 
  onContinue, 
  onDiscard 
}: DraftConflictDialogProps) {
  if (!draftMetadata) return null;

  const nodeCount = draftMetadata.nodes.length - 2; // Exclude start/end
  const edgeCount = draftMetadata.edges.length;
  const draftAge = Date.now() - draftMetadata.timestamp;
  const ageInMinutes = Math.floor(draftAge / 60000);
  const ageInHours = Math.floor(draftAge / 3600000);
  const ageDisplay = ageInHours > 0 
    ? `${ageInHours} hour${ageInHours > 1 ? 's' : ''} ago`
    : ageInMinutes > 0 
    ? `${ageInMinutes} minute${ageInMinutes > 1 ? 's' : ''} ago`
    : 'just now';

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <FileWarning className="h-6 w-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-left">
                Unsaved Workflow Draft Found
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left mt-2">
                You have an unfinished workflow draft that was last modified{' '}
                <span className="font-medium text-gray-900">{ageDisplay}</span>.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="bg-gray-50 rounded-md p-4 my-2">
          <div className="space-y-2 text-sm">
            {draftMetadata.workflowName && (
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{draftMetadata.workflowName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Nodes:</span>
              <span className="font-medium text-gray-900">{nodeCount} step{nodeCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Connections:</span>
              <span className="font-medium text-gray-900">{edgeCount}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-gray-200">
              <span className="text-gray-600 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last modified:
              </span>
              <span className="text-xs text-gray-600">{ageDisplay}</span>
            </div>
          </div>
        </div>

        <AlertDialogDescription className="text-left text-gray-600">
          Would you like to continue editing this draft or start fresh?
        </AlertDialogDescription>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onDiscard}
            className="sm:flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Discard Draft
          </Button>
          <Button
            onClick={onContinue}
            className="sm:flex-1"
          >
            Continue Editing
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
