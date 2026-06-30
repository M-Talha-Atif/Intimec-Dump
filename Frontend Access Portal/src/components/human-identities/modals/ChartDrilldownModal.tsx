
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

export interface ChartDrilldownItem {
  name: string;
  department?: string;
  type?: string;
  risk?: string;
  value?: string | number;
  status?: string;
}

interface ChartDrilldownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  segmentLabel: string;
  segmentValue: number | string;
  items: ChartDrilldownItem[];
  columns?: { key: keyof ChartDrilldownItem; label: string }[];
  onViewItem?: (item: ChartDrilldownItem) => void;
}

export function ChartDrilldownModal({ open, onOpenChange, title, segmentLabel, segmentValue, items, columns, onViewItem }: ChartDrilldownModalProps) {
  const cols = columns || [
    { key: 'name' as const, label: 'Name' },
    { key: 'department' as const, label: 'Department' },
    { key: 'risk' as const, label: 'Risk' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{segmentLabel}</Badge>
            <span className="text-sm text-muted-foreground">{segmentValue} items</span>
          </div>
        </DialogHeader>
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                {cols.map(c => <th key={c.key} className="pb-2 font-medium pr-4">{c.label}</th>)}
                {onViewItem && <th className="pb-2 font-medium text-right">Action</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b last:border-0">
                  {cols.map(c => (
                    <td key={c.key} className="py-2.5 pr-4">
                      {c.key === 'risk' ? (
                        <Badge className={
                          item.risk === 'High' || item.risk === 'Critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          item.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }>{item[c.key] || '—'}</Badge>
                      ) : c.key === 'name' ? (
                        <span className="font-medium">{item[c.key] || '—'}</span>
                      ) : (
                        <span className="text-muted-foreground">{String(item[c.key] ?? '—')}</span>
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
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Export Started", description: `Exporting ${items.length} items...` })}>
            <Download className="h-3 w-3 mr-1" />Export
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
