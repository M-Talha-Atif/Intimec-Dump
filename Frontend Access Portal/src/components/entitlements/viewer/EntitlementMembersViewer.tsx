import React, { useState, useMemo } from "react";
import { EntitlementResponseDto } from "@/types/entitlements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import CustomPagination from "@/components/applications/common/CustomPagination";
import {
  Users,
  Search,
  Download,
  Eye,
  User,
  Users as GroupIcon,
  Loader2,
} from "lucide-react";
import { useEntitlementMembers, EntitlementMember } from "@/hooks/useEntitlements";
import { useIdentity } from "@/hooks/identities";
import { IdentityDTO, attr } from "@/types/identity";
import { IDENTITY_ENTITY_TYPES } from "@/constants/identity";
import IdentityDetailPanel from "@/components/users/IdentityDetailPanel";
import { type User as IdentityUser } from "@/data/mock-users";

interface EntitlementMembersViewerProps {
  entitlement: EntitlementResponseDto;
  readOnly?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDate = (timestamp: number): string => {
  if (!timestamp) return "N/A";
  return new Date(timestamp).toLocaleDateString();
};

const getSourceDisplay = (source: string): string => {
  const sourceMap: Record<string, string> = {
    IMPORT: "Direct",
    DIRECT: "Direct",
    ROLE: "Role",
    GROUP: "Group",
  };
  return sourceMap[source] || source;
};

const getMockRiskLevel = (member: EntitlementMember): "HIGH" | "MEDIUM" | "LOW" => {
  const hash = member.accountName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  if (hash % 3 === 0) return "HIGH";
  if (hash % 3 === 1) return "MEDIUM";
  return "LOW";
};

const getMockStatus = (): "Active" | "Disabled" => "Active";

const getMockExpiry = (): string => "Never";

const getMemberPath = (member: EntitlementMember): string => {
  const source = getSourceDisplay(member.source);
  if (source === "Direct") return "Direct Assignment";
  if (source.toLocaleLowerCase() === "dynamic") return "Dynamic Assignment";
  if (source === "Role") return `Role: ${member.shadowId?.substring(0, 8) || "Unknown"}`;
  if (source === "Group") return `Group: ${member.shadowId?.substring(0, 8) || "Unknown"}`;
  return "Unknown";
};

const resolveName = (identity: IdentityDTO | undefined, accountName: string): string => {
  if (!identity) return accountName;
  const first = attr(identity, "firstName") ?? "";
  const last = attr(identity, "lastName") ?? "";
  const display = attr(identity, "displayName");
  if (display) return display;
  const full = `${first} ${last}`.trim();
  return full || accountName;
};

const buildIdentityUser = (
  identityId: string,
  identity: IdentityDTO | undefined,
  fallbackName: string,
  risk: "HIGH" | "MEDIUM" | "LOW",
  assignedOn: string,
): IdentityUser => {
  const name = resolveName(identity, fallbackName);
  const department = identity ? attr(identity, "department") : undefined;
  const manager = identity ? (attr(identity, "managerRef") ?? attr(identity, "managerId")) : undefined;
  const statusRaw = identity?.status ?? "ACTIVE";
  const status: IdentityUser["status"] =
    statusRaw === "ACTIVE" ? "Active"
      : statusRaw === "INACTIVE" ? "Inactive"
        : statusRaw === "SUSPENDED" ? "Suspended"
          : statusRaw === "TERMINATED" ? "Terminated"
            : statusRaw === "PENDING" ? "Pending"
              : statusRaw === "EXPIRED" ? "Expired"
                : "Archived";

  return {
    id: identityId,
    name,
    department,
    manager,
    type: "Employee",
    team: 0,
    status,
    lastUpdated: assignedOn,
    riskLevel: risk === "HIGH" ? "High" : risk === "MEDIUM" ? "Medium" : "Low",
    aiAnalysis: "Pending Review",
  };
};

// ---------------------------------------------------------------------------
// MemberRow
// ---------------------------------------------------------------------------

type MemberRowData = {
  id: string;
  identityId: string;
  accountName: string;
  source: string;
  path: string;
  status: "Active" | "Disabled";
  assignedOn: string;
  expiresOn: string;
  risk: "HIGH" | "MEDIUM" | "LOW";
};

interface MemberRowProps {
  member: MemberRowData;
  getSourceIcon: (source: string) => React.ReactNode;
  getRiskColor: (risk: string) => string;
  onView: (user: IdentityUser) => void;
  readOnly?: boolean;
}

const MemberRow: React.FC<MemberRowProps> = ({ member, getSourceIcon, getRiskColor, onView, readOnly = false }) => {
  const { data: identity, isLoading } = useIdentity(IDENTITY_ENTITY_TYPES.EMPLOYEE, member.identityId);

  const displayName = resolveName(identity, member.accountName);
  const email = identity ? attr(identity, "email") : undefined;

  const handleView = () => {
    onView(buildIdentityUser(member.identityId, identity, member.accountName, member.risk, member.assignedOn));
  };

  return (
    <TableRow
      onClick={readOnly ? undefined : handleView}
      className={readOnly ? undefined : "cursor-pointer"}
    >
      <TableCell>
        {isLoading ? (
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        ) : (
          <div>
            <div className="font-medium">{displayName}</div>
            <div className="text-sm text-muted-foreground">{email}</div>
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {getSourceIcon(member.source)}
          <span>
            {member.source.charAt(0).toUpperCase() + member.source.slice(1).toLowerCase()}
          </span>
        </div>
      </TableCell>
      <TableCell>
        {member.source === "Role" ? (
          <Button variant="link" className="p-0 h-auto text-primary">
            {member.path}
          </Button>
        ) : (
          <span>{member.path}</span>
        )}
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={
            member.status === "Active"
              ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 font-normal"
              : "bg-muted text-muted-foreground font-normal"
          }
        >
          {member.status}
        </Badge>
      </TableCell>
      <TableCell>{member.assignedOn}</TableCell>
      <TableCell>{member.expiresOn}</TableCell>

      {!readOnly && (
        <TableCell>
          <Badge variant="outline" className={`${getRiskColor(member.risk)} font-normal`}>
            {member.risk?.charAt(0).toUpperCase() + member.risk?.slice(1).toLowerCase()}
          </Badge>
        </TableCell>
      )}
      {!readOnly && (
        <TableCell>
          <Button variant="ghost" size="sm" onClick={handleView}>
            <Eye className="h-4 w-4 mr-1" /> View
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const EntitlementMembersViewer: React.FC<EntitlementMembersViewerProps> = ({
  entitlement,
  readOnly = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [riskFilter, setRiskFilter] = useState("All Risk");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedIdentityUser, setSelectedIdentityUser] = useState<IdentityUser | null>(null);

  const {
    members: apiMembers,
    totalElements,
    loading,
    error,
    refresh,
    goToPage,
    changePageSize,
    currentPage,
    pageSize,
    totalPages,
  } = useEntitlementMembers(entitlement.id, {
    autoFetch: true,
    initialPage: 0,
    initialSize: 20,
  });

  const members: MemberRowData[] = useMemo(() => {
    return apiMembers.map((member: EntitlementMember) => ({
      id: member.assignmentId,
      identityId: member.identityId,
      accountName: member.accountName,
      source: getSourceDisplay(member.source),
      path: getMemberPath(member),
      status: getMockStatus(),
      assignedOn: formatDate(member.assignedAt),
      expiresOn: getMockExpiry(),
      risk: getMockRiskLevel(member),
    }));
  }, [apiMembers]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (searchQuery && !m.accountName.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      if (sourceFilter !== "All Sources" && m.source !== sourceFilter) return false;
      if (riskFilter !== "All Risk" && m.risk !== riskFilter) return false;
      if (statusFilter !== "All Status" && m.status !== statusFilter) return false;
      return true;
    });
  }, [members, searchQuery, sourceFilter, riskFilter, statusFilter]);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "Direct": return <User className="h-4 w-4" />;
      case "Role": return <Badge variant="outline" className="text-xs">R</Badge>;
      case "Group": return <GroupIcon className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "HIGH": return "bg-destructive/10 text-destructive border-destructive/20";
      case "MEDIUM": return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400";
      case "LOW": return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            <p>Error loading members: {error}</p>
            <Button onClick={refresh} variant="outline" className="mt-4">Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Member Search & Filters</h3>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by account name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All Sources">All Sources</SelectItem>
            <SelectItem value="Direct">Direct</SelectItem>
            <SelectItem value="Role">Role</SelectItem>
            <SelectItem value="Group">Group</SelectItem>
          </SelectContent>
        </Select>
        {!readOnly && (
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All Risk">All Risk</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All Status">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>
              Effective Members ({filteredMembers.length}
              {totalElements > members.length ? ` of ${totalElements}` : ""})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned On</TableHead>
                    <TableHead>Expires On</TableHead>
                    {!readOnly && <TableHead>Risk</TableHead>}
                    {!readOnly && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      getSourceIcon={getSourceIcon}
                      getRiskColor={getRiskColor}
                      onView={setSelectedIdentityUser}
                      readOnly={readOnly}
                    />
                  ))}
                  {filteredMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={readOnly ? 6 : 8} className="text-center text-muted-foreground py-8">
                        No members match the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <CustomPagination
                useCallbackMode={true}
                totalElements={totalElements}
                totalPages={totalPages}
                page={currentPage}
                size={pageSize}
                defaultSize={20}
                onPageChange={(zeroBasedPage) => goToPage(zeroBasedPage)}
                onSizeChange={(newSize) => changePageSize(newSize)}
              />
            </>
          )}
        </CardContent>
      </Card>

      {!readOnly && (
        <Dialog
          open={!!selectedIdentityUser}
          onOpenChange={(open) => { if (!open) setSelectedIdentityUser(null); }}
        >
          <DialogContent className="max-w-4xl p-0">
            <VisuallyHidden>
              <DialogTitle>Identity Details</DialogTitle>
            </VisuallyHidden>
            {selectedIdentityUser && (
              <IdentityDetailPanel
                user={selectedIdentityUser}
                onClose={() => setSelectedIdentityUser(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EntitlementMembersViewer;