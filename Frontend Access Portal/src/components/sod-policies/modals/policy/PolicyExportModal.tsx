import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PolicyExportModalProps {
  open: boolean;
  onClose: () => void;
  selectedPolicies?: string[];
}

export const PolicyExportModal = ({ open, onClose, selectedPolicies = [] }: PolicyExportModalProps) => {
  const [format, setFormat] = useState<'csv' | 'json' | 'excel' | 'pdf'>('excel');
  const [includeViolations, setIncludeViolations] = useState(true);
  const [includeHistory, setIncludeHistory] = useState(false);
  const [includeCompliance, setIncludeCompliance] = useState(true);
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: `Exporting ${selectedPolicies.length || 'all'} policies as ${format.toUpperCase()}`,
    });
    
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your file is ready for download",
      });
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg flex flex-col p-0 h-[75vh]">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Policies
              </DialogTitle>
              <DialogDescription>
                {selectedPolicies.length > 0 
                  ? `Export ${selectedPolicies.length} selected policies`
                  : 'Export all policies with selected options.'}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                {/* Format Selection */}
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={format} onValueChange={(v) => setFormat(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Excel (.xlsx)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="json">JSON (.json)</SelectItem>
                      <SelectItem value="pdf">PDF Report (.pdf)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Export Options */}
                <div className="space-y-3">
                  <Label>Include in Export:</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="violations"
                        checked={includeViolations}
                        onCheckedChange={(checked) => setIncludeViolations(checked as boolean)}
                      />
                      <Label htmlFor="violations" className="font-normal cursor-pointer">
                        Violation Statistics
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="compliance"
                        checked={includeCompliance}
                        onCheckedChange={(checked) => setIncludeCompliance(checked as boolean)}
                      />
                      <Label htmlFor="compliance" className="font-normal cursor-pointer">
                        Compliance Mappings
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="history"
                        checked={includeHistory}
                        onCheckedChange={(checked) => setIncludeHistory(checked as boolean)}
                      />
                      <Label htmlFor="history" className="font-normal cursor-pointer">
                        Change History
                      </Label>
                    </div>
                  </div>
                </div>

                {/* File Preview */}
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Export Summary</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Format: {format.toUpperCase()}</p>
                    <p>Policies: {selectedPolicies.length || 'All'}</p>
                    <p>Estimated Size: ~{selectedPolicies.length > 0 ? selectedPolicies.length * 25 : 500}KB</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
                  <Button onClick={handleExport} className="shrink-0 mr-4 mb-4">
                    <Download className="h-4 w-4 mr-2" />
                    Export
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
