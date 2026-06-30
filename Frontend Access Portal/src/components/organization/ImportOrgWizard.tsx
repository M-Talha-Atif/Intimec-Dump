import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Download, Upload, FileText, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle,
  XCircle, Table, Eye, Play, MapPin,
} from 'lucide-react';

interface ImportOrgWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

const TEMPLATE_COLUMNS = [
  { name: 'unit_id', required: true, desc: 'Unique stable identifier' },
  { name: 'unit_name', required: true, desc: 'Display name' },
  { name: 'unit_type', required: true, desc: 'Company, Division, Department, Team, Cost Center' },
  { name: 'parent_unit_id', required: true, desc: 'Parent unit reference' },
  { name: 'status', required: true, desc: 'Active or Inactive' },
  { name: 'effective_from', required: true, desc: 'Start date (YYYY-MM-DD)' },
  { name: 'effective_to', required: false, desc: 'End date if applicable' },
  { name: 'owner_identity_id', required: false, desc: 'Owner identity reference' },
  { name: 'owner_email', required: false, desc: 'Owner email' },
  { name: 'backup_owner_email', required: false, desc: 'Backup owner email' },
  { name: 'risk_owner_email', required: false, desc: 'Risk owner email' },
  { name: 'review_frequency', required: false, desc: 'Quarterly, Semiannual, Annual' },
  { name: 'headcount_expected', required: false, desc: 'Expected headcount' },
  { name: 'location', required: false, desc: 'Physical location' },
  { name: 'cost_center_code', required: false, desc: 'Cost center reference' },
  { name: 'business_criticality', required: false, desc: 'Low, Medium, High' },
  { name: 'data_classification', required: false, desc: 'Public, Internal, Confidential, Restricted' },
  { name: 'mapped_applications', required: false, desc: 'Comma-separated app keys' },
  { name: 'tags', required: false, desc: 'Comma-separated tags' },
  { name: 'notes', required: false, desc: 'Free-form notes' },
];

const STEPS = [
  { label: 'Template', icon: Download },
  { label: 'Upload', icon: Upload },
  { label: 'Mapping', icon: Table },
  { label: 'Validation', icon: CheckCircle },
  { label: 'Preview', icon: Eye },
  { label: 'Execute', icon: Play },
];

