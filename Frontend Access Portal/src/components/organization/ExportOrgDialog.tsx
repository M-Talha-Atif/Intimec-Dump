import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Download } from 'lucide-react';
import { exportOrgData } from '@/utils/orgImportExport';
import { OrgNodeData, OrgExportFormat } from '@/types/organization';
import { useToast } from '@/hooks/use-toast';

interface ExportOrgDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: OrgNodeData;
  selectedNodeId?: string;
}

export function ExportOrgDialog({ open, onOpenChange, data, selectedNodeId }: ExportOrgDialogProps) {
  const { toast } = useToast();
  const [format, setFormat] = useState<OrgExportFormat>('json');
  const [includeHistory, setIncludeHistory] = useState(false);
  const [includeUsers, setIncludeUsers] = useState(false);
  const [selectedOnly, setSelectedOnly] = useState(!!selectedNodeId);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);

    try {
      await exportOrgData(data, format, {
        includeHistory,
        includeUsers,
        selectedOnly,
        selectedNodeId: selectedOnly ? selectedNodeId : undefined,
      });

      toast({
        title: 'Export successful',
        description: `Organization data exported as ${format.toUpperCase()}`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Organization Structure</DialogTitle>
          <DialogDescription>
            Choose your export format and options. The file will be downloaded to your device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(v: OrgExportFormat) => setFormat(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="export-json" />
                <Label htmlFor="export-json" className="font-normal cursor-pointer">
                  JSON - Full hierarchical structure with all metadata
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="export-csv" />
                <Label htmlFor="export-csv" className="font-normal cursor-pointer">
                  CSV - Flat table format, ideal for Excel
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xml" id="export-xml" />
                <Label htmlFor="export-xml" className="font-normal cursor-pointer">
                  XML - Enterprise-compatible format
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="export-excel" />
                <Label htmlFor="export-excel" className="font-normal cursor-pointer">
                  Excel - Multi-sheet workbook with detailed views
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <Label>Export Options</Label>
            <div className="space-y-3">
              {selectedNodeId && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="selected-only"
                    checked={selectedOnly}
                    onCheckedChange={(checked) => setSelectedOnly(checked as boolean)}
                  />
                  <Label htmlFor="selected-only" className="font-normal cursor-pointer">
                    Export selected branch only
                  </Label>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-history"
                  checked={includeHistory}
                  onCheckedChange={(checked) => setIncludeHistory(checked as boolean)}
                />
                <Label htmlFor="include-history" className="font-normal cursor-pointer">
                  Include change history
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-users"
                  checked={includeUsers}
                  onCheckedChange={(checked) => setIncludeUsers(checked as boolean)}
                />
                <Label htmlFor="include-users" className="font-normal cursor-pointer">
                  Include user lists and role assignments
                </Label>
              </div>
            </div>
          </div>

          {/* Preview Info */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Export Preview</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Format: {format.toUpperCase()}</p>
              <p>Scope: {selectedOnly ? 'Selected branch' : 'Full organization tree'}</p>
              <p>
                Options: {[includeHistory && 'History', includeUsers && 'Users'].filter(Boolean).join(', ') || 'None'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={exporting}>
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
