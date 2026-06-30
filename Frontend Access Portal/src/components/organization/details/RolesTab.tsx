import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, AlertTriangle, Shield } from 'lucide-react';
import { useState } from 'react';

interface Role {
  id: string;
  name: string;
  entitlements: number;
  assignments: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  isStale: boolean;
  hasSodConflict: boolean;
  lastReviewed: string;
}

// Mock data
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Admin Access',
    entitlements: 50,
    assignments: 3,
    riskLevel: 'High',
    isStale: false,
    hasSodConflict: true,
    lastReviewed: '2024-01-01',
  },
  {
    id: '2',
    name: 'Developer',
    entitlements: 25,
    assignments: 12,
    riskLevel: 'Medium',
    isStale: false,
    hasSodConflict: false,
    lastReviewed: '2023-12-15',
  },
  {
    id: '3',
    name: 'Legacy Role',
    entitlements: 10,
    assignments: 0,
    riskLevel: 'Low',
    isStale: true,
    hasSodConflict: false,
    lastReviewed: '2023-06-01',
  },
];

export function RolesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roles] = useState<Role[]>(mockRoles);

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const staleRoles = roles.filter((r) => r.isStale).length;
  const sodConflicts = roles.filter((r) => r.hasSodConflict).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Roles
        </Button>
      </div>

      {/* Stats & Alerts */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-muted p-3 rounded-lg">
          <div className="text-2xl font-bold">{roles.length}</div>
          <div className="text-sm text-muted-foreground">Total Roles</div>
        </div>
        <div className="bg-muted p-3 rounded-lg">
          <div className="text-2xl font-bold">{roles.filter(r => r.riskLevel === 'High').length}</div>
          <div className="text-sm text-muted-foreground">High Risk</div>
        </div>
        <div className="bg-destructive/10 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <div className="text-2xl font-bold text-destructive">{staleRoles}</div>
          </div>
          <div className="text-sm text-muted-foreground">Stale Roles</div>
        </div>
        <div className="bg-destructive/10 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-destructive" />
            <div className="text-2xl font-bold text-destructive">{sodConflicts}</div>
          </div>
          <div className="text-sm text-muted-foreground">SoD Conflicts</div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Entitlements</TableHead>
              <TableHead>Assignments</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Alerts</TableHead>
              <TableHead>Last Reviewed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.entitlements}</TableCell>
                <TableCell>{role.assignments}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      role.riskLevel === 'High'
                        ? 'destructive'
                        : role.riskLevel === 'Medium'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {role.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {role.isStale && (
                      <Badge variant="outline" className="text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Stale
                      </Badge>
                    )}
                    {role.hasSodConflict && (
                      <Badge variant="destructive" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        SoD
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{role.lastReviewed}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
