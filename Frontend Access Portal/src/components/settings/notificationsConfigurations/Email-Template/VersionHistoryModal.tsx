import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TemplateVersion } from '@/types/emailTemplateTypes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatTimestampToLocal } from '@/utils/timestamp-utils';
import { ArchiveRestore, Code } from 'lucide-react';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versionHistory: TemplateVersion[];
  onRestore: (versionNumber: string) => void;
  onReview: (templateId: string, versionNumber: string) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  versionHistory,
  onRestore,
  onReview
}) => {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full w-[95vw] min-w-[650px]">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>

        <ScrollArea className='h-200'>
          <div className="space-y-3 p-1">
            {versionHistory.map((version) => (
              <Card key={version.id}>
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Version {version.version}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatTimestampToLocal(version.date)} by {version.user}
                      </div>
                      <div className="text-sm mt-1">{version.changes}</div>
                    </div>
                    <div className="flex flex-row justify-center items-end space-x-2 ">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onReview(version.templateId, version.version)}
                        className='bg-primary text-navbar-text'
                      >
                        <Code className="h-4 w-4 mr-1 " />
                        Review
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onRestore(version.version)}
                        className='bg-primary text-navbar-text'
                      >
                        <ArchiveRestore className="h-4 w-4 mr-1 " />
                        Restore
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};