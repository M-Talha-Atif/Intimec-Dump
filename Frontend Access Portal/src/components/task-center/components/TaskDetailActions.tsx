
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tag, StickyNote } from 'lucide-react';
import { Task } from '../types';
import { formatTimestamp } from '../utils/taskHelpers';

interface TaskDetailActionsProps {
  task: Task;
  newNote: string;
  setNewNote: (val: string) => void;
  newTag: string;
  setNewTag: (val: string) => void;
  onAddNote: () => void;
  onAddTag: () => void;
}

export const TaskDetailActions: React.FC<TaskDetailActionsProps> = ({
  task,
  newNote,
  setNewNote,
  newTag,
  setNewTag,
  onAddNote,
  onAddTag
}) => {
  return (
    <div className="space-y-4">
      {/* Add Note */}
      <div className="space-y-2">
        <Label htmlFor="newNote">Add Note</Label>
        <Textarea
          id="newNote"
          placeholder="Enter internal note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <Button 
          size="sm" 
          onClick={onAddNote}
          disabled={!newNote.trim()}
        >
          <StickyNote className="h-4 w-4 mr-1" />
          Add Note
        </Button>
      </div>

      {/* Add Tag */}
      <div className="space-y-2">
        <Label htmlFor="newTag">Add Tag</Label>
        <Input
          id="newTag"
          placeholder="Enter tag name..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
        />
        <Button 
          size="sm" 
          onClick={onAddTag}
          disabled={!newTag.trim()}
        >
          <Tag className="h-4 w-4 mr-1" />
          Add Tag
        </Button>
      </div>

      {/* Existing Notes */}
      {task.notes && task.notes.length > 0 && (
        <div className="space-y-2">
          <Label>Existing Notes</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {task.notes.map((note) => (
              <div key={note.id} className="p-2 bg-gray-50 rounded text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-xs text-gray-600">{note.author}</span>
                  <span className="text-xs text-gray-500">{formatTimestamp(note.timestamp)}</span>
                </div>
                <p>{note.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="space-y-2">
          <Label>Current Tags</Label>
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
