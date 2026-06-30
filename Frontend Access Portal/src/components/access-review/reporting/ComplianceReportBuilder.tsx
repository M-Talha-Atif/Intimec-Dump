import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FileText, Download, Calendar, Clock } from 'lucide-react';
import { reportingService } from '@/services/accessReviewService';
import { toast } from 'sonner';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

const generatedReports = [
  { id: "rpt-001", name: "SOX Q3 2024 Compliance Report", framework: "SOX", generatedAt: "2024-10-15", generatedBy: "Admin User", status: "completed" },
  { id: "rpt-002", name: "GDPR Annual Access Review", framework: "GDPR", generatedAt: "2024-09-30", generatedBy: "Sarah Johnson", status: "completed" },
  { id: "rpt-003", name: "ISO 27001 Privileged Access Audit", framework: "ISO27001", generatedAt: "2024-08-22", generatedBy: "Michael Chen", status: "completed" },
];

export const ComplianceReportBuilder: React.FC = () => {
  const [framework, setFramework] = useState<string>('SOX');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [format, setFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select date range');
      return;
    }
    setIsGenerating(true);
    try {
      const report = await reportingService.generateComplianceReport(framework, startDate, endDate);
      toast.success('Report generated successfully');
      const blob = await reportingService.exportReport(report.id, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${framework}-compliance-report.${format}`;
      a.click();
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Compliance Report Builder
            <InfoTooltip text="Generate audit-ready compliance reports for regulatory frameworks. Reports include campaign metrics, decision evidence, and attestation records." />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1">
                Compliance Framework
                <InfoTooltip text="Select the regulatory standard this report will target. Each framework has specific evidence requirements." />
              </Label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOX">SOX (Sarbanes-Oxley)</SelectItem>
                  <SelectItem value="GDPR">GDPR</SelectItem>
                  <SelectItem value="HIPAA">HIPAA</SelectItem>
                  <SelectItem value="ISO27001">ISO 27001</SelectItem>
                  <SelectItem value="PCI-DSS">PCI-DSS</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="flex items-center gap-1">
                Export Format
                <InfoTooltip text="PDF for auditor-ready reports, CSV for data analysis, Excel for detailed workbooks with multiple sheets." />
              </Label>
              <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="csv">CSV Data</SelectItem>
                  <SelectItem value="excel">Excel Workbook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="flex items-center gap-2"><Calendar className="h-3 w-3" /> Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label className="flex items-center gap-2"><Calendar className="h-3 w-3" /> End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <p className="text-sm font-medium">Report Contents</p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Campaign completion metrics</li>
                <li>Decision breakdown (approve/revoke)</li>
                <li>SoD violations resolved</li>
                <li>Risk reduction analysis</li>
                <li>Reviewer attestations</li>
                <li>Audit trail evidence</li>
              </ul>
            </CardContent>
          </Card>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Generated Reports
            <InfoTooltip text="Previously generated compliance reports available for download. Reports are retained for 12 months." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {generatedReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.generatedBy} • {new Date(report.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{report.framework}</Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3 mr-1" /> Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
