import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, RotateCcw, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Version {
  id: string;
  version: number;
  modifiedBy: string;
  modifiedAt: string;
  changes: string;
}

interface ReportVersionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
}

export const ReportVersionHistoryModal = ({ open, onOpenChange, reportId }: ReportVersionHistoryModalProps) => {
  const { toast } = useToast();
  
  const versions: Version[] = [
    { id: '3', version: 3, modifiedBy: 'John Doe', modifiedAt: '2024-01-15 10:30', changes: 'Added new filter conditions' },
    { id: '2', version: 2, modifiedBy: 'Jane Smith', modifiedAt: '2024-01-10 14:20', changes: 'Updated field selection' },
    { id: '1', version: 1, modifiedBy: 'John Doe', modifiedAt: '2024-01-05 09:00', changes: 'Initial version' },
  ];

  const handleRestore = (version: Version) => {
    toast({
      title: "Version Restored",
      description: `Report restored to version ${version.version}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Version History</span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {versions.map((version, idx) => (
              <div key={version.id} className="p-4 border rounded-lg hover:bg-muted">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={idx === 0 ? "default" : "secondary"}>
                        Version {version.version}
                      </Badge>
                      {idx === 0 && <Badge variant="outline">Current</Badge>}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                      <User className="h-3 w-3" />
                      <span>{version.modifiedBy}</span>
                      <span>•</span>
                      <span>{version.modifiedAt}</span>
                    </div>
                    <p className="text-sm">{version.changes}</p>
                  </div>
                  {idx !== 0 && (
                    <Button size="sm" variant="outline" onClick={() => handleRestore(version)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
