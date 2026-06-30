
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download } from 'lucide-react';

interface ReportDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportName: string;
  onDownload: (format: string, options: any) => void;
}

export const ReportDownloadDialog = ({ 
  open, 
  onOpenChange, 
  reportName, 
  onDownload 
}: ReportDownloadDialogProps) => {
  const [format, setFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);

  const handleDownload = () => {
    onDownload(format, { includeCharts, includeSummary });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Download Report</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="format">Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                <SelectItem value="xlsx">Excel Workbook</SelectItem>
                <SelectItem value="json">JSON Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="charts" 
                checked={includeCharts} 
                onCheckedChange={(checked) => setIncludeCharts(checked === true)}
              />
              <Label htmlFor="charts" className="text-sm">Include charts and visualizations</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="summary" 
                checked={includeSummary} 
                onCheckedChange={(checked) => setIncludeSummary(checked === true)}
              />
              <Label htmlFor="summary" className="text-sm">Include executive summary</Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download {reportName}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
