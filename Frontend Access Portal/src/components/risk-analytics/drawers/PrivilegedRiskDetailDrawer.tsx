
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KeyRound, Download, CheckCircle, XCircle } from 'lucide-react';
import { privilegedAccounts } from '@/data/mock-risk-analytics';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Props { isOpen: boolean; onClose: () => void; }

export const PrivilegedRiskDetailDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const { toast } = useToast();

  const ControlIcon = ({ enabled }: { enabled: boolean }) => (
    enabled ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />
  );

  const getPrivBadge = (level: string) => {
    const map: Record<string, 'destructive' | 'secondary' | 'outline'> = { Root: 'destructive', Admin: 'secondary', Elevated: 'outline' };
    return <Badge variant={map[level] || 'outline'} className="text-xs">{level}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex flex-col p-0 h-full">
        <DialogHeader className="flex-shrink-0 px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Privileged Access Risk — {privilegedAccounts.length} Accounts
          </DialogTitle>
          <p className="text-sm text-muted-foreground">High-privilege accounts with missing security controls</p>
        </DialogHeader>

        <div className="flex-shrink-0 px-6 pb-3 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Export Started", description: "Privileged accounts exported as CSV" })}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
        </div>

        <ScrollArea className="flex-1 px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Account</TableHead>
                <TableHead className="text-xs">Identity</TableHead>
                <TableHead className="text-xs">Application</TableHead>
                <TableHead className="text-xs">Level</TableHead>
                <TableHead className="text-xs text-center">MFA</TableHead>
                <TableHead className="text-xs text-center">JIT</TableHead>
                <TableHead className="text-xs text-center">Session Rec.</TableHead>
                <TableHead className="text-xs text-center">PAM Vault</TableHead>
                <TableHead className="text-xs text-center">Risk</TableHead>
                <TableHead className="text-xs">Pwd Rotation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {privilegedAccounts.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="py-2">
                    <div className="font-medium text-sm text-foreground">{a.account}</div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="text-sm text-foreground">{a.identity}</div>
                    <div className="text-xs text-muted-foreground">{a.identityType}</div>
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">{a.application}</TableCell>
                  <TableCell className="py-2">{getPrivBadge(a.privilegeLevel)}</TableCell>
                  <TableCell className="py-2 text-center"><ControlIcon enabled={a.hasMFA} /></TableCell>
                  <TableCell className="py-2 text-center"><ControlIcon enabled={a.hasJIT} /></TableCell>
                  <TableCell className="py-2 text-center"><ControlIcon enabled={a.hasSessionRecording} /></TableCell>
                  <TableCell className="py-2 text-center"><ControlIcon enabled={a.hasPAMVault} /></TableCell>
                  <TableCell className="py-2 text-center">
                    <span className={cn("text-xs font-bold", a.riskScore >= 80 ? 'text-destructive' : a.riskScore >= 60 ? 'text-orange-600' : 'text-foreground')}>{a.riskScore}</span>
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">{a.lastPasswordRotation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
