import { Badge } from "@/components/ui/badge";
import { Settings, RefreshCw } from "lucide-react";
import { AuditEntry } from "../data/audit-trail";

export const getActionBadge = (action: AuditEntry["action"]) => {
  switch (action) {
    case "CREATE":
      return <Badge className="bg-green-100 text-green-800">CREATE</Badge>;
    case "UPDATE":
      return <Badge className="bg-blue-100 text-blue-800">UPDATE</Badge>;
    case "DELETE":
      return <Badge className="bg-red-100 text-red-800">DELETE</Badge>;
    case "BULK_UPDATE":
      return (
        <Badge className="bg-purple-100 text-purple-800">BULK_UPDATE</Badge>
      );
    case "SYNC":
      return <Badge className="bg-orange-100 text-orange-800">SYNC</Badge>;
    default:
      return <Badge variant="secondary">{action}</Badge>;
  }
};

export const getActionIcon = (action: AuditEntry["action"]) => {
  switch (action) {
    case "CREATE":
      return <Settings className="h-4 w-4 text-green-600" />;
    case "UPDATE":
      return <Settings className="h-4 w-4 text-blue-600" />;
    case "DELETE":
      return <Settings className="h-4 w-4 text-red-600" />;
    case "BULK_UPDATE":
      return <Settings className="h-4 w-4 text-purple-600" />;
    case "SYNC":
      return <RefreshCw className="h-4 w-4 text-orange-600" />;
    default:
      return <Settings className="h-4 w-4 text-gray-600" />;
  }
};

export const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
};

export const getUniqueUsers = (entries: AuditEntry[]) => {
  return Array.from(new Set(entries.map((entry) => entry.user)));
};

export const filterAuditEntries = (
  entries: AuditEntry[],
  searchTerm: string,
  actionFilter: string,
  userFilter: string
) => {
  return entries.filter((entry) => {
    const matchesSearch =
      entry.mapping.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.changes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction =
      actionFilter === "all" || entry.action === actionFilter;
    const matchesUser = userFilter === "all" || entry.user === userFilter;

    // Time filter logic (simplified for demo)
    const matchesTime = true; // In real implementation, would filter by timestamp

    return matchesSearch && matchesAction && matchesUser && matchesTime;
  });
};

export const exportToCSV = (entries: AuditEntry[], identityType: string) => {
  const csvContent = [
    [
      "Timestamp",
      "Action",
      "User",
      "Mapping",
      "Changes",
      "Source System",
      "Impact",
      "Details",
    ],
    ...entries.map((entry) => [
      entry.timestamp,
      entry.action,
      entry.user,
      entry.mapping,
      entry.changes,
      entry.sourceSystem,
      entry.impact.toString(),
      entry.details,
    ]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `identity-mapping-audit-${identityType}-${
    new Date().toISOString().split("T")[0]
  }.csv`;
  a.click();
  URL.revokeObjectURL(url);

  return entries.length;
};
