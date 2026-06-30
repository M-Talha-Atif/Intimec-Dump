import React, { useState } from "react";
import {
  StickyTable,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { InternalRole } from "@/types/roleManagement";
import { RoleTableRow, RoleTableRowSkeleton } from "./RoleTableRow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRoleManagementContext } from "../contexts/RoleManagementContext";

interface RoleTableViewProps {
  roles: InternalRole[];
  loading?: boolean;
  size?: number;
}

export const RoleTableView: React.FC<RoleTableViewProps> = ({
  roles,
  loading = false,
  size = 10,
}) => {
  const { selectedRoles, setSelectedRoles } = useRoleManagementContext();

  const [columns, setColumns] = useState({
    description: true,
    owners: true,
    users: true,
    permissions: true,
    tags: true,
    status: true,
    created: true,
    lastModified: true,
    createdBy: true,
  });

  const columnsKeyMap = {
    description: "Description",
    owners: "Owners",
    users: "Users",
    permissions: "Permissions",
    tags: "Tags",
    status: "Status",
    created: "Created",
    lastModified: "Last Modified",
    createdBy: "Created By",
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select non-SYSTEM roles
      const selectableRoles = roles.filter((role) => role.type !== "SYSTEM");
      setSelectedRoles(selectableRoles.map((role) => role.id));
    } else {
      setSelectedRoles([]);
    }
  };

  const handleSelectRole = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, roleId]);
    } else {
      setSelectedRoles(selectedRoles.filter((id) => id !== roleId));
    }
  };

  // Only count non-SYSTEM roles for "select all" state
  const selectableRoles = roles.filter((role) => role.type !== "SYSTEM");
  const allSelected = selectableRoles.length > 0 && selectedRoles.length === selectableRoles.length;
  const someSelected = selectedRoles.length > 0 && selectedRoles.length < selectableRoles.length;

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={columns.description}
              onCheckedChange={(checked) =>
                setColumns((prev) => ({ ...prev, description: !!checked }))
              }
            >
              Description
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columns.owners}
              onCheckedChange={(checked) =>
                setColumns((prev) => ({ ...prev, owners: !!checked }))
              }
            >
              Owners
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columns.users}
              onCheckedChange={(checked) =>
                setColumns((prev) => ({ ...prev, users: !!checked }))
              }
            >
              Users
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columns.permissions}
              onCheckedChange={(checked) =>
                setColumns((prev) => ({ ...prev, permissions: !!checked }))
              }
            >
              Permissions
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columns.tags}
              onCheckedChange={(checked) =>
                setColumns((prev) => ({ ...prev, tags: !!checked }))
              }
            >
              Tags
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columns.status}
              onCheckedChange={(checked) =>
                setColumns((prev) => ({ ...prev, status: !!checked }))
              }
            >
              Status
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columns.created}
              onCheckedChange={(checked) =>
                setColumns((prev) => ({ ...prev, created: !!checked }))
              }
            >
              Created
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columns.lastModified}
              onCheckedChange={(checked) =>
                setColumns((prev) => ({ ...prev, lastModified: !!checked }))
              }
            >
              Last Modified
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columns.createdBy}
              onCheckedChange={(checked) =>
                setColumns((prev) => ({ ...prev, createdBy: !!checked }))
              }
            >
              Created By
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="w-full max-h-full border rounded-lg">
        <StickyTable>
          <TableHeader className="sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-10">
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={allSelected || someSelected}
                    onCheckedChange={handleSelectAll}
                    className="border-1"
                  />
                </div>
              </TableHead>
              <TableHead>Role Name</TableHead>

              {columns.description && <TableHead>Description</TableHead>}
              {columns.owners && <TableHead>Owners</TableHead>}
              {columns.users && <TableHead>Users</TableHead>}
              {columns.permissions && <TableHead>Permissions</TableHead>}
              {columns.tags && <TableHead>Tags</TableHead>}
              {columns.status && <TableHead>Status</TableHead>}
              {columns.created && <TableHead>Created</TableHead>}
              {columns.lastModified && <TableHead>Last Modified</TableHead>}
              {columns.createdBy && <TableHead>Created By</TableHead>}

              <TableHead className="w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: size }).map((_, i) => (
                <RoleTableRowSkeleton key={i} columns={columns} />
              ))}
            {!loading &&
              roles &&
              roles.map((role: InternalRole) => (
                <RoleTableRow
                  key={role.id}
                  role={role}
                  columns={columns}
                  isSelected={selectedRoles.includes(role.id)}
                  onSelectChange={(checked) => handleSelectRole(role.id, checked)}
                />
              ))}
          </TableBody>
        </StickyTable>
      </ScrollArea>
    </div>
  );
};
