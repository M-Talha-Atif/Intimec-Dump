import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';

interface MonitoringDrilldownItem {
  id: string;
  name: string;
  type: string;
  status: string;
  detail: string;
  severity?: string;
}

interface MonitoringDrilldownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  items: MonitoringDrilldownItem[];
}

const mockDataByTitle: Record<string, MonitoringDrilldownItem[]> = {
  'Provisioning Success Rate': [
    { id: 'PRV-001', name: 'SAP User Provisioning', type: 'Provisioning', status: 'Success', detail: '15 users provisioned', severity: 'low' },
    { id: 'PRV-002', name: 'AD Group Assignment', type: 'Provisioning', status: 'Success', detail: '8 assignments completed', severity: 'low' },
    { id: 'PRV-003', name: 'Salesforce License', type: 'Provisioning', status: 'Failed', detail: 'API timeout', severity: 'high' },
    { id: 'PRV-004', name: 'ServiceNow Access', type: 'Provisioning', status: 'Success', detail: '3 users provisioned', severity: 'low' },
  ],
  'Average Sync Latency': [
    { id: 'SYN-001', name: 'SAP Connector', type: 'Sync', status: '1.2s', detail: 'Below threshold', severity: 'low' },
    { id: 'SYN-002', name: 'AD Connector', type: 'Sync', status: '3.8s', detail: 'Above threshold', severity: 'high' },
    { id: 'SYN-003', name: 'Salesforce Connector', type: 'Sync', status: '2.1s', detail: 'Normal', severity: 'medium' },
    { id: 'SYN-004', name: 'LDAP Connector', type: 'Sync', status: '5.2s', detail: 'Degraded', severity: 'high' },
  ],
  'Failed Jobs': [
    { id: 'JOB-001', name: 'LDAP Sync Job', type: 'Sync', status: 'Failed', detail: 'Connection timeout', severity: 'high' },
    { id: 'JOB-002', name: 'SAP Role Sync', type: 'Sync', status: 'Failed', detail: 'Authentication error', severity: 'high' },
    { id: 'JOB-003', name: 'AD Deprovisioning', type: 'Provisioning', status: 'Failed', detail: 'Permission denied', severity: 'critical' },
    { id: 'JOB-004', name: 'Email Distribution', type: 'Notification', status: 'Failed', detail: 'SMTP error', severity: 'medium' },
  ],
  'Processing Time': [
    { id: 'REQ-001', name: 'SAP Access Request', type: 'Request', status: '32m', detail: 'Auto-approved', severity: 'low' },
    { id: 'REQ-002', name: 'Admin Privilege Request', type: 'Request', status: '2h 15m', detail: 'Multi-level approval', severity: 'medium' },
    { id: 'REQ-003', name: 'Database Access', type: 'Request', status: '45m', detail: 'Manager approved', severity: 'low' },
    { id: 'REQ-004', name: 'Emergency Access', type: 'Request', status: '5m', detail: 'Break-glass procedure', severity: 'low' },
  ],
  'Provisioning Engine': [
    { id: 'PE-001', name: 'Active Job: SAP Batch', type: 'Job', status: 'Running', detail: '15/50 users processed', severity: 'low' },
    { id: 'PE-002', name: 'Active Job: AD Sync', type: 'Job', status: 'Running', detail: '120/200 accounts synced', severity: 'low' },
    { id: 'PE-003', name: 'Queued: LDAP Provision', type: 'Job', status: 'Queued', detail: 'ETA 5 minutes', severity: 'low' },
  ],
  'SoD Policy Engine': [
    { id: 'SOD-001', name: 'Real-time Check Failure', type: 'Error', status: 'Failed', detail: 'Timeout on policy evaluation', severity: 'high' },
    { id: 'SOD-002', name: 'Batch Scan: Finance', type: 'Job', status: 'Running', detail: '80% complete', severity: 'low' },
    { id: 'SOD-003', name: 'Rule Update Failure', type: 'Error', status: 'Failed', detail: 'Invalid rule syntax', severity: 'medium' },
  ],
};

const defaultItems: MonitoringDrilldownItem[] = [
  { id: 'MON-001', name: 'System Event', type: 'Event', status: 'Info', detail: 'Normal operation', severity: 'low' },
];

export function MonitoringDrilldownDrawer({ open, onOpenChange, title, description, items }: MonitoringDrilldownDrawerProps) {
  const displayItems = items.length > 0 ? items : (mockDataByTitle[title] || defaultItems);

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
            <SheetTitle>{title}</SheetTitle>
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
                      {item.severity && <Badge variant={getSeverityVariant(item.severity)}>{item.severity}</Badge>}
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
