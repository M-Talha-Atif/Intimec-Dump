import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileText, FileSpreadsheet, FileImage, FileCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'ppt' | 'json'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeRemediation, setIncludeRemediation] = useState(false);

  const handleExport = () => {
    // Simulate export
    toast({
      title: "Export Started",
      description: `Generating ${exportFormat.toUpperCase()} report...`,
    });
    
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Risk analytics report has been downloaded.`,
      });
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Risk Analytics Report</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <Card className="cursor-pointer hover:bg-accent" onClick={() => setExportFormat('pdf')}>
                <CardContent className="flex items-center space-x-3 p-4">
                  <RadioGroupItem value="pdf" />
                  <FileText className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">PDF Report</div>
                    <div className="text-sm text-muted-foreground">Executive summary with charts and analysis</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent" onClick={() => setExportFormat('excel')}>
                <CardContent className="flex items-center space-x-3 p-4">
                  <RadioGroupItem value="excel" />
                  <FileSpreadsheet className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">Excel Spreadsheet</div>
                    <div className="text-sm text-muted-foreground">Raw data with pivot tables and formulas</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent" onClick={() => setExportFormat('ppt')}>
                <CardContent className="flex items-center space-x-3 p-4">
                  <RadioGroupItem value="ppt" />
                  <FileImage className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">PowerPoint Presentation</div>
                    <div className="text-sm text-muted-foreground">Dashboard snapshots and key findings</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent" onClick={() => setExportFormat('json')}>
                <CardContent className="flex items-center space-x-3 p-4">
                  <RadioGroupItem value="json" />
                  <FileCode className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">JSON Data</div>
                    <div className="text-sm text-muted-foreground">API-ready format for integrations</div>
                  </div>
                </CardContent>
              </Card>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Include in Report</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="charts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                />
                <label htmlFor="charts" className="text-sm cursor-pointer">
                  Charts and visualizations
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="details"
                  checked={includeDetails}
                  onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
                />
                <label htmlFor="details" className="text-sm cursor-pointer">
                  Detailed risk breakdown
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remediation"
                  checked={includeRemediation}
                  onCheckedChange={(checked) => setIncludeRemediation(checked as boolean)}
                />
                <label htmlFor="remediation" className="text-sm cursor-pointer">
                  Remediation plans and tasks
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
