import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Download, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ViolationReportExportModalProps {
  open: boolean;
  onClose: () => void;
  selectedViolations?: string[];
}

export const ViolationReportExportModal = ({ open, onClose, selectedViolations = [] }: ViolationReportExportModalProps) => {
  const [reportType, setReportType] = useState<'executive' | 'detailed' | 'compliance'>('detailed');
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [includeRemediation, setIncludeRemediation] = useState(true);
  const [groupBy, setGroupBy] = useState<'policy' | 'user' | 'system'>('policy');
  const [emailRecipients, setEmailRecipients] = useState('');
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Report Generation Started",
      description: `Generating ${reportType} report for ${selectedViolations.length || 'all'} violations`,
    });
    setTimeout(() => {
      toast({ title: "Report Ready", description: emailRecipients ? "Report has been emailed" : "Your report is ready for download" });
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl flex flex-col p-0 h-[85vh]">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Export Violation Report
              </DialogTitle>
              <DialogDescription>
                Generate a comprehensive violation report with analytics and trends.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={(v) => setReportType(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="executive">Executive Summary</SelectItem>
                      <SelectItem value="detailed">Detailed Analysis</SelectItem>
                      <SelectItem value="compliance">Compliance Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select value={format} onValueChange={(v) => setFormat(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Report</SelectItem>
                        <SelectItem value="excel">Excel Workbook</SelectItem>
                        <SelectItem value="csv">CSV Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Group By</Label>
                    <Select value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="policy">Policy</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Include in Report:</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox id="charts" checked={includeCharts} onCheckedChange={(c) => setIncludeCharts(c as boolean)} />
                      <Label htmlFor="charts" className="font-normal cursor-pointer">Charts & Visualizations</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="timeline" checked={includeTimeline} onCheckedChange={(c) => setIncludeTimeline(c as boolean)} />
                      <Label htmlFor="timeline" className="font-normal cursor-pointer">Timeline & History</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="remediation" checked={includeRemediation} onCheckedChange={(c) => setIncludeRemediation(c as boolean)} />
                      <Label htmlFor="remediation" className="font-normal cursor-pointer">Remediation Actions & Status</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Recipients (Optional)</Label>
                  <Input placeholder="email1@company.com, email2@company.com" value={emailRecipients}
                    onChange={(e) => setEmailRecipients(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Leave empty to download directly</p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Export Summary</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Violations: {selectedViolations.length || 'All'}</p>
                    <p>Report Type: {reportType.charAt(0).toUpperCase() + reportType.slice(1)}</p>
                    <p>Format: {format.toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
                  <Button onClick={handleExport} className="shrink-0 mr-4 mb-4">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