export function ImportOrgWizard({ open, onOpenChange, onImportComplete }: ImportOrgWizardProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Array<{ type: 'error' | 'warning'; line: number; message: string }>>([]);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);

  const downloadTemplate = () => {
    const header = TEMPLATE_COLUMNS.map((c) => c.name).join(',');
    const sampleRow = 'DIV-001,Engineering,Division,,Active,2024-01-01,,john@example.com,john@example.com,jane@example.com,risk@example.com,Quarterly,500,New York,CC-1000,High,Confidential,SAP;Salesforce,core;critical,Main engineering division';
    const csv = `${header}\n${sampleRow}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'org_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    // Simulate column detection
    const mockDetectedColumns = ['unit_id', 'unit_name', 'unit_type', 'parent_unit_id', 'status', 'effective_from', 'owner_email', 'headcount_expected', 'location', 'cost_center_code', 'business_criticality'];
    setFileColumns(mockDetectedColumns);
    // Auto-map matching columns
    const autoMap: Record<string, string> = {};
    mockDetectedColumns.forEach((col) => {
      const match = TEMPLATE_COLUMNS.find((tc) => tc.name === col);
      if (match) autoMap[col] = match.name;
    });
    setMapping(autoMap);
  };

  const runValidation = () => {
    // Mock validation
    setValidationErrors([
      { type: 'warning', line: 3, message: 'owner_email "unknown@test.com" does not match any existing identity' },
      { type: 'warning', line: 5, message: 'headcount_expected is empty, will default to 0' },
      { type: 'error', line: 8, message: 'parent_unit_id "MISSING-001" does not exist in the hierarchy' },
    ]);
  };

  const executeImport = () => {
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setImportDone(true);
      toast({ title: 'Import completed', description: 'Created 8 units, Updated 3 units. 1 error skipped.' });
    }, 2000);
  };

  const blockingErrors = validationErrors.filter((e) => e.type === 'error');
  const warnings = validationErrors.filter((e) => e.type === 'warning');

  const canProceed = () => {
    if (step === 1 && !file) return false;
    if (step === 3 && blockingErrors.length > 0) return false;
    return true;
  };

  const handleNext = () => {
    if (step === 2) runValidation();
    if (step === 4) {
      executeImport();
      return;
    }
    setStep((s) => Math.min(s + 1, 5));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Organization Structure</DialogTitle>
          <DialogDescription>Guided workflow to import and validate organizational units.</DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 mb-4">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <s.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-auto">
          {/* Step 0: Template */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Download the import template containing all supported fields. Fill it with your organizational data and proceed to upload.</p>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 font-medium">Column</th>
                      <th className="text-left p-2 font-medium">Required</th>
                      <th className="text-left p-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TEMPLATE_COLUMNS.map((col) => (
                      <tr key={col.name} className="border-t">
                        <td className="p-2 font-mono">{col.name}</td>
                        <td className="p-2">{col.required ? <Badge variant="destructive" className="text-[10px]">Required</Badge> : <Badge variant="outline" className="text-[10px]">Optional</Badge>}</td>
                        <td className="p-2 text-muted-foreground">{col.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" /> Download CSV Template
              </Button>
            </div>
          )}

          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Upload your completed CSV or JSON file. The system will auto-detect the format and columns.</p>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input id="wizard-upload" type="file" accept=".csv,.json" onChange={handleFileUpload} className="hidden" />
                <label htmlFor="wizard-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">CSV or JSON (max 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
              {file && fileColumns.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Detected {fileColumns.length} columns: {fileColumns.join(', ')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Step 2: Mapping */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Review and adjust the column mapping. Source columns are auto-matched to target fields.</p>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 font-medium">Source Column</th>
                      <th className="text-left p-2 font-medium">→</th>
                      <th className="text-left p-2 font-medium">Target Field</th>
                      <th className="text-left p-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fileColumns.map((col) => (
                      <tr key={col} className="border-t">
                        <td className="p-2 font-mono text-xs">{col}</td>
                        <td className="p-2"><ArrowRight className="h-3 w-3 text-muted-foreground" /></td>
                        <td className="p-2">
                          <Select value={mapping[col] || ''} onValueChange={(v) => setMapping((prev) => ({ ...prev, [col]: v }))}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select field..." />
                            </SelectTrigger>
                            <SelectContent>
                              {TEMPLATE_COLUMNS.map((tc) => (
                                <SelectItem key={tc.name} value={tc.name}>{tc.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          {mapping[col] ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 3: Validation */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Validation results. Blocking errors must be resolved before proceeding.</p>
              {blockingErrors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">{blockingErrors.length} blocking error(s) found</p>
                    <ul className="text-sm mt-2 space-y-1">
                      {blockingErrors.map((e, i) => (
                        <li key={i}>Line {e.line}: {e.message}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              {warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">{warnings.length} warning(s)</p>
                    <ul className="text-sm mt-2 space-y-1">
                      {warnings.map((w, i) => (
                        <li key={i}>Line {w.line}: {w.message}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              {blockingErrors.length === 0 && warnings.length === 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>All validations passed. No errors or warnings.</AlertDescription>
                </Alert>
              )}
              <Button variant="outline" size="sm" onClick={() => {
                const report = validationErrors.map((e) => `[${e.type.toUpperCase()}] Line ${e.line}: ${e.message}`).join('\n');
                const blob = new Blob([report], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'validation_report.txt'; a.click();
                URL.revokeObjectURL(url);
              }}>
                <Download className="h-4 w-4 mr-2" /> Download Validation Report
              </Button>
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 4 && !importDone && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Review what will change when the import executes.</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Create', count: 8, color: 'text-emerald-600' },
                  { label: 'Update', count: 3, color: 'text-primary' },
                  { label: 'Unchanged', count: 0, color: 'text-muted-foreground' },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-lg border text-center">
                    <div className={`text-3xl font-bold ${item.color}`}>{item.count}</div>
                    <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 font-medium">Unit</th>
                      <th className="text-left p-2 font-medium">Action</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Parent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Cloud Services', action: 'Create', type: 'Department', parent: 'Engineering' },
                      { name: 'Data Analytics', action: 'Create', type: 'Team', parent: 'Platform' },
                      { name: 'Security Ops', action: 'Create', type: 'Team', parent: 'Infrastructure' },
                      { name: 'Engineering', action: 'Update', type: 'Division', parent: 'Stark Industries' },
                      { name: 'Finance', action: 'Update', type: 'Division', parent: 'Stark Industries' },
                    ].map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2 font-medium">{row.name}</td>
                        <td className="p-2"><Badge variant={row.action === 'Create' ? 'default' : 'secondary'} className="text-[10px]">{row.action}</Badge></td>
                        <td className="p-2 text-muted-foreground">{row.type}</td>
                        <td className="p-2 text-muted-foreground">{row.parent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 5: Execute / Done */}
          {step === 5 && (
            <div className="space-y-4 text-center py-8">
              {importing ? (
                <>
                  <div className="text-lg font-medium">Importing...</div>
                  <Progress value={65} className="w-64 mx-auto" />
                  <p className="text-sm text-muted-foreground">Processing organizational units...</p>
                </>
              ) : importDone ? (
                <>
                  <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
                  <div className="text-lg font-medium">Import Complete</div>
                  <p className="text-sm text-muted-foreground">Created 8 units, Updated 3 units. 1 error skipped.</p>
                  <Button onClick={() => { onImportComplete(); onOpenChange(false); }}>Close</Button>
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer Nav */}
        {step < 5 && (
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => step === 0 ? onOpenChange(false) : setStep((s) => s - 1)}>
              {step === 0 ? 'Cancel' : <><ArrowLeft className="h-4 w-4 mr-1" /> Back</>}
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()}>
              {step === 4 ? 'Execute Import' : <>Next <ArrowRight className="h-4 w-4 ml-1" /></>}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
