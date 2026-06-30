import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { importFromCSV, importFromJSON } from '@/utils/orgImportExport';
import { OrgImportResult } from '@/types/organization'
import { useToast } from '@/hooks/use-toast';

interface ImportOrgDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: (result: OrgImportResult) => void;
}

export function ImportOrgDialog({ open, onOpenChange, onImportComplete }: ImportOrgDialogProps) {
  const { toast } = useToast();
  const [format, setFormat] = useState<'csv' | 'json' | 'xml'>('json');
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<OrgImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const content = await file.text();
      let importResult: OrgImportResult;

      if (format === 'json') {
        importResult = await importFromJSON(content);
      } else if (format === 'csv') {
        importResult = await importFromCSV(content);
      } else {
        // XML import (simplified for now)
        importResult = {
          success: false,
          created: 0,
          updated: 0,
          errors: [{ line: 0, message: 'XML import not yet implemented' }],
          warnings: [],
        };
      }

      setResult(importResult);

      if (importResult.success) {
        toast({
          title: 'Import successful',
          description: `Created: ${importResult.created}, Updated: ${importResult.updated}`,
        });
        onImportComplete(importResult);
      } else {
        toast({
          title: 'Import failed',
          description: `Found ${importResult.errors.length} errors`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Import error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Organization Structure</DialogTitle>
          <DialogDescription>
            Upload a file to import organization units. Choose your import mode carefully.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>File Format</Label>
            <RadioGroup value={format} onValueChange={(v: any) => setFormat(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="font-normal cursor-pointer">
                  JSON (Hierarchical structure)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="font-normal cursor-pointer">
                  CSV (Flat structure with parent references)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xml" id="xml" />
                <Label htmlFor="xml" className="font-normal cursor-pointer">
                  XML (Enterprise format)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Import Mode */}
          <div className="space-y-3">
            <Label>Import Mode</Label>
            <RadioGroup value={mode} onValueChange={(v: any) => setMode(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="merge" id="merge" />
                <Label htmlFor="merge" className="font-normal cursor-pointer">
                  Merge (Update existing, add new)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="replace" id="replace" />
                <Label htmlFor="replace" className="font-normal cursor-pointer">
                  Replace (Full replacement - backup recommended)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <Label htmlFor="file-upload">Select File</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                id="file-upload"
                type="file"
                accept={`.${format}`}
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format.toUpperCase()} file (max 10MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Import Result */}
          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {result.success ? (
                  <div>
                    <p className="font-medium mb-1">Import completed successfully!</p>
                    <p className="text-sm">Created: {result.created}, Updated: {result.updated}</p>
                    {result.warnings.length > 0 && (
                      <p className="text-sm mt-1">Warnings: {result.warnings.length}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="font-medium mb-1">Import failed</p>
                    <ul className="text-sm space-y-1 mt-2">
                      {result.errors.slice(0, 5).map((error, idx) => (
                        <li key={idx}>
                          Line {error.line}: {error.message}
                        </li>
                      ))}
                      {result.errors.length > 5 && (
                        <li>... and {result.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!file || importing}>
              {importing ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
