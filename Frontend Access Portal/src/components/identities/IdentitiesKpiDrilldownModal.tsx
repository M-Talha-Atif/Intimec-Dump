import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from 'lucide-react';

export interface IdentityDrilldownItem {
  id: string;
  name: string;
  type: string;
  status: string;
  risk: string;
  owner: string;
  date: string;
}

interface IdentitiesKpiDrilldownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  items: IdentityDrilldownItem[];
}

export const IdentitiesKpiDrilldownModal: React.FC<IdentitiesKpiDrilldownModalProps> = ({
  open, onOpenChange, title, items
}) => {
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-muted text-muted-foreground',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-orange-100 text-orange-800',
      expired: 'bg-red-100 text-red-800',
      orphaned: 'bg-yellow-100 text-yellow-800',
    };
    return <Badge variant="outline" className={colors[status] || ''}>{status}</Badge>;
  };

  const getRiskBadge = (risk: string) => {
    if (!risk || risk === 'low') return <Badge variant="secondary">low</Badge>;
    if (risk === 'critical') return <Badge variant="destructive">critical</Badge>;
    if (risk === 'high') return <Badge className="bg-orange-100 text-orange-800 border-orange-200">high</Badge>;
    if (risk === 'medium') return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">medium</Badge>;
    return <Badge variant="secondary">{risk}</Badge>;
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Type', 'Status', 'Risk', 'Owner', 'Date'].join(','),
      ...items.map(i =>
        [i.id, `"${i.name}"`, i.type, i.status, i.risk, `"${i.owner}"`, i.date].join(',')
      )
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `identities-${title.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{items.length} identit{items.length !== 1 ? 'ies' : 'y'} found</DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs">{item.id}</TableCell>
                <TableCell className="max-w-[180px] truncate text-sm font-medium">{item.name}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{item.type}</Badge></TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>{getRiskBadge(item.risk)}</TableCell>
                <TableCell className="text-sm">{item.owner}</TableCell>
                <TableCell className="text-xs">{item.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No identities match this filter.</div>
        )}
      </DialogContent>
    </Dialog>
  );
};
