import { TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { SortableHeader } from "./SortableHeader";
import type { SortConfig } from "../types/table";

interface EntitlementTableHeaderProps {
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  headerCheckboxState: boolean | "indeterminate";
  onSelectAllOnPage: (checked: boolean | "indeterminate") => void;
}

export const EntitlementTableHeader = ({
  sortConfig,
  onSort,
  headerCheckboxState,
  onSelectAllOnPage,
}: EntitlementTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[40px] px-4">
          <Checkbox
            onCheckedChange={onSelectAllOnPage}
            checked={headerCheckboxState}
            aria-label="Select all rows on this page"
          />
        </TableHead>
        <TableHead className="whitespace-nowrap">
          <SortableHeader
            sortKey="application"
            sortConfig={sortConfig}
            onSort={onSort}
          >
            Application
          </SortableHeader>
        </TableHead>
        <TableHead className="whitespace-nowrap">
          <SortableHeader
            sortKey="attribute"
            sortConfig={sortConfig}
            onSort={onSort}
          >
            Attribute
          </SortableHeader>
        </TableHead>
        <TableHead className="whitespace-nowrap">
          <SortableHeader
            sortKey="displayName"
            sortConfig={sortConfig}
            onSort={onSort}
          >
            Display Name
          </SortableHeader>
        </TableHead>
        <TableHead className="whitespace-nowrap">
          <SortableHeader
            sortKey="type"
            sortConfig={sortConfig}
            onSort={onSort}
          >
            Type
          </SortableHeader>
        </TableHead>
        <TableHead>Description</TableHead>
        <TableHead className="whitespace-nowrap">
          <SortableHeader
            sortKey="owner"
            sortConfig={sortConfig}
            onSort={onSort}
          >
            Owner
          </SortableHeader>
        </TableHead>
        <TableHead className="whitespace-nowrap">
          <SortableHeader
            sortKey="assignedUsersCount"
            sortConfig={sortConfig}
            onSort={onSort}
          >
            Users
          </SortableHeader>
        </TableHead>
        <TableHead className="whitespace-nowrap">
          <SortableHeader
            sortKey="lastUsed"
            sortConfig={sortConfig}
            onSort={onSort}
          >
            Last Used
          </SortableHeader>
        </TableHead>
        <TableHead className="whitespace-nowrap">
          <Button variant="ghost" size="sm">
            Requestable{" "}
            <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />
          </Button>
        </TableHead>
        <TableHead>Classification</TableHead>
      </TableRow>
    </TableHeader>
  );
};
