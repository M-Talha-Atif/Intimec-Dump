import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Download, Search, ArrowRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getRiskBadgeClass } from "@/utils/getRiskColor";
import { cn } from "@/lib/utils";

interface DrilldownItem {
  id: string;
  name: string;
  type: string;
  status: string;
  detail: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface OrgKpiDrilldownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  items: DrilldownItem[];
  contributingFactors?: string[];
  recommendedActions?: string[];
}

export function OrgKpiDrilldownModal({
  open,
  onOpenChange,
  title,
  description,
  items,
  contributingFactors = [],
  recommendedActions = [],
}: OrgKpiDrilldownModalProps) {
  const [search, setSearch] = useState('');

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = (format: 'csv' | 'json') => {
    const data = format === 'json'
      ? JSON.stringify(filteredItems, null, 2)
      : [
        ['Name', 'Type', 'Status', 'Detail'].join(','),
        ...filteredItems.map((i) => [i.name, i.type, i.status, i.detail].join(',')),
      ].join('\n');
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityBadge = (severity?: string) => {
    const level = severity ?? "low";

    return (
      <Badge className={cn("capitalize", getRiskBadgeClass(level))}>
        {level}
      </Badge>
    );
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* Contributing Factors */}
          {contributingFactors.length > 0 && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
              <div className="text-sm font-medium text-foreground">Contributing Factors</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {contributingFactors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Actions */}
          {recommendedActions.length > 0 && (
            <div className="p-3 rounded-lg bg-primary/5 space-y-1">
              <div className="text-sm font-medium text-foreground">Recommended Actions</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {recommendedActions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Search & Export */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search units..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
              <Download className="h-4 w-4 mr-1" /> JSON
            </Button>
          </div>

          {/* Items Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Detail</th>
                  {items.some((i) => i.severity) && (
                    <th className="text-left p-3 font-medium">Severity</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3 text-muted-foreground">{item.type}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        {item.status === 'compliant' || item.status === 'Active' ? (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-destructive" />
                        )}
                        <span className="capitalize">{item.status}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{item.detail}</td>
                    {items.some((i) => i.severity) && (
                      <td className="p-3">{getSeverityBadge(item.severity)}</td>
                    )}
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">
                      No items match the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-muted-foreground">
            Showing {filteredItems.length} of {items.length} items
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
