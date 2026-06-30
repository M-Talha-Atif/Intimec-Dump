import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileDown, FileUp, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { downloadJson } from "@/utils/download";

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: "role" | "entitlement";
  data: any[];
  selectedIds?: string[];
  templateFields: string[];
}

const ImportExportDialog: React.FC<ImportExportDialogProps> = ({
  open, onOpenChange, entityType, data, selectedIds = [], templateFields
}) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[] | null>(null);

  const label = entityType === "role" ? "Role" : "Entitlement";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        if (file.name.endsWith(".json")) {
          setImportPreview(JSON.parse(text).slice(0, 5));
        } else {
          const lines = text.split("\n").filter(l => l.trim());
          const headers = lines[0].split(",");
          const rows = lines.slice(1, 6).map(line => {
            const vals = line.split(",");
            return headers.reduce((obj, h, i) => ({ ...obj, [h.trim()]: vals[i]?.trim() }), {});
          });
          setImportPreview(rows);
        }
      } catch {
        toast.error("Failed to parse file");
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    toast.success(`${importPreview?.length ?? 0} ${label.toLowerCase()}s imported successfully`);
    setImportFile(null);
    setImportPreview(null);
    onOpenChange(false);
  };

  const handleExportAll = (format: "json" | "csv") => {
    if (format === "json") {
      downloadJson(data, `${entityType}s-export.json`);
    } else {
      const headers = templateFields.join(",");
      const rows = data.map(d => templateFields.map(f => JSON.stringify((d as any)[f] ?? "")).join(","));
      const csv = [headers, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${entityType}s-export.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    toast.success(`${data.length} ${label.toLowerCase()}s exported as ${format.toUpperCase()}`);
  };

  const handleExportSelected = () => {
    const selected = data.filter(d => selectedIds.includes(d.id));
    downloadJson(selected, `${entityType}s-selected-export.json`);
    toast.success(`${selected.length} ${label.toLowerCase()}s exported`);
  };

  const handleDownloadTemplate = () => {
    const csv = templateFields.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${entityType}-import-template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{label} Import / Export</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="export">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export"><Download className="h-4 w-4 mr-1" /> Export</TabsTrigger>
            <TabsTrigger value="import"><Upload className="h-4 w-4 mr-1" /> Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => handleExportAll("csv")}>
                <FileText className="h-4 w-4 mr-2" /> Export All as CSV <Badge variant="secondary" className="ml-auto text-xs">{data.length} items</Badge>
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => handleExportAll("json")}>
                <FileDown className="h-4 w-4 mr-2" /> Export All as JSON <Badge variant="secondary" className="ml-auto text-xs">{data.length} items</Badge>
              </Button>
              {selectedIds.length > 0 && (
                <Button variant="outline" className="w-full justify-start" onClick={handleExportSelected}>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Export Selected <Badge variant="default" className="ml-auto text-xs">{selectedIds.length} selected</Badge>
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 pt-4">
            <Button variant="outline" className="w-full" onClick={handleDownloadTemplate}>
              <FileDown className="h-4 w-4 mr-2" /> Download Import Template (CSV)
            </Button>

            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <FileUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Upload CSV or JSON file</p>
              <input type="file" accept=".csv,.json" onChange={handleFileSelect} className="hidden" id="import-file" />
              <Button variant="outline" size="sm" onClick={() => document.getElementById("import-file")?.click()}>
                Choose File
              </Button>
              {importFile && <p className="text-xs text-muted-foreground mt-2">{importFile.name}</p>}
            </div>

            {importPreview && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Preview ({importPreview.length} rows shown)</p>
                <div className="max-h-[160px] overflow-auto border rounded-lg p-2 text-xs font-mono">
                  {importPreview.map((row, i) => (
                    <div key={i} className="border-b last:border-0 py-1">
                      {Object.entries(row).map(([k, v]) => (
                        <span key={k} className="mr-3"><span className="text-muted-foreground">{k}:</span> {String(v)}</span>
                      ))}
                    </div>
                  ))}
                </div>
                <Button onClick={handleImport} className="w-full">
                  <Upload className="h-4 w-4 mr-2" /> Import {importPreview.length}+ {label.toLowerCase()}s
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ImportExportDialog;
