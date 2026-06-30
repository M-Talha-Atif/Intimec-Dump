"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const KeyboardShortcutsHelp: React.FC = () => {
  const shortcuts = [
    { keys: ['Ctrl', 'S'], action: 'Save workflow' },
    { keys: ['Ctrl', 'Z'], action: 'Undo last change' },
    { keys: ['Ctrl', 'Y'], action: 'Redo change' },
    { keys: ['Ctrl', 'D'], action: 'Duplicate selected node' },
    { keys: ['Ctrl', 'L'], action: 'Auto-layout nodes' },
    { keys: ['Ctrl', 'E'], action: 'Export workflow' },
    { keys: ['Delete'], action: 'Delete selected node' },
    { keys: ['Escape'], action: 'Deselect node / Close panel' },
    { keys: ['Double-click'], action: 'Edit node label inline' },
    { keys: ['Click badge'], action: 'Cycle risk level' },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {shortcuts.map((shortcut, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{shortcut.action}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, keyIdx) => (
                  <React.Fragment key={keyIdx}>
                    <Badge variant="outline" className="font-mono text-xs">
                      {key}
                    </Badge>
                    {keyIdx < shortcut.keys.length - 1 && (
                      <span className="text-muted-foreground">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
