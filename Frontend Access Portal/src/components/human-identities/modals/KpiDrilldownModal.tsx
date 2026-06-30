
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

export interface KpiDrilldownItem {
  name: string;
  department?: string;
  type?: string;
  risk?: string;
  status?: string;
  detail?: string;
}

interface KpiDrilldownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  items: KpiDrilldownItem[];
  columns?: { key: keyof KpiDrilldownItem; label: string }[];
  onViewItem?: (item: KpiDrilldownItem) => void;
}

const defaultColumns: { key: keyof KpiDrilldownItem; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'department', label: 'Department' },
  { key: 'type', label: 'Type' },
  { key: 'risk', label: 'Risk' },
];

export function KpiDrilldownModal({ open, onOpenChange, title, description, items, columns = defaultColumns, onViewItem }: KpiDrilldownModalProps) {
  const handleExport = () => {
    toast({ title: "Export Started", description: `Exporting ${items.length} items to CSV...` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
            <Badge variant="secondary" className="text-xs">{items.length} items</Badge>
          </DialogTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </DialogHeader>
        <div className="overflow-auto flex-1 pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                {columns.map(col => (
                  <th key={col.key} className="pb-2 font-medium pr-4">{col.label}</th>
                ))}
                {onViewItem && <th className="pb-2 font-medium text-right">Action</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b last:border-0">
                  {columns.map(col => (
                    <td key={col.key} className="py-2.5 pr-4">
                      {col.key === 'risk' ? (
                        <Badge className={
                          item.risk === 'High' || item.risk === 'Critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          item.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }>{item[col.key] || '—'}</Badge>
                      ) : col.key === 'name' ? (
                        <span className="font-medium">{item[col.key] || '—'}</span>
                      ) : (
                        <span className="text-muted-foreground">{item[col.key] || '—'}</span>
                      )}
                    </td>
                  ))}
                  {onViewItem && (
                    <td className="py-2.5 text-right">
                      <Button variant="outline" size="sm" onClick={() => onViewItem(item)}>View</Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-3 w-3 mr-1" />Export CSV
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
