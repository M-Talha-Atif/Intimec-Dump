import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Keyboard } from 'lucide-react';

export const KeyboardShortcutOverlay: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const shortcuts = [
    { keys: ['Ctrl', 'K'], action: 'Open command palette' },
    { keys: ['Ctrl', 'A'], action: 'Approve current item' },
    { keys: ['Ctrl', 'R'], action: 'Revoke current item' },
    { keys: ['Ctrl', 'N'], action: 'Next review item' },
    { keys: ['Ctrl', 'P'], action: 'Previous review item' },
    { keys: ['Ctrl', 'F'], action: 'Focus search' },
    { keys: ['Ctrl', '/'], action: 'Show shortcuts' },
    { keys: ['Ctrl', 'Enter'], action: 'Submit with justification' },
    { keys: ['Esc'], action: 'Close modals' }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex flex-col p-0 h-full">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Keyboard Shortcuts
              </DialogTitle>
              <DialogDescription>
                Use these keyboard shortcuts to navigate and take actions quickly.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="grid grid-cols-2 gap-3">
                {shortcuts.map((shortcut, index) => (
                  <Card key={index}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <span className="text-sm">{shortcut.action}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, i) => (
                          <Badge key={i} variant="secondary" className="font-mono">
                            {key}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
