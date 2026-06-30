"use client";

import {
  X,
  Shield,
  FileText,
  Settings,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CustomBadge from "@/components/applications/common/CustomBadge";
import { riskBadgeMap } from "@/components/applications/common/badgeMap";
import { EntitlementWithUsersMeta } from "@/components/applications/types";
import useEntitlementMembers from "@/hooks/applications/useEntitlementMembers";
import { Skeleton } from "@/components/ui/skeleton";

interface EntitlementDetailPanelProps {
  entitlement: EntitlementWithUsersMeta;
  appId: string;
  onClose: () => void;
}

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) =>
  value !== null && value !== undefined ? (
    <div className="flex justify-between items-start py-2 border-b border-border/50 last:border-b-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-right">{value}</dd>
    </div>
  ) : null;

const lifecycleBadgeMap: Record<string, string> = {
  Active: "bg-green-100 text-green-800 border-green-200",
  Deprecated: "bg-muted text-foreground border-border",
  Orphaned: "bg-orange-100 text-orange-800 border-orange-200",
  Inactive: "bg-red-100 text-red-800 border-red-200",
};

const privilegeBadgeMap: Record<string, string> = {
  Read: "bg-sky-100 text-sky-800 border-sky-200",
  Write: "bg-amber-100 text-amber-800 border-amber-200",
  Admin: "bg-rose-100 text-rose-800 border-rose-200",
};

export default function EntitlementDetailPanel({
  entitlement,
  appId,
  onClose,
}: EntitlementDetailPanelProps) {
  const { members, isLoading: membersLoading } = useEntitlementMembers(
    appId,
    entitlement.id
  );

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="p-0 gap-0 flex flex-col overflow-hidden [&>button:last-child]:hidden">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b flex-shrink-0">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5 flex-1 min-w-0 pr-4">
              <h2 className="text-xl font-bold truncate">
                {entitlement.name || "Unnamed Entitlement"}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {entitlement.type || "entitlement"}
                </Badge>
                {entitlement.riskLevel && (
                  <CustomBadge
                    color={riskBadgeMap[entitlement.riskLevel] || "gray"}
                  >
                    {entitlement.riskLevel}
                  </CustomBadge>
                )}
                {entitlement.lifecycle && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${lifecycleBadgeMap[entitlement.lifecycle] || ""}`}
                  >
                    {entitlement.lifecycle}
                  </Badge>
                )}
                {entitlement.requestable && (
                  <Badge
                    variant="outline"
                    className="text-xs text-blue-600 border-blue-300 bg-blue-50"
                  >
                    Requestable
                  </Badge>
                )}
              </div>
              {entitlement.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {entitlement.description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* 3-Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Core Metadata - matches Lovable */}
          <Card className="border-l-4 border-l-blue-400">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" /> Core Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <dl>
                <DetailItem label="Name" value={entitlement.name} />
                <DetailItem
                  label="Type"
                  value={
                    <Badge variant="outline" className="text-xs">
                      {entitlement.type || "entitlement"}
                    </Badge>
                  }
                />
                <DetailItem
                  label="Requestable"
                  value={entitlement.requestable ? "Yes" : "No"}
                />
                <DetailItem
                  label="Privilege Level"
                  value={
                    entitlement.privilegeLevel ? (
                      <Badge
                        variant="outline"
                        className={`text-xs ${privilegeBadgeMap[entitlement.privilegeLevel] || ""}`}
                      >
                        {entitlement.privilegeLevel}
                      </Badge>
                    ) : (
                      "—"
                    )
                  }
                />
                <DetailItem
                  label="Classification"
                  value={
                    entitlement.classification &&
                    entitlement.classification.length > 0 ? (
                      <div className="flex flex-wrap gap-1 justify-end">
                        {entitlement.classification.map((c) => (
                          <Badge
                            key={c}
                            variant={c === "High Risk" ? "destructive" : "outline"}
                            className="text-xs"
                          >
                            {c}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )
                  }
                />
              </dl>
            </CardContent>
          </Card>

          {/* Description & Risk - matches Lovable */}
          <Card className="border-l-4 border-l-amber-400">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-500" /> Description & Risk
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <dl>
                <DetailItem
                  label="Risk Level"
                  value={
                    entitlement.riskLevel ? (
                      <CustomBadge
                        color={riskBadgeMap[entitlement.riskLevel] || "gray"}
                      >
                        {entitlement.riskLevel}
                      </CustomBadge>
                    ) : (
                      <span className="text-muted-foreground">Unknown</span>
                    )
                  }
                />
                <DetailItem
                  label="Risk Reason"
                  value={
                    <span className="text-xs">
                      {entitlement.riskReason || "No reason provided."}
                    </span>
                  }
                />
                <DetailItem
                  label="Description"
                  value={
                    <span className="text-xs">
                      {entitlement.description || "No description provided."}
                    </span>
                  }
                />
                <DetailItem
                  label="Lifecycle"
                  value={
                    <Badge
                      variant="outline"
                      className={`text-xs ${lifecycleBadgeMap[entitlement.lifecycle] || ""}`}
                    >
                      {entitlement.lifecycle || "Active"}
                    </Badge>
                  }
                />
              </dl>
            </CardContent>
          </Card>

          {/* Governance - matches Lovable */}
          <Card className="border-l-4 border-l-purple-400">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-purple-500" /> Governance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <dl>
                <DetailItem
                  label="Owner"
                  value={
                    entitlement.owner ? (
                      <span className="underline">{entitlement.owner}</span>
                    ) : (
                      <Badge className="bg-red-100/60 text-red-800 border border-red-200 hover:bg-red-100 text-xs gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Unowned
                      </Badge>
                    )
                  }
                />
                <DetailItem
                  label="Require Approval"
                  value={entitlement.requireApproval ? "Yes" : "No"}
                />
                <DetailItem
                  label="Auto Grant"
                  value={
                    entitlement.AllowedAutomatedGrant
                      ? "Allowed"
                      : "Not Allowed"
                  }
                />
                <DetailItem
                  label="Users Assigned"
                  value={
                    <span className="font-semibold text-blue-600">
                      {entitlement.assignedUsersCount}
                    </span>
                  }
                />
              </dl>
              <div className="flex flex-wrap gap-1.5 mt-4">
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Initiate Review
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Assign Owner
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Deprecate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Membership Table - matches Lovable */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Membership ({entitlement.assignedUsersCount} Users)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {membersLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            ) : members.length > 0 ? (
              <div className="border rounded-md max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted/80">
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Department</TableHead>
                      <TableHead className="text-xs">Risk Level</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.assignmentId}>
                        <TableCell className="font-medium text-sm">
                          {member.identityName || member.accountName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {member.department || "—"}
                        </TableCell>
                        <TableCell>
                          {member.riskLevel ? (
                            <Badge
                              variant={member.riskLevel === "High" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {member.riskLevel}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              member.status === "Active"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-muted text-foreground border-border"
                            }`}
                          >
                            {member.status || "Active"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                No members assigned to this entitlement.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      </SheetContent>
    </Sheet>
  );
}
