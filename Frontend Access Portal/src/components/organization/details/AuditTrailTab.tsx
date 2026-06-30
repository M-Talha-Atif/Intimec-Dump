import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download } from 'lucide-react';
import { useState } from 'react';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ipAddress: string;
  result: 'success' | 'failed';
}

const mockAuditTrail: AuditEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-15 14:30:22',
    user: 'Tony Stark',
    action: 'Updated Risk Level',
    details: 'Changed risk level from Medium to High',
    ipAddress: '192.168.1.100',
    result: 'success',
  },
  {
    id: '2',
    timestamp: '2024-01-15 10:15:45',
    user: 'Pepper Potts',
    action: 'Added Delegate',
    details: 'Assigned delegate reviewer: James Rhodes',
    ipAddress: '192.168.1.101',
    result: 'success',
  },
  {
    id: '3',
    timestamp: '2024-01-14 16:20:10',
    user: 'System',
    action: 'Automated Review',
    details: 'Scheduled compliance review initiated',
    ipAddress: '127.0.0.1',
    result: 'success',
  },
  {
    id: '4',
    timestamp: '2024-01-14 09:45:33',
    user: 'Happy Hogan',
    action: 'Modified Structure',
    details: 'Attempted to move unit - insufficient permissions',
    ipAddress: '192.168.1.102',
    result: 'failed',
  },
];

export function AuditTrailTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');

  const filteredAudit = mockAuditTrail.filter((entry) => {
    const matchesSearch =
      entry.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === 'all' || entry.action.includes(actionFilter);
    const matchesResult = resultFilter === 'all' || entry.result === resultFilter;

    return matchesSearch && matchesAction && matchesResult;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search audit trail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Action Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="Updated">Updates</SelectItem>
            <SelectItem value="Added">Additions</SelectItem>
            <SelectItem value="Modified">Modifications</SelectItem>
            <SelectItem value="Automated">System Actions</SelectItem>
          </SelectContent>
        </Select>
        <Select value={resultFilter} onValueChange={setResultFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted p-3 rounded-lg">
          <div className="text-2xl font-bold">{mockAuditTrail.length}</div>
          <div className="text-sm text-muted-foreground">Total Events</div>
        </div>
        <div className="bg-muted p-3 rounded-lg">
          <div className="text-2xl font-bold">
            {mockAuditTrail.filter((e) => e.result === 'success').length}
          </div>
          <div className="text-sm text-muted-foreground">Successful</div>
        </div>
        <div className="bg-muted p-3 rounded-lg">
          <div className="text-2xl font-bold text-destructive">
            {mockAuditTrail.filter((e) => e.result === 'failed').length}
          </div>
          <div className="text-sm text-muted-foreground">Failed Attempts</div>
        </div>
      </div>

      {/* Audit Trail Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAudit.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-mono text-sm">{entry.timestamp}</TableCell>
                <TableCell className="font-medium">{entry.user}</TableCell>
                <TableCell>
                  <Badge variant="outline">{entry.action}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">
                  {entry.details}
                </TableCell>
                <TableCell className="font-mono text-sm">{entry.ipAddress}</TableCell>
                <TableCell>
                  <Badge variant={entry.result === 'success' ? 'default' : 'destructive'}>
                    {entry.result}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredAudit.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No audit entries found matching your filters.
        </div>
      )}
    </div>
  );
}
