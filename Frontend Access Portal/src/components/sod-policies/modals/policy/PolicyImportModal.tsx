import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface PolicyImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (policies: any[]) => void;
}

export const PolicyImportModal = ({ open, onClose, onImport }: PolicyImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<any[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview([
        { name: 'Finance-IT Conflict', status: 'Valid', conflicts: 0 },
        { name: 'Procurement-Approval SoD', status: 'Valid', conflicts: 0 },
        { name: 'Payment Processing Segregation', status: 'Warning', conflicts: 1 },
      ]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      onImport(preview);
      toast({
        title: "Import Complete",
        description: `Successfully imported ${preview.length} policies`,
      });
      setImporting(false);
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl flex flex-col p-0 h-[80vh]">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Policies
              </DialogTitle>
              <DialogDescription>
                Upload a CSV, JSON, or Excel file containing policy definitions.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".csv,.json,.xlsx"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">
                      {file ? file.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      CSV, JSON, or Excel (max 10MB)
                    </p>
                  </label>
                </div>

                {/* Preview */}
                {preview.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Preview ({preview.length} policies)</p>
                    <div className="border rounded-lg max-h-60 overflow-y-auto">
                      {preview.map((item, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between border-b last:border-b-0">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Import Progress */}
                {importing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Importing policies...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                {/* Info */}
                <div className="flex items-start gap-2 p-3 bg-muted rounded border">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Import Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Policies will be imported in draft status</li>
                      <li>Duplicate policy names will be automatically renamed</li>
                      <li>Invalid conditions will be flagged for review</li>
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={onClose} disabled={importing}>
                    Cancel
                  </Button>
                  <Button onClick={handleImport} disabled={!file || importing}>
                    <Upload className="h-4 w-4 mr-2" />
                    {importing ? 'Importing...' : 'Import Policies'}
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
