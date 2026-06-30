import { Card, CardContent } from "@/components/ui/card";
import { AuditEntry } from "../../data/audit-trail";

interface AuditStatsProps {
  auditEntries: AuditEntry[];
}

export const AuditStats = ({ auditEntries }: AuditStatsProps) => {
  const totalEntries = auditEntries.length;
  const createdEntries = auditEntries.filter(
    (entry) => entry.action === "CREATE"
  ).length;
  const updatedEntries = auditEntries.filter(
    (entry) => entry.action === "UPDATE"
  ).length;
  const deletedEntries = auditEntries.filter(
    (entry) => entry.action === "DELETE"
  ).length;

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-brand-teal">
            {totalEntries}
          </div>
          <div className="text-sm text-muted-foreground">Total Entries</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {createdEntries}
          </div>
          <div className="text-sm text-muted-foreground">Created</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {updatedEntries}
          </div>
          <div className="text-sm text-muted-foreground">Updated</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {deletedEntries}
          </div>
          <div className="text-sm text-muted-foreground">Deleted</div>
        </CardContent>
      </Card>
    </div>
  );
};
