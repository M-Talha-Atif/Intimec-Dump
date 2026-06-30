import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { IdentityGroup } from '@/services/groups';

interface GroupKpiDrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  groups: IdentityGroup[];
}

export function GroupKpiDrilldownModal({ isOpen, onClose, title, description, groups }: GroupKpiDrilldownModalProps) {
  const handleExport = () => {
    const csv = [
      'Name,Type,Members,Risk,Owners',
      ...groups.map(g => `"${g.name}",${g.type},${g.memberCount},${g.riskLevel},"${g.owners.join('; ')}"`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
          </div>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Owners</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map(g => (
              <TableRow key={g.id}>
                <TableCell className="font-medium">{g.name}</TableCell>
                <TableCell>
                  <Badge variant={g.type === 'dynamic' ? 'default' : 'secondary'}>{g.type}</Badge>
                </TableCell>
                <TableCell>{g.memberCount}</TableCell>
                <TableCell>
                  <Badge variant={g.riskLevel === 'high' ? 'destructive' : g.riskLevel === 'medium' ? 'warning' : 'success'}>
                    {g.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {g.owners.length > 0 ? g.owners[0] : 'Unassigned'}
                </TableCell>
              </TableRow>
            ))}
            {groups.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No groups match this criteria</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
