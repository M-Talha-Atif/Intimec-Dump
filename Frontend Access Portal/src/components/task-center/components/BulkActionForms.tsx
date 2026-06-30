
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface BulkActionFormsProps {
  currentAction: string;
  reassignTo: string;
  setReassignTo: (val: string) => void;
  bulkNote: string;
  setBulkNote: (val: string) => void;
  bulkTag: string;
  setBulkTag: (val: string) => void;
}

export const BulkActionForms: React.FC<BulkActionFormsProps> = ({
  currentAction,
  reassignTo,
  setReassignTo,
  bulkNote,
  setBulkNote,
  bulkTag,
  setBulkTag
}) => {
  switch (currentAction) {
    case 'reassign':
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="reassignTo">Reassign to</Label>
            <Input
              id="reassignTo"
              placeholder="Enter username or email"
              value={reassignTo}
              onChange={(e) => setReassignTo(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="reassignNote">Reassignment Note</Label>
            <Textarea
              id="reassignNote"
              placeholder="Optional note for reassignment"
              value={bulkNote}
              onChange={(e) => setBulkNote(e.target.value)}
            />
          </div>
        </div>
      );
    case 'addNote':
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="bulkNote">Add Note</Label>
            <Textarea
              id="bulkNote"
              placeholder="Enter note to add to all selected tasks"
              value={bulkNote}
              onChange={(e) => setBulkNote(e.target.value)}
            />
          </div>
        </div>
      );
    case 'addTag':
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="bulkTag">Select Tag</Label>
            <Select value={bulkTag} onValueChange={setBulkTag}>
              <SelectTrigger id="bulkTag">
                <SelectValue placeholder="Select a tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high-risk">High Risk</SelectItem>
                <SelectItem value="audit-watch">Audit Watch</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="review-required">Review Required</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    default:
      return null;
  }
};
