import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, X } from 'lucide-react';

interface SoDDrilldownItem {
  id: string;
  name: string;
  type: string;
  status: string;
  detail: string;
  severity?: string;
}

interface SoDKpiDrilldownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  items: SoDDrilldownItem[];
}

const mockItems: Record<string, SoDDrilldownItem[]> = {
  'Total Policies': [
    { id: 'POL-001', name: 'SOX Financial Controls', type: 'SoD', status: 'Active', detail: '12 rules, 3 violations', severity: 'high' },
    { id: 'POL-002', name: 'IT Admin Separation', type: 'SoD', status: 'Active', detail: '8 rules, 5 violations', severity: 'high' },
    { id: 'POL-003', name: 'HR Data Protection', type: 'Sensitive Access', status: 'Active', detail: '6 rules, 1 violation', severity: 'medium' },
    { id: 'POL-004', name: 'Procurement Controls', type: 'SoD', status: 'Active', detail: '10 rules, 0 violations', severity: 'low' },
    { id: 'POL-005', name: 'Treasury Operations', type: 'SoD', status: 'Draft', detail: '4 rules, pending review', severity: 'low' },
    { id: 'POL-006', name: 'System Admin Segregation', type: 'Privilege', status: 'Active', detail: '15 rules, 2 violations', severity: 'medium' },
  ],
  'Active Violations': [
    { id: 'VIO-001', name: 'AP + GL Access Conflict', type: 'SoD Violation', status: 'Open', detail: 'john.doe@corp.com — Finance', severity: 'critical' },
    { id: 'VIO-002', name: 'Admin + Audit Conflict', type: 'SoD Violation', status: 'Investigating', detail: 'admin.user@corp.com — IT', severity: 'high' },
    { id: 'VIO-003', name: 'Create + Approve PO', type: 'SoD Violation', status: 'Open', detail: 'buyer.user@corp.com — Procurement', severity: 'high' },
    { id: 'VIO-004', name: 'HR Data + Payroll Access', type: 'SoD Violation', status: 'Open', detail: 'hr.admin@corp.com — HR', severity: 'medium' },
  ],
  'Compliance Score': [
    { id: 'CS-001', name: 'SOX Controls Coverage', type: 'Framework', status: '98%', detail: '49/50 controls met', severity: 'low' },
    { id: 'CS-002', name: 'GDPR Access Policies', type: 'Framework', status: '92%', detail: '23/25 controls met', severity: 'medium' },
    { id: 'CS-003', name: 'ISO 27001 SoD', type: 'Framework', status: '85%', detail: '17/20 controls met', severity: 'high' },
    { id: 'CS-004', name: 'Internal Audit Standards', type: 'Internal', status: '95%', detail: '19/20 controls met', severity: 'low' },
  ],
  'Avg Resolution Time': [
    { id: 'RES-001', name: 'Finance SoD Remediation', type: 'Remediation', status: '2.1 days', detail: 'Avg for finance violations', severity: 'low' },
    { id: 'RES-002', name: 'IT Privilege Separation', type: 'Remediation', status: '4.5 days', detail: 'Avg for IT violations', severity: 'high' },
    { id: 'RES-003', name: 'HR Data Violations', type: 'Remediation', status: '1.8 days', detail: 'Avg for HR violations', severity: 'low' },
    { id: 'RES-004', name: 'Cross-System Conflicts', type: 'Remediation', status: '6.2 days', detail: 'Avg for cross-app violations', severity: 'high' },
  ],
};

const defaultItems: SoDDrilldownItem[] = [
  { id: 'GEN-001', name: 'Sample Item 1', type: 'Policy', status: 'Active', detail: 'Details available', severity: 'medium' },
  { id: 'GEN-002', name: 'Sample Item 2', type: 'Violation', status: 'Open', detail: 'Pending review', severity: 'high' },
];

export function SoDKpiDrilldownDrawer({ open, onOpenChange, title, description, items }: SoDKpiDrilldownDrawerProps) {
  const displayItems = items.length > 0 ? items : (mockItems[title] || defaultItems);

  const getSeverityVariant = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning' as any;
      default: return 'secondary';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[50vw] sm:max-w-[50vw] flex flex-col p-0 h-full">
        <div className="flex-shrink-0 px-6 py-4 border-b">
          <SheetHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <SheetTitle>{title}</SheetTitle>
            </div>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="flex items-center gap-3 mt-3">
            <Badge variant="secondary">{displayItems.length} items</Badge>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="px-6 py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayItems.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-xs">{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.detail}</TableCell>
                    <TableCell>
                      {item.severity && (
                        <Badge variant={getSeverityVariant(item.severity)}>{item.severity}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
