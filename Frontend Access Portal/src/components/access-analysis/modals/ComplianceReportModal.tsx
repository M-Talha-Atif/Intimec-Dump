import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Download, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { generateComplianceReport } from '@/services/governanceService';

interface ComplianceReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ComplianceReportModal = ({ open, onOpenChange }: ComplianceReportModalProps) => {
  const [reportType, setReportType] = useState<'SOX' | 'GDPR' | 'HIPAA' | 'Custom'>('SOX');
  const [includeSections, setIncludeSections] = useState<string[]>(['executive', 'findings', 'recommendations']);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    const report = generateComplianceReport(reportType);
    
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setGenerating(false);
    toast.success(`${reportType} compliance report generated successfully`);
    onOpenChange(false);
  };

  const sections = [
    { id: 'executive', label: 'Executive Summary' },
    { id: 'findings', label: 'Key Findings' },
    { id: 'recommendations', label: 'Recommendations' },
    { id: 'violations', label: 'Violation Details' },
    { id: 'trends', label: 'Trend Analysis' },
    { id: 'audit', label: 'Audit Trail' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Compliance Report
          </DialogTitle>
          <DialogDescription>
            Create comprehensive compliance reports for auditing and regulatory requirements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={(v: any) => setReportType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOX">SOX Compliance</SelectItem>
                <SelectItem value="GDPR">GDPR Compliance</SelectItem>
                <SelectItem value="HIPAA">HIPAA Compliance</SelectItem>
                <SelectItem value="Custom">Custom Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Include Sections</Label>
            <div className="grid grid-cols-2 gap-3">
              {sections.map(section => (
                <div key={section.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={section.id}
                    checked={includeSections.includes(section.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setIncludeSections([...includeSections, section.id]);
                      } else {
                        setIncludeSections(includeSections.filter(s => s !== section.id));
                      }
                    }}
                  />
                  <label htmlFor={section.id} className="text-sm cursor-pointer">{section.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Time Period</Label>
            <Select defaultValue="30d">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="365d">Last year</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Export Format</Label>
            <Select defaultValue="pdf">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                <SelectItem value="word">Word Document</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => toast.info('Report scheduled for weekly generation')}>
            <Mail className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button onClick={handleGenerate} disabled={generating}>
            <Download className="h-4 w-4 mr-2" />
            {generating ? 'Generating...' : 'Generate Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
