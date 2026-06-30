import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { AuditEntry } from "../../data/audit-trail";
import {
  getActionBadge,
  getActionIcon,
  formatTimestamp,
} from "../../utils/audit-trail-utils";

interface AuditTableProps {
  auditEntries: AuditEntry[];
  onViewDetails: (entry: AuditEntry) => void;
}

export const AuditTable = ({
  auditEntries,
  onViewDetails,
}: AuditTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Mapping</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Changes</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Impact</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditEntries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>
                <div className="text-sm">
                  {formatTimestamp(entry.timestamp)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getActionIcon(entry.action)}
                  {getActionBadge(entry.action)}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm">{entry.mapping}</span>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{entry.user}</div>
                  <div className="text-sm text-muted-foreground">
                    {entry.userRole}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{entry.changes}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {entry.sourceSystem}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {entry.impact > 0 ? (
                    <Badge className="bg-orange-100 text-orange-800">
                      {entry.impact.toLocaleString()} affected
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">No impact</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(entry)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
