import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitCompare, Check, X } from 'lucide-react';

interface ReportComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReportComparisonModal = ({ open, onOpenChange }: ReportComparisonModalProps) => {
  const [report1, setReport1] = useState('');
  const [report2, setReport2] = useState('');

  const reports = ['SOX Compliance', 'GDPR Report', 'Access Review', 'Audit Log'];
  
  const differences = [
    { field: 'Data Source', report1: 'access_reviews', report2: 'identities', different: true },
    { field: 'Field Count', report1: '8', report2: '12', different: true },
    { field: 'Filter Count', report1: '2', report2: '2', different: false },
    { field: 'Schedule', report1: 'Daily', report2: 'Weekly', different: true },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <GitCompare className="h-5 w-5" />
            <span>Compare Reports</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select value={report1} onValueChange={setReport1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first report" />
                </SelectTrigger>
                <SelectContent>
                  {reports.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={report2} onValueChange={setReport2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second report" />
                </SelectTrigger>
                <SelectContent>
                  {reports.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {report1 && report2 && (
            <ScrollArea className="h-[400px]">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Property</th>
                    <th className="p-2 text-left">{report1}</th>
                    <th className="p-2 text-left">{report2}</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {differences.map((diff, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2 font-medium">{diff.field}</td>
                      <td className="p-2">{diff.report1}</td>
                      <td className="p-2">{diff.report2}</td>
                      <td className="p-2 text-center">
                        {diff.different ? (
                          <Badge variant="secondary"><X className="h-3 w-3 mr-1" />Different</Badge>
                        ) : (
                          <Badge variant="outline"><Check className="h-3 w-3 mr-1" />Same</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
