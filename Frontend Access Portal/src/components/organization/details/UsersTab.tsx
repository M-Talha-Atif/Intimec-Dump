import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, UserCheck } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'employee' | 'contractor' | 'service';
  roles: number;
  isPrivileged: boolean;
  lastLogin: string;
  status: 'active' | 'inactive';
}

// Mock data - would come from props
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Tony Stark',
    email: 'tony.stark@stark.com',
    type: 'employee',
    roles: 5,
    isPrivileged: true,
    lastLogin: '2024-01-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Pepper Potts',
    email: 'pepper.potts@stark.com',
    type: 'employee',
    roles: 3,
    isPrivileged: false,
    lastLogin: '2024-01-14',
    status: 'active',
  },
  {
    id: '3',
    name: 'Contract Worker',
    email: 'contractor@external.com',
    type: 'contractor',
    roles: 1,
    isPrivileged: false,
    lastLogin: '2024-01-10',
    status: 'active',
  },
];

export function UsersTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users] = useState<User[]>(mockUsers);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <UserCheck className="w-4 h-4 mr-2" />
            Launch Review
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-muted p-3 rounded-lg">
          <div className="text-2xl font-bold">{users.length}</div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </div>
        <div className="bg-muted p-3 rounded-lg">
          <div className="text-2xl font-bold">{users.filter(u => u.isPrivileged).length}</div>
          <div className="text-sm text-muted-foreground">Privileged</div>
        </div>
        <div className="bg-muted p-3 rounded-lg">
          <div className="text-2xl font-bold">{users.filter(u => u.type === 'contractor').length}</div>
          <div className="text-sm text-muted-foreground">Contractors</div>
        </div>
        <div className="bg-muted p-3 rounded-lg">
          <div className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</div>
          <div className="text-sm text-muted-foreground">Active</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {user.name}
                    {user.isPrivileged && (
                      <Badge variant="destructive" className="text-xs">
                        Privileged
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{user.type}</Badge>
                </TableCell>
                <TableCell>{user.roles}</TableCell>
                <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
