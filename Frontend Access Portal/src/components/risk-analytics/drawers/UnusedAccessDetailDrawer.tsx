
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Download, Search, AlertTriangle } from 'lucide-react';
import { unusedAccessEntries } from '@/data/mock-risk-analytics';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UnusedAccessDetailDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [appFilter, setAppFilter] = useState('all');
  const [daysFilter, setDaysFilter] = useState('all');
  const { toast } = useToast();

  const apps = [...new Set(unusedAccessEntries.map(e => e.application))];

  const filtered = unusedAccessEntries.filter(e => {
    if (search && !e.identity.toLowerCase().includes(search.toLowerCase()) && !e.entitlement.toLowerCase().includes(search.toLowerCase())) return false;
    if (appFilter !== 'all' && e.application !== appFilter) return false;
    if (daysFilter === '90' && e.daysInactive < 90) return false;
    if (daysFilter === '120' && e.daysInactive < 120) return false;
    if (daysFilter === '180' && e.daysInactive < 180) return false;
    return true;
  });

  const getRiskBadge = (level: string) => {
    const map: Record<string, 'destructive' | 'secondary' | 'outline'> = { Critical: 'destructive', High: 'secondary', Medium: 'outline', Low: 'outline' };
    return <Badge variant={map[level] || 'outline'} className="text-xs">{level}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex flex-col p-0 h-full">
        <DialogHeader className="flex-shrink-0 px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Unused Access — {unusedAccessEntries.length} Entitlements
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Entitlements not exercised in 90+ days, violating least-privilege principle</p>
        </DialogHeader>

        <div className="flex-shrink-0 px-6 pb-3 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search identity or entitlement..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
          </div>
          <Select value={appFilter} onValueChange={setAppFilter}>
            <SelectTrigger className="w-[160px] h-8 text-sm"><SelectValue placeholder="Application" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              {apps.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={daysFilter} onValueChange={setDaysFilter}>
            <SelectTrigger className="w-[140px] h-8 text-sm"><SelectValue placeholder="Days Inactive" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="90">90+ days</SelectItem>
              <SelectItem value="120">120+ days</SelectItem>
              <SelectItem value="180">180+ days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Export Started", description: "Unused access data exported as CSV" })}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
        </div>

        <ScrollArea className="flex-1 px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Identity</TableHead>
                <TableHead className="text-xs">Entitlement</TableHead>
                <TableHead className="text-xs">Application</TableHead>
                <TableHead className="text-xs text-center">Days Inactive</TableHead>
                <TableHead className="text-xs">Last Used</TableHead>
                <TableHead className="text-xs">Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="py-2">
                    <div className="font-medium text-sm text-foreground">{e.identity}</div>
                    <div className="text-xs text-muted-foreground">{e.identityType}</div>
                  </TableCell>
                  <TableCell className="py-2"><Badge variant="outline" className="text-xs">{e.entitlement}</Badge></TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">{e.application}</TableCell>
                  <TableCell className="py-2 text-center">
                    <span className={cn("text-xs font-medium", e.daysInactive >= 150 ? 'text-destructive' : e.daysInactive >= 100 ? 'text-orange-600' : 'text-foreground')}>
                      {e.daysInactive}d {e.daysInactive >= 150 && <AlertTriangle className="inline h-3 w-3 ml-0.5" />}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">{e.lastUsed}</TableCell>
                  <TableCell className="py-2">{getRiskBadge(e.riskLevel)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-xs text-muted-foreground mt-3">{filtered.length} of {unusedAccessEntries.length} entries shown</p>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
