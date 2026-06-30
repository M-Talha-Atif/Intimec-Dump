
import * as React from "react";
import { type User } from "@/data/mock-users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Clock, Key, Settings2, UserX, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIdentityDetail } from "@/contexts/IdentityDetailContext";

const statusColors = {
  Active: "bg-green-100 text-green-800 hover:bg-green-100",
  Inactive: "bg-slate-100 text-slate-800 hover:bg-slate-100",
  Suspended: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  Stale: "bg-orange-100 text-orange-800 hover:bg-orange-100",
};

const riskColors = {
  Low: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Medium: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  High: "bg-red-100 text-red-800 hover:bg-red-100",
};

const typeColors = {
  Employee: "bg-sky-100 text-sky-800 hover:bg-sky-100",
  Contractor: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  "Service Account": "bg-slate-100 text-slate-800 hover:bg-slate-100",
  Partner: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
};

type ColumnVisibility = {
  manager: boolean;
  type: boolean;
  team: boolean;
  status: boolean;
  lastUpdated: boolean;
  riskLevel: boolean;
  aiAnalysis: boolean;
};

type UsersTableProps = {
  users: User[];
  identityType?: 'human' | 'non-human' | undefined;
};

const UsersTable = ({ users, identityType }: UsersTableProps) => {
  const { selectedUser, setSelectedUser } = useIdentityDetail();
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibility>({
    manager: true,
    type: true,
    team: true,
    status: true,
    lastUpdated: true,
    riskLevel: true,
    aiAnalysis: true,
  });
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof User; direction: "ascending" | "descending" } | null>(null);

  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const requestSort = (key: keyof User) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (columnName: keyof User) => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return <ArrowUpDown className="ml-2 h-4 w-4 shrink-0" />;
    }
    if (sortConfig.direction === "ascending") {
      return <ArrowUp className="ml-2 h-4 w-4 shrink-0" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 shrink-0" />;
  };

  const columnMap: Record<keyof ColumnVisibility, string> = {
    manager: "Manager",
    type: "Type",
    team: "Team",
    status: "Status",
    lastUpdated: "Last Updated",
    riskLevel: "Risk Level",
    aiAnalysis: "AI Analysis",
  };
  
  const totalUsersText = React.useMemo(() => {
    switch (identityType) {
      case 'human':
        return `Total Human Identities Found (${users.length})`;
      case 'non-human':
        return `Total Non-Human Identities Found (${users.length})`;
      default:
        return `Total Identities Found (${users.length})`;
    }
  }, [identityType, users.length]);

  return (
    <TooltipProvider>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 flex justify-between items-center border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">{totalUsersText}</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(columnMap) as Array<keyof typeof columnMap>).map((key) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  className="capitalize"
                  checked={columnVisibility[key]}
                  onCheckedChange={(value) =>
                    setColumnVisibility((prev) => ({ ...prev, [key]: !!value }))
                  }
                >
                  {columnMap[key]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead><Button variant="ghost" onClick={() => requestSort('name')}>Name {getSortIcon('name')}</Button></TableHead>
              {columnVisibility.manager && <TableHead><Button variant="ghost" onClick={() => requestSort('manager')}>Manager {getSortIcon('manager')}</Button></TableHead>}
              {columnVisibility.type && <TableHead>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={() => requestSort('type')}>Type {getSortIcon('type')}</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Defined by source system or user classification.</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>}
              {columnVisibility.team && <TableHead><Button variant="ghost" onClick={() => requestSort('team')}>Team {getSortIcon('team')}</Button></TableHead>}
              {columnVisibility.status && <TableHead><Button variant="ghost" onClick={() => requestSort('status')}>Status {getSortIcon('status')}</Button></TableHead>}
              {columnVisibility.lastUpdated && <TableHead><Button variant="ghost" onClick={() => requestSort('lastUpdated')}>Last Updated {getSortIcon('lastUpdated')}</Button></TableHead>}
              {columnVisibility.riskLevel && <TableHead><Button variant="ghost" onClick={() => requestSort('riskLevel')}>Risk Level {getSortIcon('riskLevel')}</Button></TableHead>}
              {columnVisibility.aiAnalysis && <TableHead><Button variant="ghost" onClick={() => requestSort('aiAnalysis')}>AI Analysis {getSortIcon('aiAnalysis')}</Button></TableHead>}
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={cn(
                  "cursor-pointer hover:bg-slate-100",
                  selectedUser?.id === user.id && "bg-slate-200 hover:bg-slate-200"
                )}
              >
                <TableCell className="font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    {user.isOrphan && (
                      <Tooltip>
                        <TooltipTrigger>
                          <UserX className="h-4 w-4 text-red-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Orphan Account</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {user.name}
                    {user.isPrivileged && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Key className="h-4 w-4 text-amber-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Privileged Access</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">{user.department}</div>
                </TableCell>
                {columnVisibility.manager && <TableCell className="text-slate-600">{user.manager}</TableCell>}
                {columnVisibility.type && (
                  <TableCell>
                    <Badge className={cn("text-xs font-bold", typeColors[user.type as keyof typeof typeColors])}>{user.type}</Badge>
                  </TableCell>
                )}
                {columnVisibility.team && <TableCell className="text-slate-600">{user.team > 0 ? `Team ${user.team}` : 'N/A'}</TableCell>}
                {columnVisibility.status && (
                  <TableCell>
                    <Badge className={cn("text-xs font-bold", statusColors[user.status])}>{user.status}</Badge>
                  </TableCell>
                )}
                {columnVisibility.lastUpdated && (
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>{user.lastUpdated}</span>
                    </div>
                  </TableCell>
                )}
                {columnVisibility.riskLevel && (
                  <TableCell>
                    <Badge className={cn("text-xs font-bold", riskColors[user.riskLevel])}>{user.riskLevel}</Badge>
                  </TableCell>
                )}
                {columnVisibility.aiAnalysis && (
                  <TableCell>
                    <Button variant="link" className="p-0 h-auto font-semibold text-blue-600">
                      {user.aiAnalysis}
                    </Button>
                  </TableCell>
                )}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Disable</DropdownMenuItem>
                      <DropdownMenuItem>Terminate</DropdownMenuItem>
                      <DropdownMenuItem>View Audit Trail</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="p-4 border-t border-slate-200">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default UsersTable;
