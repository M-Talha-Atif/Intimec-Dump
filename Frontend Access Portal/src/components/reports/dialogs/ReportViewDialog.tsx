import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReportViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportData?: any;
  report?: any;
  onEdit?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export const ReportViewDialog = ({ open, onOpenChange, reportData, report }: ReportViewDialogProps) => {
  const data = reportData || report;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Report Results</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge>{data?.metadata?.totalRows || data?.data?.length || 0} rows</Badge>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {data?.data?.[0] && Object.keys(data.data[0]).map((key) => (
                    <th key={key} className="p-2 text-left font-semibold">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((row: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    {Object.values(row).map((value: any, i) => (
                      <td key={i} className="p-2">{String(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
