import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export type DrilldownColumn = {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
};

type AppDetailDrilldownDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  items: any[];
  columns: DrilldownColumn[];
  badgeVariant?: 'default' | 'destructive' | 'secondary' | 'outline';
  badgeLabel?: string;
};

const PAGE_SIZE = 8;

const AppDetailDrilldownDialog = ({
  isOpen,
  onClose,
  title,
  description,
  items,
  columns,
  badgeVariant,
  badgeLabel,
}: AppDetailDrilldownDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!searchTerm) return items;
    const lower = searchTerm.toLowerCase();
    return items.filter(item =>
      columns.some(col => {
        const val = item[col.key];
        return typeof val === 'string' && val.toLowerCase().includes(lower);
      })
    );
  }, [items, searchTerm, columns]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleExport = () => {
    const header = columns.map(c => c.label).join(',');
    const rows = filtered.map(item => columns.map(c => `"${item[c.key] ?? ''}"`).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-lg">{title}</DialogTitle>
            {badgeLabel && <Badge variant={badgeVariant || 'default'}>{badgeLabel}</Badge>}
          </div>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="flex items-center justify-between gap-3 py-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{filtered.length} items</span>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> CSV
            </Button>
          </div>
        </div>

        <div className="border rounded-md flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(col => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                    No items found.
                  </TableCell>
                </TableRow>
              ) : paged.map((item, idx) => (
                <TableRow key={idx}>
                  {columns.map(col => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(item[col.key], item) : (item[col.key] ?? '—')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AppDetailDrilldownDialog;
