import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Download, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ReportExecutionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleId: string;
}

export const ReportExecutionHistoryModal = ({ open, onOpenChange, scheduleId }: ReportExecutionHistoryModalProps) => {
  const executions = [
    { id: '1', status: 'completed', startedAt: '2024-01-15 08:00', duration: '2.3s', rows: 1247, deliveryStatus: 'sent' },
    { id: '2', status: 'completed', startedAt: '2024-01-14 08:00', duration: '2.1s', rows: 1198, deliveryStatus: 'sent' },
    { id: '3', status: 'failed', startedAt: '2024-01-13 08:00', duration: '0.5s', rows: 0, deliveryStatus: 'failed', error: 'Connection timeout' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Execution History</span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {executions.map((execution) => (
              <div key={execution.id} className="p-4 border rounded-lg hover:bg-muted">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(execution.status)}
                      <Badge variant={execution.status === 'completed' ? 'default' : 'destructive'}>
                        {execution.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{execution.startedAt}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">{execution.duration}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rows Processed</p>
                        <p className="font-medium">{execution.rows.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Delivery</p>
                        <p className="font-medium capitalize">{execution.deliveryStatus}</p>
                      </div>
                    </div>
                    {execution.error && (
                      <p className="text-sm text-destructive mt-2">Error: {execution.error}</p>
                    )}
                  </div>
                  {execution.status === 'completed' && (
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
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
